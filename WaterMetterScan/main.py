import os
import cv2
import uvicorn
import numpy as np
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import JSONResponse
from ultralytics import YOLO

# --- CẤU HÌNH HỆ THỐNG ---
app = FastAPI(title="Meter OCR: YOLOv8 Only")

# Đường dẫn model và thư mục debug
MODEL_PATH = Path("runs/best.pt")
DEBUG_DIR = Path("debug_outputs")
DEBUG_DIR.mkdir(exist_ok=True)

# Load YOLOv8
if not MODEL_PATH.exists():
    print(f"[ERROR] Không tìm thấy file model tại {MODEL_PATH}")
    yolo_model = None
else:
    yolo_model = YOLO(str(MODEL_PATH))
    print(f"[INFO] YOLOv8 đã sẵn sàng: {MODEL_PATH}")

# --- CÁC HÀM HỖ TRỢ ---

def process_meter_reading(img: np.ndarray, conf_thresh: float):
    """Chỉ dùng YOLO để nhận diện số"""
    if yolo_model is None:
        return {
            "result": "",
            "count": 0,
            "error": "YOLO model not loaded"
        }
    
    results = yolo_model(img, verbose=False)[0]
    detections = []

    for box in results.boxes:
        conf = float(box.conf)
        if conf < conf_thresh:
            continue

        x1, y1, x2, y2 = map(int, box.xyxy[0])
        h_orig, w_orig = img.shape[:2]
        x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w_orig, x2), min(h_orig, y2)

        # Lấy giá trị từ YOLO (class)
        yolo_value = str(int(box.cls)) if hasattr(box, 'cls') else "?"
        
        detections.append({
            "value": yolo_value,
            "confidence": round(conf, 3),
            "bbox": [x1, y1, x2, y2],
            "x_center": (x1 + x2) / 2
        })

    # Sắp xếp từ trái sang phải theo tọa độ X
    detections.sort(key=lambda d: d["x_center"])
    
    # Tạo chuỗi kết quả
    result_sequence = "".join(d["value"] for d in detections)
    
    return {
        "result": result_sequence,
        "count": len(detections),
        "details": detections
    }

# --- API ENDPOINTS ---

@app.post("/ocr")
async def perform_ocr(
    file: UploadFile = File(...),
    conf_thresh: float = Query(0.25, description="Ngưỡng tin cậy của YOLO"),
    debug: bool = Query(False, description="Bật để lưu ảnh crop")
):
    try:
        # Đọc ảnh từ request
        data = await file.read()
        nparr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return JSONResponse(status_code=400, content={"message": "Ảnh không hợp lệ"})

        # Dọn dẹp dữ liệu debug cũ nếu được yêu cầu
        if debug:
            for old_file in DEBUG_DIR.glob("*.jpg"):
                old_file.unlink()

        # Thực hiện nhận diện
        output = process_meter_reading(img, conf_thresh)

        # Chuẩn bị phản hồi
        response = {
            "status": "success",
            "result": output["result"],
            "count": output["count"]
        }
    
        # Lưu ảnh debug nếu cần kiểm tra
        if debug and output["count"] > 0:
            cv2.imwrite(str(DEBUG_DIR / "full_image.jpg"), img)
            for i, d in enumerate(output["details"]):
                x1, y1, x2, y2 = d["bbox"]
                crop_save = img[y1:y2, x1:x2]
                fname = f"digit_{i+1}_value_{d['value']}_conf_{d['confidence']}.jpg"
                cv2.imwrite(str(DEBUG_DIR / fname), crop_save)

        return response

    except Exception as e:
        import traceback
        return JSONResponse(
            status_code=500, 
            content={"status": "error", "message": str(e), "trace": traceback.format_exc()}
        )

@app.post("/ocr/water")
async def ocr_water(
    file: UploadFile = File(...),
    conf_thresh: float = Query(0.25)
):
    """Endpoint riêng cho đồng hồ nước"""
    return await perform_ocr(file, conf_thresh)

@app.post("/ocr/electricity")
async def ocr_electricity(
    file: UploadFile = File(...),
    conf_thresh: float = Query(0.25)
):
    """Endpoint riêng cho đồng hồ điện"""
    return await perform_ocr(file, conf_thresh)

@app.get("/health")
def health():
    return {"status": "active", "model_loaded": yolo_model is not None}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)