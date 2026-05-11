import cv2
from ultralytics import YOLO

# 1. CẤU HÌNH ĐƯỜNG DẪN
MODEL_PATH = "runs/best_plate.pt"  # Đường dẫn tới file model
TEST_FILE = "carlong_0146.png"         # ĐIỀN TÊN FILE ẢNH HOẶC VIDEO CỦA BẠN VÀO ĐÂY

# Load model
try:
    model = YOLO(MODEL_PATH)
    print(f"[INFO] Tải thành công model từ: {MODEL_PATH}")
except Exception as e:
    print(f"[ERROR] Lỗi tải model: {e}")
    exit()

# 2. KIỂM TRA ĐỊNH DẠNG FILE
is_image = TEST_FILE.lower().endswith(('.png', '.jpg', '.jpeg'))
is_video = TEST_FILE.lower().endswith(('.mp4', '.avi', '.mov'))

if is_image:
    print("[INFO] Đang test trên Ảnh tĩnh...")
    img = cv2.imread(TEST_FILE)
    if img is None:
        print("[ERROR] Không đọc được ảnh. Vui lòng kiểm tra lại tên file!")
    else:
        # Nhận diện
        results = model(img, conf=0.5)
        # Vẽ khung
        annotated_img = results[0].plot()
        
        # Hiển thị
        cv2.imshow("Test Nhan Dien - Anh", annotated_img)
        print("[INFO] Bấm phím bất kỳ trên cửa sổ ảnh để thoát...")
        cv2.waitKey(0) # Dừng màn hình vô hạn cho đến khi bấm phím
        cv2.destroyAllWindows()

elif is_video:
    print("[INFO] Đang test trên Video...")
    cap = cv2.VideoCapture(TEST_FILE)
    
    if not cap.isOpened():
        print("[ERROR] Không thể mở Video!")
    else:
        print("[INFO] Đang phát Video. Bấm phím 'q' để tắt sớm.")
        while True:
            success, frame = cap.read()
            if not success:
                print("[INFO] Đã phát hết video.")
                break
                
            # Nhận diện từng khung hình
            results = model(frame, conf=0.5, verbose=False)
            annotated_frame = results[0].plot()
            
            # Hiển thị
            cv2.imshow("Test Nhan Dien - Video", annotated_frame)
            
            # Đợi 30ms (tương đương ~30 FPS) hoặc bấm 'q' để thoát
            if cv2.waitKey(30) & 0xFF == ord('q'):
                break
                
        cap.release()
        cv2.destroyAllWindows()
else:
    print("[ERROR] Định dạng file không được hỗ trợ (Chỉ nhận .jpg, .png, .mp4, ...)")