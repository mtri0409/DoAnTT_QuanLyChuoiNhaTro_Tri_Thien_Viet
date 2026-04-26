"""
FastAPI server — YOLOv8 Meter Digit OCR
Chạy: python main.py
"""

from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import JSONResponse
import numpy as np
import cv2
import uvicorn
import os
from pathlib import Path
from ultralytics import YOLO

app = FastAPI(title="Meter Digit OCR - Debug Mode")

# Cấu hình đường dẫn
MODEL_PATH = Path("runs/best.pt")
# MODEL_PATH = Path("runs/detect/runs/detect/meter_digits/weights/best.pt")
DEBUG_DIR = Path("debug_outputs")
DEBUG_DIR.mkdir(exist_ok=True)

# Load model
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Không tìm thấy model tại {MODEL_PATH}")

model = YOLO(str(MODEL_PATH))
CLASS_NAMES = {i: str(i) for i in range(10)}
print(f"[INFO] Model loaded successfully: {MODEL_PATH}")

def read_meter(img: np.ndarray, conf_thresh: float = 0.25):
    """
    Xử lý nhận diện và sắp xếp các chữ số từ trái sang phải
    """
    results = model(img, verbose=False)[0]
    detections = []

    for box in results.boxes:
        conf = float(box.conf)
        if conf < conf_thresh:
            continue

        class_id = int(box.cls)
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        
        detections.append({
            "value": CLASS_NAMES.get(class_id, "?"),
            "x": (x1 + x2) / 2, # Tâm X để sắp xếp
            "conf": round(conf, 3),
            "bbox": [x1, y1, x2, y2]
        })

    # Sắp xếp các chữ số theo thứ tự từ trái qua phải
    detections.sort(key=lambda d: d["x"])
    
    # Chuỗi số nguyên bản quét được
    raw_result = "".join(d["value"] for d in detections)
    
    return {
        "result": raw_result, 
        "digits": detections, 
        "count": len(detections)
    }

@app.post("/ocr")
async def perform_ocr(
    file: UploadFile = File(...),
    conf_thresh: float = Query(0.25, description="Ngưỡng tin cậy của model"),
    debug: bool = Query(False, description="Bật chế độ trả về chi tiết tọa độ")
):
    try:
        # 1. Đọc file ảnh từ request
        content = await file.read()
        nparr = np.frombuffer(content, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return JSONResponse(
                status_code=400, 
                content={"status": "error", "message": "Định dạng ảnh không hợp lệ"}
            )

        # 2. Lưu ảnh debug để kiểm tra phía Server
        debug_path = DEBUG_DIR / "last_received_image.jpg"
        cv2.imwrite(str(debug_path), img)
        print(f"[DEBUG] Ảnh đã được lưu tại: {debug_path} | Size: {len(content)} bytes")

        # 3. Gọi hàm xử lý OCR
        out = read_meter(img, conf_thresh=conf_thresh)

        # 4. Trả về kết quả
        response_data = {
            "status": "success",
            "result": out["result"],  # Sẽ trả về "" nếu không thấy số nào
            "raw_count": out["count"]
        }
        print(f"[DEBUG] kết quả trả về {response_data}")
        
        # 5. Xử lý lưu ảnh Crop nếu bật chế độ debug
        if debug:
            response_data["debug_info"] = out["digits"]
            print(f"[DEBUG] Kết quả quét: {out['result']} (Tìm thấy {out['count']} số)")
            
            # Lấy kích thước ảnh gốc để tránh cắt vượt quá viền ảnh
            h_img, w_img = img.shape[:2]
            
            # Xóa các file crop cũ (tùy chọn, giúp thư mục không bị đầy)
            for f in DEBUG_DIR.glob("crop_*.jpg"):
                f.unlink()
                
            for i, digit in enumerate(out["digits"]):
                x1, y1, x2, y2 = digit["bbox"]
                
                # Đảm bảo tọa độ nằm trong phạm vi ảnh
                x1, y1 = max(0, x1), max(0, y1)
                x2, y2 = min(w_img, x2), min(h_img, y2)
                
                # Tiến hành cắt (crop) ảnh: img[start_y:end_y, start_x:end_x]
                if y2 > y1 and x2 > x1:
                    crop_img = img[y1:y2, x1:x2]
                    
                    # Đặt tên file có chứa vị trí và giá trị nhận diện được (VD: crop_0_val_5.jpg)
                    crop_path = DEBUG_DIR / f"crop_{i}_val_{digit['value']}.jpg"
                    cv2.imwrite(str(crop_path), crop_img)
                    print(f"[DEBUG] Đã lưu ảnh cắt tại: {crop_path}")

        return response_data

    except Exception as e:
        import traceback
        print(f"[ERROR] {str(e)}")
        return JSONResponse(
            status_code=500, 
            content={"status": "error", "message": str(e), "trace": traceback.format_exc()}
        )

@app.get("/health")
def health_check():
    return {"status": "active", "model": str(MODEL_PATH)}

if __name__ == "__main__":
    # Chạy server tại port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)