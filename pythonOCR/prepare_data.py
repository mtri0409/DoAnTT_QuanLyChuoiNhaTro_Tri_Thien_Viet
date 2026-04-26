"""
FILE: train.py
Mục tiêu: Train YOLOv8 nhận diện 20 nhãn (0-9 và 0D-9D) trên đồng hồ.
"""

import argparse
import os
import shutil
from pathlib import Path
import yaml

# ─────────────────────────────────────────────────────────────
# 1. CẤU HÌNH HỆ THỐNG
# ─────────────────────────────────────────────────────────────
CFG = {
    "base_model":  "yolov8s.pt",      # Model Small (Thông minh hơn bản Nano)
    "epochs":       150,              # Số vòng lặp
    "img_size":     640,              # Kích thước ảnh chuẩn
    "batch":        16,               # Số lượng ảnh mỗi đợt xử lý (hạ xuống 8 nếu máy yếu)
    "device":       "cpu",            # Chuyển thành 0 nếu bạn có GPU NVIDIA
    "workers":      0,                # Giữ 0 trên Windows để tránh lỗi đa tiến trình
    "project":     "runs/detect",     # Thư mục lưu kết quả
    "run_name":    "meter_ocr_v3",    # Tên phiên bản train hiện tại
    "dataset_dir": Path("raw/images"), # THAY ĐỔI: Trỏ vào thư mục 100 ảnh của bạn
}

# ─────────────────────────────────────────────────────────────
# 2. TẠO FILE DATASET.YAML (20 CLASSES)
# ─────────────────────────────────────────────────────────────
def make_dataset_yaml(dataset_dir: Path) -> str:
    yaml_path = Path("dataset.yaml")
    
    # Tạo danh sách 20 tên class: 0, 0D, 1, 1D... 9, 9D
    class_names = []
    for i in range(10):
        class_names.extend([str(i), f"{i}D"])

    data = {
        "path":  str(dataset_dir.resolve()),
        "train": "images/train",
        "val":   "images/train",  # Nếu chưa có thư mục val riêng, trỏ tạm vào train
        "nc":    20,
        "names": class_names,
    }
    
    with open(yaml_path, "w") as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
    
    print(f"[INFO] Đã tạo file cấu hình: {yaml_path} (NC=20)")
    return str(yaml_path)

# ─────────────────────────────────────────────────────────────
# 3. HÀM KIỂM TRA DATASET (TRÁNH LỖI CLASS > 19)
# ─────────────────────────────────────────────────────────────
def check_dataset_health(dataset_dir: Path):
    print("[INFO] Đang kiểm tra sức khỏe Dataset...")
    
    # XÓA FILE CACHE CŨ (BẮT BUỘC)
    for cache_file in dataset_dir.rglob("*.cache"):
        cache_file.unlink()
        print(f"  - Đã xóa cache cũ: {cache_file.name}")

    lbl_dir = dataset_dir / "labels" / "train"
    if not lbl_dir.exists():
        print(f"[ERROR] Không tìm thấy thư mục label tại: {lbl_dir}")
        return False

    labels = list(lbl_dir.glob("*.txt"))
    for lbl in labels:
        lines = lbl.read_text().strip().splitlines()
        for line in lines:
            parts = line.split()
            if len(parts) > 0:
                class_id = int(parts[0])
                if class_id < 0 or class_id > 19:
                    print(f"  [CRITICAL] File {lbl.name} chứa class_id={class_id} (Vượt quá giới hạn 0-19!)")
                    return False
    print("[OK] Dataset hợp lệ cho cấu hình 20 class.")
    return True

# ─────────────────────────────────────────────────────────────
# 4. HÀM TRAIN CHÍNH
# ─────────────────────────────────────────────────────────────
def run_training():
    from ultralytics import YOLO
    
    # Đảm bảo dataset ổn định
    if not check_dataset_health(CFG["dataset_dir"]):
        print("[STOP] Dừng lại để sửa lỗi dataset.")
        return

    yaml_path = make_dataset_yaml(CFG["dataset_dir"])
    
    # Load model gốc
    model = YOLO(CFG["base_model"])

    print(f"[START] Bắt đầu huấn luyện phiên bản: {CFG['run_name']}")
    model.train(
        data      = yaml_path,
        epochs    = CFG["epochs"],
        imgsz     = CFG["img_size"],
        batch     = CFG["batch"],
        device    = CFG["device"],
        workers   = CFG["workers"],
        project   = CFG["project"],
        name      = CFG["run_name"],
        exist_ok  = True,

        # Tối ưu hóa cho nhận diện chữ số (NHỎ & SÁT NHAU)
        optimizer     = "AdamW",
        lr0           = 0.001,
        warmup_epochs = 3,
        
        # AUGMENTATION: Tắt các hiệu ứng làm biến dạng số
        hsv_h       = 0.015,
        hsv_s       = 0.7,
        hsv_v       = 0.4,
        degrees     = 2.0,     # Xoay nhẹ
        translate   = 0.1,
        scale       = 0.1,     # Thu phóng nhẹ
        shear       = 0.0,     # TẮT: Không làm méo số
        perspective = 0.0,     # TẮT
        flipud      = 0.0,     # TẮT: Không lật ngược số
        fliplr      = 0.0,     # TẮT: Không lật ngang số
        mosaic      = 0.0,     # TẮT: Không ghép ảnh (Cực quan trọng cho số nhỏ)
        mixup       = 0.0,     # TẮT
        copy_paste  = 0.0,
        
        # Logistic
        patience    = 30,      # Dừng sớm nếu không tiến bộ sau 30 epoch
        save        = True,
        plots       = True,
    )

    best_model = Path(CFG["project"]) / CFG["run_name"] / "weights" / "best.pt"
    print(f"\n[DONE] Train hoàn tất! Model lưu tại: {best_model}")

# ─────────────────────────────────────────────────────────────
# 5. CHẠY CHƯƠNG TRÌNH
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    # Cài đặt xử lý lỗi PyTorch 2.6 (nếu có)
    import torch
    try:
        from ultralytics.nn.tasks import DetectionModel
        torch.serialization.add_safe_globals([DetectionModel, torch.nn.Sequential])
    except:
        pass

    run_training()