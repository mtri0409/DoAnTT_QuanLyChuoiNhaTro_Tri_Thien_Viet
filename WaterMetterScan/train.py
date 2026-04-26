"""
Train YOLOv8 để nhận dạng chữ số (0-9) trên đồng hồ điện/nước.

Cách dùng:
  python train.py              # train từ đầu
  python train.py --resume     # tiếp tục train từ checkpoint
  python train.py --val        # chỉ đánh giá model đã train
  python train.py --predict anh.jpg   # test thử 1 ảnh
"""

import argparse
from pathlib import Path
import yaml

# ─────────────────────────────────────────────────────────────
# CẤU HÌNH
# ─────────────────────────────────────────────────────────────
CFG = {
    "base_model":  "yolov8n.pt",
    "epochs":       150,
    "img_size":     640,
    "batch":        16,
    "device":       "cpu",   # đổi thành 0 nếu có GPU
    "workers":      0,       # để 0 khi dùng CPU trên Windows
    "project":     "WaterMetterScan/runs/detect",
    "run_name":    "meter_digits",
    "conf_thresh":  0.4,
    "dataset_dir": Path("dataset"),
}

CLASSES = {i: str(i) for i in range(10)}


# ─────────────────────────────────────────────────────────────
# PATCH PYTORCH 2.6 — gọi trước khi load bất kỳ model nào
# ─────────────────────────────────────────────────────────────
def patch_torch_safe_load():
    """
    PyTorch 2.6 đổi weights_only=True làm mặc định.
    Ultralytics chưa kịp cập nhật -> cần add_safe_globals thủ công.
    """
    import torch
    import torch.nn as nn

    safe_globals = [
        nn.Sequential,
        nn.ModuleList,
        nn.ModuleDict,
    ]

    try:
        from ultralytics.nn.tasks import DetectionModel
        safe_globals.append(DetectionModel)
    except ImportError:
        pass

    try:
        torch.serialization.add_safe_globals(safe_globals)
        print("[INFO] Đã patch torch.serialization cho PyTorch 2.6+")
    except AttributeError:
        pass  # PyTorch < 2.6 không có hàm này, bỏ qua


# ─────────────────────────────────────────────────────────────
# TẠO dataset.yaml
# ─────────────────────────────────────────────────────────────
def make_dataset_yaml(dataset_dir: Path) -> str:
    yaml_path = Path("dataset.yaml")
    data = {
        "path":  str(dataset_dir.resolve()),
        "train": "images/train",
        "val":   "images/val",
        "nc":    10,
        "names": [str(i) for i in range(10)],
    }
    with open(yaml_path, "w") as f:
        yaml.dump(data, f, default_flow_style=False, allow_unicode=True)
    print(f"[INFO] Da tao {yaml_path}")
    return str(yaml_path)


# ─────────────────────────────────────────────────────────────
# KIEM TRA DATASET
# ─────────────────────────────────────────────────────────────
def check_dataset(dataset_dir: Path):
    errors = []
    for split in ["train", "val"]:
        img_dir = dataset_dir / "images" / split
        lbl_dir = dataset_dir / "labels" / split
        if not img_dir.exists():
            errors.append(f"Thieu thu muc: {img_dir}")
        if not lbl_dir.exists():
            errors.append(f"Thieu thu muc: {lbl_dir}")

    if errors:
        print("\n[ERROR] Dataset chua dung cau truc:")
        for e in errors:
            print(f"  x {e}")
        raise SystemExit(1)

    for split in ["train", "val"]:
        imgs = list((dataset_dir / "images" / split).glob("*.*"))
        lbls = list((dataset_dir / "labels" / split).glob("*.txt"))
        print(f"[INFO] {split:5s}: {len(imgs):4d} anh | {len(lbls):4d} label")


# ─────────────────────────────────────────────────────────────
# TRAIN
# ─────────────────────────────────────────────────────────────
def train(resume: bool = False):
    patch_torch_safe_load()          # patch truoc khi import YOLO
    from ultralytics import YOLO

    dataset_dir = CFG["dataset_dir"]
    check_dataset(dataset_dir)
    yaml_path = make_dataset_yaml(dataset_dir)

    last_ckpt = Path(CFG["project"]) / CFG["run_name"] / "weights" / "last.pt"

    if resume and last_ckpt.exists():
        print(f"[INFO] Resume tu: {last_ckpt}")
        model = YOLO(str(last_ckpt))
    else:
        print(f"[INFO] Train moi tu: {CFG['base_model']}")
        model = YOLO(CFG["base_model"])

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

        optimizer     = "AdamW",
        lr0           = 0.001,
        lrf           = 0.01,
        warmup_epochs = 5,

        hsv_h       = 0.015,
        hsv_s       = 0.5,
        hsv_v       = 0.4,
        degrees     = 5,
        translate   = 0.1,
        scale       = 0.4,
        shear       = 2.0,
        perspective = 0.0005,
        flipud      = 0.0,      # KHONG lat doc (so bi nguoc)
        fliplr      = 0.0,      # KHONG lat ngang (so bi nguoc)
        mosaic      = 0.8,
        mixup       = 0.1,
        copy_paste  = 0.1,

        patience    = 30,
        save        = True,
        save_period = 10,
        cache       = False,    # False khi dung CPU, tranh OOM
        plots       = True,
        verbose     = True,
    )

    best = Path(CFG["project"]) / CFG["run_name"] / "weights" / "best.pt"
    print(f"\n{'='*50}")
    print(f"[DONE] Model tot nhat: {best}")
    print(f"       Copy duong dan nay vao MODEL_PATH trong main.py")
    print(f"{'='*50}")


# ─────────────────────────────────────────────────────────────
# VALIDATE
# ─────────────────────────────────────────────────────────────
def validate():
    patch_torch_safe_load()
    from ultralytics import YOLO

    best = Path(CFG["project"]) / CFG["run_name"] / "weights" / "best.pt"
    if not best.exists():
        print(f"[ERROR] Chua co model tai {best}. Chay train truoc.")
        return

    yaml_path = make_dataset_yaml(CFG["dataset_dir"])
    model = YOLO(str(best))
    metrics = model.val(data=yaml_path, imgsz=CFG["img_size"],
                        device=CFG["device"])

    print(f"\n{'='*40}")
    print(f"mAP@50     : {metrics.box.map50:.4f}")
    print(f"mAP@50-95  : {metrics.box.map:.4f}")
    print(f"Precision  : {metrics.box.p.mean():.4f}")
    print(f"Recall     : {metrics.box.r.mean():.4f}")
    print(f"{'='*40}")
    print("Nguong danh gia:")
    print("  mAP@50 > 0.90  ->  tot, dung duoc")
    print("  mAP@50 0.75-0.90  ->  them data, train lai")
    print("  mAP@50 < 0.75  ->  kiem tra lai label")


# ─────────────────────────────────────────────────────────────
# PREDICT
# ─────────────────────────────────────────────────────────────
def predict(image_path: str):
    patch_torch_safe_load()
    from ultralytics import YOLO

    best = Path(CFG["project"]) / CFG["run_name"] / "weights" / "best.pt"
    if not best.exists():
        print(f"[ERROR] Chua co model tai {best}.")
        return

    model  = YOLO(str(best))
    result = model(image_path, conf=CFG["conf_thresh"], save=True)[0]

    boxes = []
    for box in result.boxes:
        class_id      = int(box.cls)
        conf          = float(box.conf)
        x1, _, x2, _ = box.xyxy[0]
        boxes.append(((x1 + x2) / 2, str(class_id), conf))

    boxes.sort(key=lambda b: b[0])
    number = "".join(b[1] for b in boxes)

    print(f"\n[RESULT] Doc duoc: {number}")
    for i, (x, digit, conf) in enumerate(boxes):
        print(f"  O {i}: '{digit}'  conf={conf:.3f}")
    print("[INFO] Anh ket qua luu tai: runs/detect/predict/")


# ─────────────────────────────────────────────────────────────
# CLI
# ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Meter YOLO Trainer")
    parser.add_argument("--resume",  action="store_true",
                        help="Tiep tuc train tu checkpoint cuoi")
    parser.add_argument("--val",     action="store_true",
                        help="Chi danh gia model da train")
    parser.add_argument("--predict", type=str, metavar="IMAGE",
                        help="Test thu 1 anh")
    args = parser.parse_args()

    if args.val:
        validate()
    elif args.predict:
        predict(args.predict)
    else:
        train(resume=args.resume)