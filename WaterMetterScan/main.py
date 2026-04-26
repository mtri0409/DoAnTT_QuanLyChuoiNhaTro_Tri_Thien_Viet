import os
import cv2
import uvicorn
import numpy as np
import easyocr
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, Query
from fastapi.responses import JSONResponse
from ultralytics import YOLO

# --- CẤU HÌNH HỆ THỐNG ---
app = FastAPI(title="Meter OCR: YOLOv8 + EasyOCR")

# Đường dẫn model và thư mục debug
MODEL_PATH = Path("runs/best.pt")
DEBUG_DIR = Path("debug_outputs")
DEBUG_DIR.mkdir(exist_ok=True)

# Khởi tạo EasyOCR (Chỉ load 1 lần khi khởi động server)
# Reader sẽ giới hạn chỉ đọc số để tăng độ chính xác
print("[INFO] Đang khởi tạo EasyOCR Reader...")
reader = easyocr.Reader(['en'], gpu=True) 

# Load YOLOv8
if not MODEL_PATH.exists():
    print(f"[ERROR] Không tìm thấy file model tại {MODEL_PATH}. Vui lòng kiểm tra lại!")
    # Tri nhớ bỏ file best.pt vào đúng thư mục runs nhé
else:
    yolo_model = YOLO(str(MODEL_PATH))
    print(f"[INFO] YOLOv8 đã sẵn sàng: {MODEL_PATH}")

# --- CÁC HÀM HỖ TRỢ ---

def preprocess_for_ocr(digit_img):
    """Tiền xử lý ảnh crop để EasyOCR đọc ngoan hơn"""
    if digit_img.size == 0: 
        return digit_img
    # Phóng to x2 để các nét chữ số rõ ràng hơn
    digit_img = cv2.resize(digit_img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    # Chuyển về ảnh xám (Grayscale)
    gray = cv2.cvtColor(digit_img, cv2.COLOR_BGR2GRAY)
    return gray

def process_meter_reading(img: np.ndarray, conf_thresh: float):
    """Kết hợp YOLO để tìm vị trí và EasyOCR để đọc giá trị"""
    results = yolo_model(img, verbose=False)[0]
    detections = []

    for box in results.boxes:
        conf = float(box.conf)
        if conf < conf_thresh:
            continue

        x1, y1, x2, y2 = map(int, box.xyxy[0])
        h_orig, w_orig = img.shape[:2]
        x1, y1, x2, y2 = max(0, x1), max(0, y1), min(w_orig, x2), min(h_orig, y2)

        # 1. Cắt ảnh chữ số
        crop = img[y1:y2, x1:x2]
        
        # 2. OCR nhận diện giá trị
        processed_crop = preprocess_for_ocr(crop)
        # allowlist giúp loại bỏ việc đọc nhầm sang chữ cái
        ocr_res = reader.readtext(processed_crop, detail=0, allowlist='0123456789')
        
        # Fallback: Nếu EasyOCR không đọc được, dùng kết quả của YOLO
        final_val = ocr_res[0] if (ocr_res and len(ocr_res) > 0) else str(int(box.cls))

        detections.append({
            "value": final_val,
            "x_center": (x1 + x2) / 2,
            "conf": round(conf, 3),
            "bbox": [x1, y1, x2, y2]
        })

    # Sắp xếp từ trái sang phải theo tọa độ X
    detections.sort(key=lambda d: d["x_center"])
    final_result = "".join(d["value"] for d in detections)
    
    return {
        "result": final_result,
        "details": detections,
        "count": len(detections)
    }

# --- API ENDPOINTS ---

@app.post("/ocr")
async def perform_ocr(
    file: UploadFile = File(...),
    conf_thresh: float = Query(0.25, description="Ngưỡng tin cậy của YOLO"),
    debug: bool = Query(False, description="Bật để xóa/lưu ảnh crop mới")
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
        if debug:
            response["debug_info"] = output["details"]
            cv2.imwrite(str(DEBUG_DIR / "full_image.jpg"), img)
            for i, d in enumerate(output["details"]):
                x1, y1, x2, y2 = d["bbox"]
                crop_save = img[y1:y2, x1:x2]
                fname = f"step_{i}_val_{d['value']}_conf_{d['conf']}.jpg"
                cv2.imwrite(str(DEBUG_DIR / fname), crop_save)

        return response

    except Exception as e:
        import traceback
        return JSONResponse(
            status_code=500, 
            content={"status": "error", "message": str(e), "trace": traceback.format_exc()}
        )

@app.get("/health")
def health():
    return {"status": "active", "gpu": reader.gpu}

if __name__ == "__main__":
    # Chạy tại port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)