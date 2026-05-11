import cv2
import threading
import queue
import time
from collections import deque
from datetime import datetime
from PIL import Image
from ultralytics import YOLO
from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg

# ─────────────────────────────────────────────
# 1. KHỞI TẠO MÔ HÌNH
# ─────────────────────────────────────────────
MODEL_PATH  = "runs/best_plate.pt"
TEST_FILE   = "license-video.mp4"
RESULT_FILE = "result.txt"

yolo_model = YOLO(MODEL_PATH)

config = Cfg.load_config_from_name('vgg_transformer')
config['device'] = 'cpu'
ocr_predictor = Predictor(config)

# ─────────────────────────────────────────────
# 2. HÀM ĐỌC BIỂN SỐ (VietOCR)
# ─────────────────────────────────────────────
def read_plate_text(cropped_plate, class_name):
    if cropped_plate is None or cropped_plate.size == 0:
        return ""
    try:
        if class_name == 'BSV':
            h = cropped_plate.shape[0]
            split = int(h * 0.5)
            top    = cropped_plate[:split, :]
            bottom = cropped_plate[split:, :]
            pil_top    = Image.fromarray(cv2.cvtColor(top,    cv2.COLOR_BGR2RGB))
            pil_bottom = Image.fromarray(cv2.cvtColor(bottom, cv2.COLOR_BGR2RGB))
            t1 = ocr_predictor.predict(pil_top   ).replace("-","").replace(".","").strip()
            t2 = ocr_predictor.predict(pil_bottom).replace("-","").replace(".","").strip()
            return f"{t1}-{t2}"
        else:
            pil_img = Image.fromarray(cv2.cvtColor(cropped_plate, cv2.COLOR_BGR2RGB))
            return ocr_predictor.predict(pil_img).replace(".","").replace("-","").strip()
    except:
        return ""

# ─────────────────────────────────────────────
# 3. LUỒNG ĐỌC FRAME — throttle đúng theo FPS video
# ─────────────────────────────────────────────
class FrameReader(threading.Thread):
    def __init__(self, source):
        super().__init__(daemon=True)
        self.cap     = cv2.VideoCapture(source)
        self.frame   = None
        self.lock    = threading.Lock()
        self.stopped = False
        raw_fps      = self.cap.get(cv2.CAP_PROP_FPS)
        self.fps     = raw_fps if raw_fps and raw_fps > 0 else 30.0
        self._delay  = 1.0 / self.fps  # ngủ đủ giây/frame để khớp FPS gốc

    def run(self):
        while not self.stopped:
            t0 = time.perf_counter()
            ok, frame = self.cap.read()
            if not ok:
                self.stopped = True
                break
            with self.lock:
                self.frame = frame
            # Ngủ phần còn lại để không chạy nhanh hơn FPS video
            elapsed = time.perf_counter() - t0
            sleep_t = self._delay - elapsed
            if sleep_t > 0:
                time.sleep(sleep_t)

    def read(self):
        with self.lock:
            return None if self.frame is None else self.frame.copy()

    def stop(self):
        self.stopped = True
        self.cap.release()

# ─────────────────────────────────────────────
# 4. LUỒNG OCR — chạy song song, log kết quả ra file
# ─────────────────────────────────────────────
class OcrWorker(threading.Thread):
    def __init__(self, log_path):
        super().__init__(daemon=True)
        self.ocr_queue    = queue.Queue(maxsize=1)
        self.result_queue = queue.Queue(maxsize=4)
        self.stopped      = False
        self.log_path     = log_path
        self._last_text   = ""   # tránh log trùng biển số liên tiếp

        # Khởi tạo file kết quả
        with open(self.log_path, "w", encoding="utf-8") as f:
            f.write(f"=== Smart Parking AI — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ===\n")
            f.write("Biển số - Thời điểm đọc\n")
            f.write("-" * 40 + "\n")

    def run(self):
        while not self.stopped:
            try:
                task = self.ocr_queue.get(timeout=0.5)
            except queue.Empty:
                continue

            crop, class_name, box = task
            text = read_plate_text(crop, class_name)

            if text:
                ts = datetime.now().strftime("%H:%M:%S")
                print(f"[{ts}]  Biển số: {text}")

                # Chỉ ghi khi khác biển số lần đọc trước (tránh spam trùng)
                if text != self._last_text:
                    self._last_text = text
                    with open(self.log_path, "a", encoding="utf-8") as f:
                        f.write(f"{text} - {ts}\n")

            # Trả kết quả về main thread để vẽ
            if self.result_queue.full():
                try: self.result_queue.get_nowait()
                except: pass
            self.result_queue.put({'box': box, 'text': text})

    def submit(self, crop, class_name, box):
        try:
            self.ocr_queue.put_nowait((crop, class_name, box))
        except queue.Full:
            pass

    def get_result(self):
        try:
            return self.result_queue.get_nowait()
        except queue.Empty:
            return None

    def stop(self):
        self.stopped = True

# ─────────────────────────────────────────────
# 5. VẼ KẾT QUẢ
# ─────────────────────────────────────────────
def draw_detections(frame, detections):
    for det in detections:
        x1, y1, x2, y2 = det['box']
        txt = det['text']
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        if txt:
            (tw, th), _ = cv2.getTextSize(txt, cv2.FONT_HERSHEY_SIMPLEX, 0.8, 2)
            cv2.rectangle(frame, (x1, y1 - th - 14), (x1 + tw + 8, y1), (0, 0, 0), -1)
            cv2.putText(frame, txt, (x1 + 4, y1 - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)

# ─────────────────────────────────────────────
# 6. VÒNG LẶP CHÍNH
# ─────────────────────────────────────────────
reader     = FrameReader(TEST_FILE)
ocr_worker = OcrWorker(RESULT_FILE)
reader.start()
ocr_worker.start()

saved_detections = []
frame_idx        = 0
OCR_EVERY_N      = 5   # gửi OCR mỗi N frame
YOLO_EVERY_N     = 2   # chạy YOLO mỗi N frame

fps_deque = deque(maxlen=30)
prev_time = time.perf_counter()

# waitKey delay khớp FPS video (thay vì cứng 1ms)
wait_ms = max(1, int(1000 / reader.fps))

print(f"▶  Video FPS: {reader.fps:.1f}  |  wait_ms: {wait_ms}ms")
print(f"▶  Kết quả lưu vào: {RESULT_FILE}")
print("▶  Nhấn [Q] hoặc [ESC] để thoát.\n")

while not reader.stopped:
    frame = reader.read()
    if frame is None:
        time.sleep(0.005)
        continue

    frame_idx += 1

    # ── A. YOLO
    if frame_idx % YOLO_EVERY_N == 0:
        results    = yolo_model(frame, conf=0.4, verbose=False)
        boxes_info = []
        for box in results[0].boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            cls        = int(box.cls[0])
            class_name = yolo_model.names[cls]
            boxes_info.append(((x1, y1, x2, y2), class_name))

        # ── B. Gửi OCR
        if frame_idx % OCR_EVERY_N == 0 and boxes_info:
            for (box, class_name) in boxes_info:
                x1, y1, x2, y2 = box
                crop = frame[max(0, y1):y2, max(0, x1):x2]
                ocr_worker.submit(crop, class_name, box)

    # ── C. Nhận kết quả OCR
    result = ocr_worker.get_result()
    if result:
        saved_detections = [result]

    # ── D. Vẽ
    draw_detections(frame, saved_detections)

    # ── E. FPS overlay
    now = time.perf_counter()
    fps_deque.append(1.0 / max(now - prev_time, 1e-6))
    prev_time = now
    cv2.putText(frame, f"FPS: {sum(fps_deque)/len(fps_deque):.1f}", (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 255), 2)

    cv2.imshow("Smart Parking AI", frame)

    # ── F. Thoát
    key = cv2.waitKey(wait_ms) & 0xFF
    if key in (ord('q'), ord('Q'), 27):
        print("\n⏹  Người dùng thoát.")
        break

# ─────────────────────────────────────────────
# 7. DỌN DẸP
# ─────────────────────────────────────────────
reader.stop()
ocr_worker.stop()
cv2.destroyAllWindows()

with open(RESULT_FILE, "a", encoding="utf-8") as f:
    f.write("-" * 40 + "\n")
    f.write(f"Kết thúc lúc: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

print(f"✅  Đã dừng. Kết quả lưu tại: {RESULT_FILE}")