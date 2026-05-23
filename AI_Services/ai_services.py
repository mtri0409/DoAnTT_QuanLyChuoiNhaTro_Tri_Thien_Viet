import os
from dotenv import load_dotenv
load_dotenv()  # ← PHẢI Ở ĐÂY, trước mọi os.getenv()

import cv2
import uvicorn
import threading
import queue
import time
import json
import requests
import re
import numpy as np
from pathlib import Path
from collections import defaultdict, Counter
from datetime import datetime
from PIL import Image
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg
import torch
import base64  


# ==================== TỐI ƯU CPU CHO PYTORCH ====================
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"
torch.set_num_threads(2)

# ==================== CẤU HÌNH HỆ THỐNG ====================
app = FastAPI(title="AI Detection & Streaming Service", version="3.0.0")

WATER_MODEL_PATH = Path("runs/best_water.pt")
PLATE_MODEL_PATH = Path("runs/best_plate.pt")
DEBUG_DIR = Path("debug_outputs")
DEBUG_DIR.mkdir(exist_ok=True)

VIDEO_SOURCE = "0"  # Thay bằng URL RTSP nếu dùng camera IP
FRAMES_TO_COLLECT = 5

JAVA_API_URL = os.getenv("API_BACKEND_URL", "http://localhost:8080/api/ai") + "/receive-plate"  # Webhook Backend Java

PLATE_REGEX = re.compile(r"^\d{2}[A-Z][0-9A-Z]\d{3,6}$")

# Biến toàn cục lưu frame mới nhất đã vẽ AI để phát lên Web
latest_annotated_frame = None
frame_lock = threading.Lock()

# ==================== KHỞI TẠO MODELS ====================
water_model = YOLO(str(WATER_MODEL_PATH)) if WATER_MODEL_PATH.exists() else None
plate_model = YOLO(str(PLATE_MODEL_PATH)) if PLATE_MODEL_PATH.exists() else None

try:
    config = Cfg.load_config_from_name('vgg_transformer')
    config['device'] = 'cpu'
    ocr_predictor = Predictor(config)
except Exception as e:
    ocr_predictor = None
    print(f"[WARN] VietOCR failed: {e}")

# ==================== CÁC HÀM TIỆN ÍCH ====================
def clean_and_validate_plate(raw_text: str) -> str:
    if not raw_text: return None
    cleaned = re.sub(r'[\W_]+', '', raw_text).upper()
    return cleaned if PLATE_REGEX.match(cleaned) else None

def crop_image(frame, box):
    x1, y1, x2, y2 = map(int, box)
    h, w = frame.shape[:2]
    x1, y1 = max(0, x1 - 2), max(0, y1 - 2)
    x2, y2 = min(w, x2 + 2), min(h, y2 + 2)
    return frame[y1:y2, x1:x2].copy()

# ==================== LUỒNG 1: ĐỌC CAMERA ====================
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
                    time.sleep(0.01); continue
                self.stopped = True; break
                
            with self.lock:
                self.frame = frame
                
    def read(self):
        with self.lock:
            return None if self.frame is None else self.frame.copy()

    def stop(self):
        self.stopped = True
        self.cap.release()

# ==================== LUỒNG 2: XỬ LÝ OCR & GỬI JAVA ====================
class OcrWorker(threading.Thread):
    def __init__(self):
        super().__init__(daemon=True)
        self.in_q = queue.Queue()
        self.stopped = False

    def crop_to_base64(self, crop_img):
        """Chuyển ảnh crop thành base64 để gửi qua JSON"""
        try:
            _, buffer = cv2.imencode('.jpg', crop_img, [cv2.IMWRITE_JPEG_QUALITY, 80])
            return base64.b64encode(buffer).decode('utf-8')
        except Exception as e:
            print(f"[ERROR] Chuyển ảnh sang base64 lỗi: {e}")
            return None

    def run(self):
        while not self.stopped:
            try:
                track_id, crops_data = self.in_q.get(timeout=0.5)
            except queue.Empty:
                continue

            raw_reads, valid_candidates = [], []
            best_crop_base64 = None  # Lưu ảnh crop tốt nhất
            
            for idx, (crop, class_name) in enumerate(crops_data):
                if crop.size == 0: continue
                try:
                    if class_name == 'BSV':
                        h = crop.shape[0]
                        split_point = int(h * 0.5)
                        pil_top = Image.fromarray(cv2.cvtColor(crop[:split_point, :], cv2.COLOR_BGR2RGB))
                        pil_bot = Image.fromarray(cv2.cvtColor(crop[split_point:, :], cv2.COLOR_BGR2RGB))
                        text_top = ocr_predictor.predict(pil_top).replace("-", "").replace(".", "").strip()
                        text_bot = ocr_predictor.predict(pil_bot).replace("-", "").replace(".", "").strip()
                        raw_text = f"{text_top}{text_bot}"
                    else:
                        pil_img = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
                        raw_text = ocr_predictor.predict(pil_img)
                    
                    raw_reads.append(raw_text if raw_text.strip() else "[BLANK]")
                    valid_plate = clean_and_validate_plate(raw_text)
                    if valid_plate: 
                        valid_candidates.append(valid_plate)
                        # Lưu ảnh crop của lần đọc thành công đầu tiên
                        if best_crop_base64 is None:
                            best_crop_base64 = self.crop_to_base64(crop)
                        
                except Exception as e:
                    raw_reads.append("[OCR_ERROR]")

            unique_valid_plates = list(set(valid_candidates))
            if valid_candidates:
                best_plate, count = Counter(valid_candidates).most_common(1)[0]
                status = "SUCCESS"
            else:
                best_plate, count, status = None, 0, "FAILED"
                
            payload = {
                "track_id": int(track_id),
                "status": status,
                "best_plate": best_plate,
                "confidence_votes": f"{count}/{len(crops_data)}",
                "unique_valid_plates": unique_valid_plates,
                "raw_5_reads": raw_reads,
                "timestamp": datetime.now().isoformat(),
                "plate_image_base64": best_crop_base64
            }
            
            # ==========================================
            # ĐẨY DATA SANG JAVA VÀ LOG PHẢN HỒI
            # ==========================================
            try:
                print(f"\n🚀 Đang gửi Track {track_id} sang Java: {payload['best_plate'] or 'FAILED'} ...")
                if best_crop_base64:
                    print(f"📸 Có ảnh crop ({len(best_crop_base64)} chars base64)")
                else:
                    print(f"📸 Không có ảnh crop")
                
                response = requests.post(JAVA_API_URL, json=payload, timeout=2)
                
                if response.status_code in [200, 201]:
                    print(f"✅ JAVA ĐÃ NHẬN [Status {response.status_code}]")
                    print(f"💬 Phản hồi từ Java: {response.text}")
                else:
                    print(f"❌ JAVA BÁO LỖI [Status {response.status_code}]")
                    print(f"💬 Chi tiết lỗi từ Java: {response.text}")
                    
            except requests.exceptions.ConnectionError:
                print(f"⚠️ LỖI KẾT NỐI: Không thể kết nối tới {JAVA_API_URL}. Java Backend đang tắt?")
            except requests.exceptions.Timeout:
                print(f"⚠️ LỖI TIMEOUT: Đã kết nối nhưng Java xử lý quá lâu (hơn 2s) không phản hồi!")
            except Exception as e:
                print(f"⚠️ LỖI KHÔNG XÁC ĐỊNH khi gửi tới Java: {e}")
            print("-" * 50)

    def submit_batch(self, track_id, crops_data):
        self.in_q.put((track_id, crops_data))

    def stop(self):
        self.stopped = True

# ==================== LUỒNG 3: NHẬN DIỆN & TRACKING LIÊN TỤC ====================
camera_reader = None
ocr_worker = None

def video_tracking_loop():
    global latest_annotated_frame
    plate_buffer = defaultdict(list)
    processed_tracks = set()

    while not camera_reader.stopped:
        frame = camera_reader.read()
        if frame is None:
            time.sleep(0.01)
            continue

        if frame.shape[1] > 1280:
            frame = cv2.resize(frame, (1280, int(frame.shape[0] * (1280/frame.shape[1]))))

        if plate_model:
            results = plate_model.track(frame, persist=True, tracker="bytetrack.yaml", verbose=False, conf=0.5)
            
            if results[0].boxes.id is not None:
                boxes = results[0].boxes.xyxy.cpu().numpy()
                track_ids = results[0].boxes.id.int().cpu().numpy()
                class_ids = results[0].boxes.cls.int().cpu().numpy()

                for box, track_id, cls_id in zip(boxes, track_ids, class_ids):
                    class_name = plate_model.names[cls_id]
                    x1, y1, x2, y2 = map(int, box)
                    
                    color = (255, 150, 0) if class_name == 'BSV' else (0, 255, 0)
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                    cv2.putText(frame, f"ID:{track_id} {class_name}", (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

                    if track_id not in processed_tracks:
                        crop_img = crop_image(frame, box)
                        if crop_img.shape[0] >= 10 and crop_img.shape[1] >= 10:
                            plate_buffer[track_id].append((crop_img, class_name))
                            cv2.putText(frame, f"Gom: {len(plate_buffer[track_id])}/{FRAMES_TO_COLLECT}", 
                                        (x1, y2 + 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

                            if len(plate_buffer[track_id]) == FRAMES_TO_COLLECT:
                                ocr_worker.submit_batch(track_id, plate_buffer[track_id].copy())
                                processed_tracks.add(track_id)
                                del plate_buffer[track_id]

        # Cập nhật frame để API Web có thể lấy
        with frame_lock:
            latest_annotated_frame = frame.copy()

# ==================== LIFESPAN / KHỞI ĐỘNG CÁC LUỒNG TỰ ĐỘNG ====================
@app.on_event("startup")
def startup_event():
    global camera_reader, ocr_worker
    camera_reader = FrameReader(VIDEO_SOURCE)
    ocr_worker = OcrWorker()
    
    camera_reader.start()
    ocr_worker.start()
    
    # Chạy tracking loop ngầm
    threading.Thread(target=video_tracking_loop, daemon=True).start()
    print("✅ Real-time Video ALPR System Started!")

@app.on_event("shutdown")
def shutdown_event():
    camera_reader.stop()
    ocr_worker.stop()

# ==================== API ENDPOINTS CỦA WEB ====================

def generate_mjpeg_stream():
    """Generator sinh ra các khung hình liên tục cho MJPEG stream"""
    while True:
        with frame_lock:
            if latest_annotated_frame is None:
                time.sleep(0.05)
                continue
            # Nén frame sang định dạng JPEG
            ret, buffer = cv2.imencode('.jpg', latest_annotated_frame)
            frame_bytes = buffer.tobytes()
            
        # Format HTTP chuẩn cho MJPEG
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
        time.sleep(0.03) # Giới hạn ~30 FPS

@app.get("/api/stream")
async def video_feed():
    """API DÀNH RIÊNG CHO WEB ĐỂ XEM CAMERA TRỰC TIẾP"""
    return StreamingResponse(
        generate_mjpeg_stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


def process_water_meter(img: np.ndarray, conf_thresh: float = 0.25):
    if water_model is None: return {"result": "", "error": "Model not loaded"}
    results = water_model(img, verbose=False)[0]
    detections = []
    for box in results.boxes:
        if float(box.conf) >= conf_thresh:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            yolo_value = str(int(box.cls)) if hasattr(box, 'cls') else "?"
            detections.append({"value": yolo_value, "x_center": (x1 + x2) / 2})
            
    detections.sort(key=lambda d: d["x_center"])
    return {"result": "".join(d["value"] for d in detections), "type": "water_meter"}

@app.post("/api/detect")
async def detect_upload(file: UploadFile = File(...), type: str = Query("auto")):
    data = await file.read()
    nparr = np.frombuffer(data, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if type == "water_meter" or (type == "auto" and img.shape[1] / img.shape[0] <= 1.5):
        return JSONResponse(content={"status": "success", **process_water_meter(img, 0.25)})
    return JSONResponse(content={"status": "error", "message": "Only water meter supported for static upload currently."})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")