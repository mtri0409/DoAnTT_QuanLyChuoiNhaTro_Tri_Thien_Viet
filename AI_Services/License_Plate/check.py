"""
Debug script — Xem YOLO đang detect vùng nào
Lưu ảnh crop ra folder để kiểm tra
Chạy: python debug_yolo.py --source 0
"""
import cv2
import os
import time
from ultralytics import YOLO

MODEL_PATH = "runs/best_plate.pt"
DEBUG_DIR  = "debug_crops"
os.makedirs(DEBUG_DIR, exist_ok=True)

yolo_model = YOLO(MODEL_PATH)

cap = cv2.VideoCapture(0)
saved = 0

print("▶  Nhấn [S] để lưu crop hiện tại | [Q] thoát")
print(f"▶  Crops lưu tại: {DEBUG_DIR}/\n")

while True:
    ok, frame = cap.read()
    if not ok:
        break

    results = yolo_model(frame, conf=0.3, verbose=False)  # conf thấp để thấy hết

    for i, box in enumerate(results[0].boxes):
        x1, y1, x2, y2 = map(int, box.xyxy[0])
        cls        = int(box.cls[0])
        conf_score = float(box.conf[0])
        class_name = yolo_model.names[cls]

        # Vẽ box + thông tin
        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        label = f"{class_name} {conf_score:.2f}"
        cv2.putText(frame, label, (x1, y1-8),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 0), 2)

        # In kích thước crop
        w, h = x2-x1, y2-y1
        print(f"  Det #{i}: class={class_name} conf={conf_score:.2f} "
              f"box=({x1},{y1},{x2},{y2}) size={w}x{h}")

        # Tự động lưu mỗi detection
        crop = frame[max(0,y1):min(frame.shape[0],y2),
                     max(0,x1):min(frame.shape[1],x2)]
        if crop.size > 0:
            fname = f"{DEBUG_DIR}/det_{saved:04d}_{class_name}_{conf_score:.2f}.jpg"
            cv2.imwrite(fname, crop)
            saved += 1

    cv2.imshow("YOLO Debug — xem YOLO detect vùng nào", frame)

    key = cv2.waitKey(30) & 0xFF
    if key in (ord('q'), ord('Q'), 27):
        break

cap.release()
cv2.destroyAllWindows()
print(f"\n✅  Đã lưu {saved} crops vào {DEBUG_DIR}/")
print("👉  Mở folder đó xem crop có phải biển số không")