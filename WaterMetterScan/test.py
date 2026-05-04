import os

# Bảng ánh xạ từ ID cũ sang ID chuẩn (0-9)
# Căn cứ vào classes.txt bạn gửi: 0=0, 1=3, 2=5, 3=9, 4=4, 5=7, 6=1, 7=2, 8=8, 9=6
old_to_new = {
    '0': '0', # Số 0 -> 0
    '1': '3', # ID 1 (Số 3) -> 3
    '2': '5', # ID 2 (Số 5) -> 5
    '3': '9', # ID 3 (Số 9) -> 9
    '4': '4', # ID 4 (Số 4) -> 4
    '5': '7', # ID 5 (Số 7) -> 7
    '6': '1', # ID 6 (Số 1) -> 1
    '7': '2', # ID 7 (Số 2) -> 2
    '8': '8', # ID 8 (Số 8) -> 8
    '9': '6'  # ID 9 (Số 6) -> 6
}

# ĐƯỜNG DẪN ĐẾN THƯ MỤC RAW
label_dir = r'D:\DO_AN_TOT_NGHIEP\DoAnTT_QuanLyChuoiNhaTro_Tri_Thien_Viet\pythonOCR\raw\labels'

def fix_labels(directory):
    if not os.path.exists(directory):
        print(f"Lỗi: Không tìm thấy thư mục {directory}")
        return

    count = 0
    for filename in os.listdir(directory):
        if filename.endswith('.txt') and filename != 'classes.txt':
            file_path = os.path.join(directory, filename)
            
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            new_lines = []
            for line in lines:
                parts = line.split()
                if len(parts) > 0:
                    old_id = parts[0]
                    # Chuyển đổi ID nếu nằm trong bảng ánh xạ
                    if old_id in old_to_new:
                        parts[0] = old_to_new[old_id]
                        new_lines.append(" ".join(parts) + "\n")
                    else:
                        new_lines.append(line)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            count += 1
            print(f"[{count}] Đã cập nhật xong: {filename}")

# Thực thi
print("Đang bắt đầu cập nhật file nhãn tại thư mục RAW...")
fix_labels(label_dir)
print("-" * 50)
print("HOÀN THÀNH! Đừng quên sửa lại file classes.txt thành thứ tự 0-9.")