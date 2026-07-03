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
from fastapi import FastAPI, UploadFile, File, Query, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg
import torch
import base64

from models import ChatPayload, ChatResponse
from tools import get_ai_config
from graph.state import create_initial_state
from graph.app import get_graph
from graph.tool_registry import get_registry


# ==================== TỐI ƯU CPU CHO PYTORCH ====================
os.environ["OMP_NUM_THREADS"] = "2"
os.environ["MKL_NUM_THREADS"] = "2"
torch.set_num_threads(2)

# ==================== CẤU HÌNH HỆ THỐNG ====================
app = FastAPI(title="AI Detection & Streaming & Conversational Agent Service", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

WATER_MODEL_PATH = Path("runs/best_water.pt")
PLATE_MODEL_PATH = Path("runs/best_plate.pt")
DEBUG_DIR = Path("debug_outputs")
DEBUG_DIR.mkdir(exist_ok=True)

VIDEO_SOURCE = "0"  # Thay bằng URL RTSP nếu dùng camera IP
FRAMES_TO_COLLECT = 5

# API URLs
JAVA_BACKEND_API_BASE = os.getenv("API_BACKEND_URL", "http://localhost:8080")
# If API_BACKEND_URL includes /api/v1/internal/ai-tools, strip it to get the base url
if "/api/v1" in JAVA_BACKEND_API_BASE:
    JAVA_BACKEND_API_BASE = JAVA_BACKEND_API_BASE.split("/api/v1")[0]

JAVA_API_URL = f"{JAVA_BACKEND_API_BASE}/api/v1/ai/receive-plate"

# Load AI config from Java backend
ai_config = get_ai_config(JAVA_BACKEND_API_BASE)
DEFAULT_AI_API_KEY = ai_config.get("API_KEY", os.getenv("DEFAULT_AI_API_KEY", ""))
DEFAULT_AI_BASE_URL = ai_config.get("BASE_URL", os.getenv("DEFAULT_AI_BASE_URL", ""))
DEFAULT_AI_MODEL = ai_config.get("MODEL", os.getenv("DEFAULT_AI_MODEL", ""))

import logging
logger = logging.getLogger(__name__)
logger.info(f"[Startup] JAVA_BACKEND_API_BASE={JAVA_BACKEND_API_BASE}")
logger.info(f"[Startup] AI config loaded: API_KEY={'***' if DEFAULT_AI_API_KEY else 'empty'}, BASE_URL={DEFAULT_AI_BASE_URL}, MODEL={DEFAULT_AI_MODEL}")
logger.info(f"[Startup] Registered tools: {get_registry().list_tools()}")

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
        self.source = source
        self.is_webcam = source.isdigit()
        self.frame = None
        self.lock = threading.Lock()
        self.stopped = False
        self.is_simulated = False
        
        try:
            self.cap = cv2.VideoCapture(int(source) if self.is_webcam else source)
            if not self.cap.isOpened():
                print(f"[WARN] Camera source {source} cannot be opened. Activating Simulation Mode.")
                self.is_simulated = True
        except Exception as e:
            print(f"[WARN] Failed to initialize camera {source}: {e}. Activating Simulation Mode.")
            self.is_simulated = True
        
    def run(self):
        consecutive_failures = 0
        while not self.stopped:
            if self.is_simulated:
                frame = self.generate_simulated_frame()
                with self.lock:
                    self.frame = frame
                time.sleep(0.04) # ~25 FPS
                continue
                
            ok, frame = self.cap.read()
            if not ok:
                consecutive_failures += 1
                if consecutive_failures > 15:
                    print("[WARN] Too many consecutive frame failures. Switching to Camera Simulator.")
                    self.is_simulated = True
                
                if self.is_webcam:
                    time.sleep(0.01)
                    continue
                self.stopped = True
                break
            
            consecutive_failures = 0
            with self.lock:
                self.frame = frame
                
    def read(self):
        with self.lock:
            return None if self.frame is None else self.frame.copy()

    def stop(self):
        self.stopped = True
        if hasattr(self, 'cap') and self.cap is not None:
            self.cap.release()

    def generate_simulated_frame(self):
        # 720x1280x3 canvas
        frame = np.zeros((720, 1280, 3), dtype=np.uint8)
        
        # Draw background grid
        for y in range(80, 720, 80):
            cv2.line(frame, (0, y), (1280, y), (40, 40, 45), 1)
        for x in range(80, 1280, 80):
            cv2.line(frame, (x, 0), (x, 720), (40, 40, 45), 1)

        # Draw a stylish gate/lane layout
        cv2.line(frame, (400, 720), (500, 350), (120, 120, 120), 2)
        cv2.line(frame, (880, 720), (780, 350), (120, 120, 120), 2)
        
        # Camera overlay text
        now = datetime.now()
        time_str = now.strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        cv2.putText(frame, f"CAM-01: MAIN ENTRANCE (SIMULATOR)", (30, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.putText(frame, time_str, (930, 50), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        global active_viewers
        if active_viewers <= 0:
            cv2.putText(frame, "STATUS: STANDBY (NO ACTIVE VIEWERS)", (30, 90), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (120, 120, 120), 2)
            cv2.putText(frame, "DETECTION PAUSED", (480, 360), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
            return frame

        # Entry/Exit Stop line (red line)
        cv2.line(frame, (480, 420), (800, 420), (0, 0, 255), 3)
        
        # Flashing "LIVE FEED" indicator
        if int(time.time() * 2) % 2 == 0:
            cv2.putText(frame, "● LIVE FEED (MOCK)", (30, 90), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        else:
            cv2.putText(frame, "  LIVE FEED (MOCK)", (30, 90), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
            
        cv2.putText(frame, "STATUS: DEMO GATE RUNNING", (30, 120), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 165, 0), 1)
        
        # Cycle timing: Every 15 seconds
        cycle_duration = 15.0
        t = time.time() % cycle_duration
        cycle_idx = int(time.time() / cycle_duration)
        
        if 8.0 <= t < 10.0:
            # Entering
            ratio = (t - 8.0) / 2.0
            y = int(720 - ratio * (720 - 460))
            w = int(200 + ratio * 100)
            h = int(120 + ratio * 60)
            self.draw_vehicle(frame, 640, y, w, h, None, None)
            
        elif 10.0 <= t < 13.0:
            # Stationary (Plate scan phase)
            y = 460
            w = 300
            h = 180
            plate_text, is_square = self.get_plate_for_cycle(cycle_idx)
            self.draw_vehicle(frame, 640, y, w, h, plate_text, is_square)
            
            # Submit detection ONCE per cycle
            if not hasattr(self, 'last_submitted_cycle') or self.last_submitted_cycle != cycle_idx:
                self.last_submitted_cycle = cycle_idx
                self.trigger_simulated_detection(cycle_idx, plate_text, is_square)
                
        elif 13.0 <= t < 15.0:
            # Exiting
            ratio = (t - 13.0) / 2.0
            y = int(460 - ratio * (460 - 320))
            w = int(300 - ratio * 150)
            h = int(180 - ratio * 90)
            self.draw_vehicle(frame, 640, y, w, h, None, None)
            
        return frame

    def draw_vehicle(self, frame, cx, cy, w, h, plate_text=None, is_square=True):
        x1 = cx - w // 2
        y1 = cy - h
        x2 = cx + w // 2
        y2 = cy
        
        # Body
        cv2.rectangle(frame, (x1, y1), (x2, y2), (180, 100, 50), -1)
        cv2.rectangle(frame, (x1, y1), (x2, y2), (220, 220, 220), 2)
        
        # Windshield
        wx1 = cx - int(w * 0.4)
        wy1 = cy - h + int(h * 0.1)
        wx2 = cx + int(w * 0.4)
        wy2 = cy - int(h * 0.5)
        cv2.rectangle(frame, (wx1, wy1), (wx2, wy2), (240, 200, 150), -1)
        cv2.rectangle(frame, (wx1, wy1), (wx2, wy2), (220, 220, 220), 1)
        
        # Headlights
        cv2.circle(frame, (x1 + int(w * 0.15), cy - int(h * 0.2)), int(w * 0.06), (200, 255, 255), -1)
        cv2.circle(frame, (x2 - int(w * 0.15), cy - int(h * 0.2)), int(w * 0.06), (200, 255, 255), -1)
        
        # Grille
        gx1 = cx - int(w * 0.2)
        gy1 = cy - int(h * 0.3)
        gx2 = cx + int(w * 0.2)
        gy2 = cy - int(h * 0.1)
        cv2.rectangle(frame, (gx1, gy1), (gx2, gy2), (30, 30, 30), -1)
        
        # License Plate
        if plate_text:
            pw = int(w * 0.48)
            ph = int(h * 0.28) if is_square else int(h * 0.18)
            px1 = cx - pw // 2
            py1 = cy - int(h * 0.1) - ph // 2
            px2 = cx + pw // 2
            py2 = cy - int(h * 0.1) + ph // 2
            
            # Plate base
            cv2.rectangle(frame, (px1, py1), (px2, py2), (240, 240, 240), -1)
            cv2.rectangle(frame, (px1, py1), (px2, py2), (0, 0, 0), 2)
            
            # Draw AI Bounding Box overlay representing YOLO detection
            color = (0, 255, 0)  # Green box
            cv2.rectangle(frame, (px1 - 3, py1 - 3), (px2 + 3, py2 + 3), color, 2)
            cv2.putText(frame, f"{'BSV' if is_square else 'BSD'} 0.96", (px1, py1 - 8), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 1)
            
            if is_square:
                line1 = plate_text[:4]
                line2 = plate_text[4:]
                formatted_line1 = f"{line1[:2]}-{line1[2:]}"
                formatted_line2 = f"{line2[:3]}.{line2[3:]}" if len(line2) >= 4 else line2
                
                cv2.putText(frame, formatted_line1, (px1 + 8, py1 + int(ph * 0.42)), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
                cv2.putText(frame, formatted_line2, (px1 + 8, py1 + int(ph * 0.85)), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 2)
            else:
                formatted = f"{plate_text[:3]}-{plate_text[3:6]}.{plate_text[6:]}" if len(plate_text) > 6 else plate_text
                cv2.putText(frame, formatted, (px1 + 6, py1 + int(ph * 0.72)), 
                            cv2.FONT_HERSHEY_SIMPLEX, 0.52, (0, 0, 0), 2)

    def get_plate_for_cycle(self, cycle_idx):
        plates = [
            ("59G112345", True),  # Square
            ("30A99999", False),  # Long
            ("43C88888", True),
            ("72A55555", False),
            ("29A66666", True),
            ("92C77777", False)
        ]
        return plates[cycle_idx % len(plates)]

    def trigger_simulated_detection(self, track_id, plate_text, is_square):
        crop_h = 60 if is_square else 40
        crop_w = 120
        crop_img = np.ones((crop_h, crop_w, 3), dtype=np.uint8) * 240
        cv2.rectangle(crop_img, (0, 0), (crop_w - 1, crop_h - 1), (0, 0, 0), 2)
        
        if is_square:
            line1 = f"{plate_text[:2]}-{plate_text[2:4]}"
            line2 = f"{plate_text[4:7]}.{plate_text[7:]}" if len(plate_text) > 7 else plate_text[4:]
            cv2.putText(crop_img, line1, (15, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
            cv2.putText(crop_img, line2, (15, 48), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2)
        else:
            line = f"{plate_text[:3]}-{plate_text[3:6]}.{plate_text[6:]}" if len(plate_text) > 6 else plate_text
            cv2.putText(crop_img, line, (10, 26), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 0), 2)
            
        cls_name = f"SIMULATED:{'BSV' if is_square else 'BSD'}:{plate_text}"
        ocr_worker.submit_batch(track_id, [(crop_img, cls_name)])
        print(f"[SIMULATOR] Dispatched simulated ALPR event for track {track_id}: {plate_text}")

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
                    if class_name.startswith("SIMULATED:"):
                        parts = class_name.split(":")
                        raw_text = parts[2]
                    elif class_name == 'BSV':
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

        if hasattr(camera_reader, 'is_simulated') and camera_reader.is_simulated:
            with frame_lock:
                latest_annotated_frame = frame.copy()
            time.sleep(0.03)
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
    ocr_worker = OcrWorker()
    ocr_worker.start()
    
    # Chỉ chạy camera reader ở backend nếu nguồn KHÔNG phải là webcam cục bộ "0"
    if str(VIDEO_SOURCE) != "0":
        camera_reader = FrameReader(VIDEO_SOURCE)
        camera_reader.start()
        # Chạy tracking loop ngầm
        threading.Thread(target=video_tracking_loop, daemon=True).start()
        print(f"✅ Real-time Video ALPR System Started for source: {VIDEO_SOURCE}")
    else:
        camera_reader = None
        print("ℹ️ Local Webcam Mode (0) detected. Backend camera capture is disabled to allow UI webcam access.")
    
    # Compile LangGraph Agent
    print("🤖 Compiling LangGraph Agent...")
    try:
        get_graph()
        print("✅ LangGraph Agent Compiled and Ready!")
    except Exception as e:
        print(f"❌ Error compiling LangGraph agent: {e}")

@app.on_event("shutdown")
def shutdown_event():
    if camera_reader:
        camera_reader.stop()
    if ocr_worker:
        ocr_worker.stop()

# ==================== API ENDPOINTS CỦA WEB ====================

active_viewers = 0

def generate_mjpeg_stream():
    """Generator sinh ra các khung hình liên tục cho MJPEG stream"""
    global active_viewers
    active_viewers += 1
    print(f"[STREAM] New viewer connected. Active viewers: {active_viewers}", flush=True)
    try:
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
            time.sleep(0.04) # Giới hạn ~25 FPS
    finally:
        active_viewers = max(0, active_viewers - 1)
        print(f"[STREAM] Viewer disconnected. Active viewers: {active_viewers}", flush=True)

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


@app.post("/api/v1/chat", response_model=ChatResponse)
async def chat_with_ai(payload: ChatPayload, request: Request):
    """
    Endpoint xử lý chat với AI sử dụng LangGraph.
    """
    logger.info(f"[Chat Endpoint] Received chat request from {request.client.host}: {payload.message!r}")

    try:
        # Resolve AI configuration
        api_key = payload.api_key or DEFAULT_AI_API_KEY
        base_url = payload.base_url or DEFAULT_AI_BASE_URL
        model_name = payload.model_name or DEFAULT_AI_MODEL
        java_backend_url = payload.java_backend_url or JAVA_BACKEND_API_BASE

        logger.info(f"[Chat Endpoint] Resolved config: model={model_name}, base_url={base_url}, api_key={'***' if api_key else 'empty'}")

        # Build initial state
        state = create_initial_state()
        state.update({
            "current_message": payload.message,
            "provider": payload.provider,
            "api_key": api_key,
            "base_url": base_url,
            "model_name": model_name,
            "java_backend_url": java_backend_url,
            "thread_id": getattr(payload, "thread_id", None) or "default",
        })

        # Invoke LangGraph
        graph = get_graph()
        config = {"configurable": {"thread_id": state["thread_id"]}}
        result = await graph.ainvoke(state, config)

        response_text = result.get("response", "Xin lỗi, mình không xử lý được yêu cầu này.")
        logger.info(f"[Chat Endpoint] Final response length: {len(response_text)}, preview: {response_text[:200]!r}")

        return ChatResponse(
            response=response_text,
            provider=payload.provider,
            model_name=model_name,
            is_cached=False
        )

    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"AI Service Error: {str(e)}"
        )


def process_single_frame_plate(frame: np.ndarray):
    if plate_model is None or ocr_predictor is None:
        return {"status": "error", "message": "YOLO or OCR model not loaded"}

    # Run YOLO detection (no persist/track needed for single static frame)
    results = plate_model(frame, verbose=False, conf=0.5)[0]

    if len(results.boxes) == 0:
        return {"status": "failed", "message": "No plate detected"}

    best_box = None
    best_conf = -1.0
    best_class_name = ""

    for box in results.boxes:
        conf = float(box.conf[0])
        if conf > best_conf:
            best_conf = conf
            best_box = box.xyxy[0].cpu().numpy()
            cls_id = int(box.cls[0])
            best_class_name = plate_model.names[cls_id]

    if best_box is None:
        return {"status": "failed", "message": "No valid boxes found"}

    crop = crop_image(frame, best_box)
    if crop.size == 0 or crop.shape[0] < 10 or crop.shape[1] < 10:
        return {"status": "failed", "message": "Cropped plate image too small"}

    try:
        if best_class_name == 'BSV':
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

        valid_plate = clean_and_validate_plate(raw_text)
        if valid_plate:
            _, buffer = cv2.imencode('.jpg', crop, [cv2.IMWRITE_JPEG_QUALITY, 80])
            crop_base64 = base64.b64encode(buffer).decode('utf-8')

            return {
                "status": "success",
                "plate": valid_plate,
                "confidence": best_conf,
                "type": best_class_name,
                "crop_image": crop_base64
            }
        else:
            return {
                "status": "failed",
                "message": f"Plate validation failed for raw text: {raw_text}"
            }
    except Exception as e:
        return {"status": "error", "message": f"OCR failed: {str(e)}"}


@app.post("/api/v1/detect-plate-frame")
async def detect_plate_frame(file: UploadFile = File(...)):
    """
    Endpoint xử lý nhận diện biển số xe từ một frame ảnh gửi lên từ Frontend UI.
    """
    try:
        data = await file.read()
        nparr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return JSONResponse(status_code=400, content={"status": "error", "message": "Invalid image file"})

        result = process_single_frame_plate(img)
        return JSONResponse(content=result)
    except Exception as e:
        logger.error(f"Error in detect_plate_frame: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"status": "error", "message": str(e)})


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "java_backend_url": JAVA_BACKEND_API_BASE,
        "tools": get_registry().list_tools(),
    }


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")