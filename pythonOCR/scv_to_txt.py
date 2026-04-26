import os
import random
import shutil
from pathlib import Path

# ==========================================
# 1. CẤU HÌNH ĐƯỜNG DẪN CỦA BẠN
# ==========================================
# Đã chèn chính xác đường dẫn bạn cung cấp
SOURCE_IMG_DIR = Path(r"D:\DO_AN_TOT_NGHIEP\v3\train\images")
SOURCE_LBL_DIR = Path(r"D:\DO_AN_TOT_NGHIEP\v3\train\labels")

# Thư mục đích sẽ chứa 100 cặp ảnh (Tự động tạo ở thư mục hiện tại nơi bạn chạy file này)
DEST_DIR = Path("dataset_mini")
DEST_IMG_DIR = DEST_DIR / "images" 
DEST_LBL_DIR = DEST_DIR / "labels"

NUM_SAMPLES = 100 

# ==========================================
# 2. XỬ LÝ LỌC ẢNH
# ==========================================
print(f"[INFO] Bắt đầu quét thư mục gốc...")

# Tạo thư mục mới nếu chưa có
DEST_IMG_DIR.mkdir(parents=True, exist_ok=True)
DEST_LBL_DIR.mkdir(parents=True, exist_ok=True)

# Quét tất cả file ảnh (.jpg, .png) trong thư mục images
all_images = [f for f in SOURCE_IMG_DIR.iterdir() if f.is_file() and f.suffix.lower() in ['.jpg', '.png', '.jpeg']]

# KIỂM TRA ĐIỀU KIỆN KÉP: Chỉ lấy ảnh CÓ file .txt (label) đi kèm
valid_images = []
for img in all_images:
    lbl_path = SOURCE_LBL_DIR / (img.stem + ".txt")
    if lbl_path.exists():
        valid_images.append(img)

print(f"[INFO] Tìm thấy {len(valid_images)} ảnh hợp lệ có file text đi kèm.")

if len(valid_images) == 0:
    print("[LỖI] Không tìm thấy cặp Ảnh - Label nào! Hãy kiểm tra lại xem ảnh và file txt có trùng tên nhau không nhé.")
    exit()

# Bốc thăm 100 tấm (hoặc lấy tất cả nếu ít hơn 100)
samples_to_get = min(NUM_SAMPLES, len(valid_images))
selected_images = random.sample(valid_images, samples_to_get)

print(f"[INFO] Đang copy {samples_to_get} ảnh sang thư mục dataset_mini...")

for img_path in selected_images:
    # Copy ảnh
    shutil.copy(img_path, DEST_IMG_DIR / img_path.name)
    
    # Copy file text (label)
    lbl_path = SOURCE_LBL_DIR / (img_path.stem + ".txt")
    shutil.copy(lbl_path, DEST_LBL_DIR / lbl_path.name)

print(f"\n{'='*50}")
print(f"[DONE] Xong! Bạn mở thư mục 'dataset_mini' ra kiểm tra nhé.")
print(f"Bây giờ chỉ cần sửa lại file train.py cho trỏ vào dataset_mini là train thôi!")
print(f"{'='*50}")