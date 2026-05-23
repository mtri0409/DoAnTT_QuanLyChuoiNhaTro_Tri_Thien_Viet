import os
import torch
import cv2
import threading
import queue
import time
import json
import re
from collections import defaultdict, Counter
from ultralytics import YOLO
from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg
from PIL import Image
from datetime import datetime

# ==========================================
# 1. TỐI ƯU CPU CHO PYTORCH
# ==========================================
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"
torch.set_num_threads(2)

# ==========================================
# CẤU HÌNH HỆ THỐNG
# ==========================================
MODEL_PATH = "runs/best_plate.pt"  
VIDEO_SOURCE = "0"                 
FRAMES_TO_COLLECT = 5              

# Regex chuẩn biển số Việt Nam (VD: 43C112345, 51H12345)
PLATE_REGEX = re.compile(r"^\d{2}[A-Z][0-9A-Z]\d{3,6}$")

yolo_model = YOLO(MODEL_PATH)
cfg = Cfg.load_config_from_name('vgg_transformer')
cfg['device'] = 'cpu'
ocr_predictor = Predictor(cfg)

# ==========================================
# CÁC HÀM TIỆN ÍCH (UTILS)
# ==========================================
def clean_and_validate_plate(raw_text: str) -> str:
    if not raw_text:
        return None
    cleaned = re.sub(r'[\W_]+', '', raw_text).upper()
    if PLATE_REGEX.match(cleaned):
        return cleaned
    return None

def crop_image(frame, box):
    x1, y1, x2, y2 = map(int, box)
    h, w = frame.shape[:2]
    x1, y1 = max(0, x1 - 2), max(0, y1 - 2)
    x2, y2 = min(w, x2 + 2), min(h, y2 + 2)
    return frame[y1:y2, x1:x2].copy()

# ==========================================
# LUỒNG ĐỌC CAMERA
# ==========================================
class FrameReader(threading.Thread):
    def __init__(self, source):
        super().__init__(daemon=True)
        self.cap = cv2.VideoCapture(int(source) if source.isdigit() else source)
        self.frame = None
        self.lock = threading.Lock()
        self.stopped = False
        self.is_webcam = source.isdigit()
        
    def run(self):
        while not self.stopped:
            ok, frame = self.cap.read()
            if not ok:
                if self.is_webcam:
                    time.sleep(0.01)
                    continue
                self.stopped = True
                break
                
            with self.lock:
                self.frame = frame
                
    def read(self):
        with self.lock:
            return None if self.frame is None else self.frame.copy()

    def stop(self):
        self.stopped = True
        self.cap.release()

# ==========================================
# LUỒNG XỬ LÝ OCR (TÍCH HỢP LOGIC BSV / BSD)
# ==========================================
class OcrWorker(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.in_q = queue.Queue()
        self.stopped = False

    def run(self):
        while not self.stopped:
            try:
                # Nhận batch gồm track_id và list các tuple (crop_img, class_name)
                track_id, crops_data = self.in_q.get(timeout=0.5)
            except queue.Empty:
                continue

            raw_reads = []          
            valid_candidates = []   
            
            # Duyệt qua 5 ảnh cùng class_name của nó
            for crop, class_name in crops_data:
                if crop.size == 0: 
                    raw_reads.append("[EMPTY_CROP]")
                    continue
                
                try:
                    # ========================================
                    # ÁP DỤNG LOGIC BIỂN VUÔNG / BIỂN DÀI TỪ YOLO
                    # ========================================
                    if class_name == 'BSV':
                        # Cắt đôi biển vuông
                        h, w = crop.shape[:2]
                        split_point = int(h * 0.5)
                        
                        top_half = crop[:split_point, :]
                        bottom_half = crop[split_point:, :]
                        
                        pil_top = Image.fromarray(cv2.cvtColor(top_half, cv2.COLOR_BGR2RGB))
                        pil_bot = Image.fromarray(cv2.cvtColor(bottom_half, cv2.COLOR_BGR2RGB))
                        
                        text_top = ocr_predictor.predict(pil_top).replace("-", "").replace(".", "").strip()
                        text_bot = ocr_predictor.predict(pil_bot).replace("-", "").replace(".", "").strip()
                        
                        raw_text = f"{text_top}{text_bot}"
                        
                    else:
                        # Biển dài (BSD)
                        pil_img = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
                        raw_text = ocr_predictor.predict(pil_img)
                    
                    # Lưu lại kết quả đọc thô
                    raw_reads.append(raw_text if raw_text.strip() else "[BLANK]")
                    
                    # Kiểm tra Regex
                    valid_plate = clean_and_validate_plate(raw_text)
                    if valid_plate:
                        valid_candidates.append(valid_plate)
                        
                except Exception as e:
                    print(f"[Lỗi OCR] {e}")
                    raw_reads.append("[OCR_ERROR]")

            # Tính toán kết quả chốt
            unique_valid_plates = list(set(valid_candidates)) 
            
            if valid_candidates:
                counter = Counter(valid_candidates)
                best_plate, count = counter.most_common(1)[0]
                status = "SUCCESS"
            else:
                best_plate = None
                count = 0
                status = "FAILED"
                
            payload = {
                "track_id": int(track_id),
                "status": status,
                "best_plate": best_plate,
                "confidence_votes": f"{count}/{len(crops_data)}",
                "unique_valid_plates": unique_valid_plates, 
                "raw_5_reads": raw_reads,                   
                "timestamp": datetime.now().isoformat()
            }
            
            json_string = json.dumps(payload, ensure_ascii=False, indent=2) 
            
            print("\n" + "="*50)
            if status == "SUCCESS":
                print(f"✅ GỬI SANG JAVA (TRACK {track_id}):")
            else:
                print(f"❌ THẤT BẠI (TRACK {track_id}) - KHÔNG QUA ĐƯỢC REGEX:")
            
            print(json_string)
            print("="*50 + "\n")

    def submit_batch(self, track_id, crops_data):
        self.in_q.put((track_id, crops_data))

    def stop(self):
        self.stopped = True

# ==========================================
# LUỒNG CHÍNH (MAIN LOOP)
# ==========================================
def main():
    reader = FrameReader(VIDEO_SOURCE)
    ocr_worker = OcrWorker()
    
    reader.start()
    ocr_worker.start()

    plate_buffer = defaultdict(list)
    processed_tracks = set()

    print("🚀 Hệ thống bắt đầu chạy... Nhấn [Q] để thoát.")
    
    while not reader.stopped:
        frame = reader.read()
        if frame is None:
            time.sleep(0.01)
            continue

        if frame.shape[1] > 1280:
            frame = cv2.resize(frame, (1280, int(frame.shape[0] * (1280/frame.shape[1]))))

        results = yolo_model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False, conf=0.5)

        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu().numpy()
            track_ids = results[0].boxes.id.int().cpu().numpy()
            class_ids = results[0].boxes.cls.int().cpu().numpy() # Lấy thêm mảng class_id

            # Zip thêm class_id vào vòng lặp
            for box, track_id, cls_id in zip(boxes, track_ids, class_ids):
                # Ánh xạ class_id ra tên (VD: 'BSV' hoặc 'BSD')
                class_name = yolo_model.names[cls_id]
                
                x1, y1, x2, y2 = map(int, box)
                
                # Đổi màu khung dựa theo BSV hay BSD cho dễ nhìn
                color = (255, 150, 0) if class_name == 'BSV' else (0, 255, 0)
                
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                cv2.putText(frame, f"ID:{track_id} {class_name}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                if track_id not in processed_tracks:
                    crop_img = crop_image(frame, box)
                    
                    if crop_img.shape[0] < 10 or crop_img.shape[1] < 10:
                        continue
                        
                    # Lưu kèm tên class (BSV/BSD) vào buffer để Worker biết đường xử lý
                    plate_buffer[track_id].append((crop_img, class_name))
                    
                    cv2.putText(frame, f"Gom: {len(plate_buffer[track_id])}/{FRAMES_TO_COLLECT}", 
                                (x1, y2 + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 1)

                    if len(plate_buffer[track_id]) == FRAMES_TO_COLLECT:
                        ocr_worker.submit_batch(track_id, plate_buffer[track_id].copy())
                        processed_tracks.add(track_id)
                        del plate_buffer[track_id]

        cv2.imshow("Smart Parking ALPR", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    reader.stop()
    ocr_worker.stop()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()