"""
Script hỗ trợ chuẩn bị dataset:
  1. Tạo cấu trúc thư mục
  2. Chia train/val tự động
  3. Augmentation để tăng data từ ít ảnh

Cách dùng:
  python prepare_data.py --setup             # tạo thư mục
  python prepare_data.py --split             # chia train/val từ thư mục raw/
  python prepare_data.py --augment           # tăng cường data
  python prepare_data.py --check             # kiểm tra label hợp lệ
"""

import argparse
import shutil
import random
from pathlib import Path
import cv2
import numpy as np


RAW_DIR     = Path("raw")         # bỏ ảnh + label thô vào đây trước
DATASET_DIR = Path("dataset")
VAL_RATIO   = 0.2                 # 20% làm tập val
SEED        = 42


# ─────────────────────────────────────────────────────────────
# 1. TẠO CẤU TRÚC THƯ MỤC
# ─────────────────────────────────────────────────────────────
def setup():
    dirs = [
        RAW_DIR / "images",
        RAW_DIR / "labels",
        DATASET_DIR / "images" / "train",
        DATASET_DIR / "images" / "val",
        DATASET_DIR / "labels" / "train",
        DATASET_DIR / "labels" / "val",
    ]
    for d in dirs:
        d.mkdir(parents=True, exist_ok=True)

    print("[OK] Đã tạo cấu trúc thư mục:")
    print("""
  raw/
  ├── images/   ← bỏ ảnh chụp vào đây (.jpg / .png)
  └── labels/   ← bỏ file .txt label vào đây (cùng tên với ảnh)

  dataset/      ← script sẽ tự chia train/val vào đây
  """)
    print("HƯỚNG DẪN LABEL BẰNG LabelImg:")
    print("  pip install labelImg")
    print("  labelImg raw/images raw/labels")
    print("  → Chọn format YOLO → kéo box quanh từng chữ số → gán class 0-9")


# ─────────────────────────────────────────────────────────────
# 2. CHIA TRAIN / VAL
# ─────────────────────────────────────────────────────────────
def split():
    img_dir = RAW_DIR / "images"
    lbl_dir = RAW_DIR / "labels"

    images = sorted(list(img_dir.glob("*.jpg")) +
                    list(img_dir.glob("*.png")) +
                    list(img_dir.glob("*.webp")))

    if not images:
        print(f"[ERROR] Không có ảnh trong {img_dir}")
        return

    # Chỉ lấy ảnh có file label tương ứng
    pairs = []
    missing_labels = []
    for img in images:
        lbl = lbl_dir / (img.stem + ".txt")
        if lbl.exists():
            pairs.append((img, lbl))
        else:
            missing_labels.append(img.name)

    if missing_labels:
        print(f"[WARN] {len(missing_labels)} ảnh chưa có label: {missing_labels[:5]}...")

    random.seed(SEED)
    random.shuffle(pairs)

    n_val   = max(1, int(len(pairs) * VAL_RATIO))
    n_train = len(pairs) - n_val

    val_pairs   = pairs[:n_val]
    train_pairs = pairs[n_val:]

    def copy_pair(pair, split_name):
        img, lbl = pair
        shutil.copy2(img, DATASET_DIR / "images" / split_name / img.name)
        shutil.copy2(lbl, DATASET_DIR / "labels" / split_name / (img.stem + ".txt"))

    for p in train_pairs:
        copy_pair(p, "train")
    for p in val_pairs:
        copy_pair(p, "val")

    print(f"[OK] Chia xong: {n_train} train | {n_val} val  (tổng {len(pairs)} ảnh có label)")


# ─────────────────────────────────────────────────────────────
# 3. AUGMENTATION — tăng data từ ảnh gốc
# ─────────────────────────────────────────────────────────────
def augment_image(img: np.ndarray) -> list[np.ndarray]:
    """
    Tạo các biến thể của 1 ảnh.
    Label YOLO không đổi vì chỉ dùng các transform giữ nguyên bbox:
      - brightness/contrast
      - gaussian noise
      - blur nhẹ
      - sharpen
    (KHÔNG xoay/flip để label vẫn đúng)
    """
    results = []

    # Brightness + contrast
    for alpha in [0.7, 1.3]:        # tối / sáng
        for beta in [-20, 20]:       # offset
            aug = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)
            results.append(aug)

    # Gaussian noise
    noise = np.random.normal(0, 10, img.shape).astype(np.int16)
    noisy = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    results.append(noisy)

    # Blur nhẹ
    results.append(cv2.GaussianBlur(img, (3, 3), 0))

    # Sharpen
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    results.append(cv2.filter2D(img, -1, kernel))

    return results


def augment():
    src_img = DATASET_DIR / "images" / "train"
    src_lbl = DATASET_DIR / "labels" / "train"

    images = list(src_img.glob("*.jpg")) + list(src_img.glob("*.png"))

    if not images:
        print(f"[ERROR] Không có ảnh trong {src_img}")
        return

    count = 0
    for img_path in images:
        lbl_path = src_lbl / (img_path.stem + ".txt")
        if not lbl_path.exists():
            continue

        img      = cv2.imread(str(img_path))
        lbl_text = lbl_path.read_text()

        for i, aug in enumerate(augment_image(img)):
            new_name  = f"{img_path.stem}_aug{i}"
            cv2.imwrite(str(src_img / f"{new_name}.jpg"), aug)
            (src_lbl / f"{new_name}.txt").write_text(lbl_text)
            count += 1

    print(f"[OK] Tạo thêm {count} ảnh augmented → tổng: {len(images) + count} ảnh train")


# ─────────────────────────────────────────────────────────────
# 4. KIỂM TRA LABEL
# ─────────────────────────────────────────────────────────────
def check():
    errors   = 0
    warnings = 0

    for split in ["train", "val"]:
        lbl_dir = DATASET_DIR / "labels" / split
        img_dir = DATASET_DIR / "images" / split

        lbls = list(lbl_dir.glob("*.txt"))
        print(f"\n[CHECK] {split}: {len(lbls)} label files")

        for lbl in lbls:
            img = img_dir / (lbl.stem + ".jpg")
            if not img.exists():
                img = img_dir / (lbl.stem + ".png")
            if not img.exists():
                print(f"  [WARN] Label không có ảnh tương ứng: {lbl.name}")
                warnings += 1
                continue

            lines = lbl.read_text().strip().splitlines()
            if not lines:
                print(f"  [WARN] Label rỗng: {lbl.name}")
                warnings += 1
                continue

            for ln, line in enumerate(lines, 1):
                parts = line.strip().split()
                if len(parts) != 5:
                    print(f"  [ERROR] {lbl.name} dòng {ln}: cần 5 giá trị, có {len(parts)}")
                    errors += 1
                    continue

                class_id = int(parts[0])
                coords   = list(map(float, parts[1:]))

                if class_id < 0 or class_id > 9:
                    print(f"  [ERROR] {lbl.name} dòng {ln}: class_id={class_id} không hợp lệ (phải 0-9)")
                    errors += 1

                if not all(0.0 <= v <= 1.0 for v in coords):
                    print(f"  [ERROR] {lbl.name} dòng {ln}: tọa độ ngoài [0,1]: {coords}")
                    errors += 1

    print(f"\n{'='*40}")
    if errors == 0 and warnings == 0:
        print("[OK] Dataset hợp lệ, sẵn sàng train!")
    else:
        print(f"[RESULT] {errors} lỗi, {warnings} cảnh báo")
        if errors > 0:
            print("         Hãy sửa lỗi trước khi train.")


# ─────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Dataset preparation tool")
    parser.add_argument("--setup",   action="store_true", help="Tạo cấu trúc thư mục")
    parser.add_argument("--split",   action="store_true", help="Chia train/val từ raw/")
    parser.add_argument("--augment", action="store_true", help="Tăng cường data")
    parser.add_argument("--check",   action="store_true", help="Kiểm tra label")
    args = parser.parse_args()

    if args.setup:
        setup()
    elif args.split:
        split()
    elif args.augment:
        augment()
    elif args.check:
        check()
    else:
        parser.print_help()