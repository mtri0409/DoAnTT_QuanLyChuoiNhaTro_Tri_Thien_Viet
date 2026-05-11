import cv2
from PIL import Image
from ultralytics import YOLO
from vietocr.tool.predictor import Predictor
from vietocr.tool.config import Cfg

# ==========================================
# 1. KHỞI TẠO CÁC MODEL AI
# ==========================================
MODEL_PATH = "runs/best_plate.pt"
yolo_model = YOLO(MODEL_PATH)

config = Cfg.load_config_from_name('vgg_transformer')
config['device'] = 'cpu'  
ocr_predictor = Predictor(config)

print("[INFO] Đã tải xong YOLO và VietOCR!")

# ==========================================
# 2. XỬ LÝ ẢNH
# ==========================================
TEST_FILE = "Dieu_0474.png"  # Đổi lại tên file ảnh xe máy của bạn
img = cv2.imread(TEST_FILE)

if img is None:
    print("[ERROR] Không đọc được ảnh!")
    exit()

# YOLO quét ảnh
results = yolo_model(img, conf=0.5, verbose=False)

for box in results[0].boxes:
    # Lấy tọa độ
    x1, y1, x2, y2 = map(int, box.xyxy[0])
    
    # Lấy tên Class (BSD hoặc BSV)
    class_id = int(box.cls[0])
    class_name = yolo_model.names[class_id]
    
    # Cắt nguyên khung biển số
    cropped_plate = img[y1:y2, x1:x2]
    
    clean_text = ""

    # THUẬT TOÁN XỬ LÝ DỰA THEO LOẠI BIỂN SỐ
    if class_name == 'BSV':
        # --- XỬ LÝ BIỂN SỐ VUÔNG (CẮT ĐÔI) ---
        h, w = cropped_plate.shape[:2]
        split_point = int(h * 0.5) # Cắt ở mốc 50% chiều cao
        
        # Tách làm 2 ảnh nhỏ
        top_half = cropped_plate[:split_point, :]
        bottom_half = cropped_plate[split_point:, :]
        
        # Chuyển đổi định dạng cho VietOCR
        pil_top = Image.fromarray(cv2.cvtColor(top_half, cv2.COLOR_BGR2RGB))
        pil_bottom = Image.fromarray(cv2.cvtColor(bottom_half, cv2.COLOR_BGR2RGB))
        
        # Đọc từng nửa
        text_top = ocr_predictor.predict(pil_top)
        text_bottom = ocr_predictor.predict(pil_bottom)
        
        # Ghép lại và dọn dẹp các dấu chấm, gạch ngang thừa
        text_top = text_top.replace("-", "").replace(".", "").strip()
        text_bottom = text_bottom.replace("-", "").replace(".", "").strip()
        clean_text = f"{text_top}-{text_bottom}"
        
    else:
        # --- XỬ LÝ BIỂN SỐ DÀI (NHƯ CŨ) ---
        pil_img = Image.fromarray(cv2.cvtColor(cropped_plate, cv2.COLOR_BGR2RGB))
        text = ocr_predictor.predict(pil_img)
        clean_text = text.replace(".", "").replace("-", "").strip()

    print(f"================")
    print(f"[THÀNH CÔNG] Loại: {class_name} | Biển số đọc được: {clean_text}")
    print(f"================")

    # Vẽ khung và in chữ
    cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
    cv2.putText(img, clean_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2, cv2.LINE_AA)

# Hiển thị ảnh
cv2.imshow("He Thong Nhan Dien", img)
cv2.waitKey(0)
cv2.destroyAllWindows()