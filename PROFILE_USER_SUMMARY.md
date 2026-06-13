# SUMMARY - MODULE QUAN LY PROFILE + USER + VEHICLE + NOTIFICATION
# Script cho AI viet bao cao Word - chi giai thich co ban, khong code

## 1. TONG QUAN MODULE

Module quan ly nguoi dung cua he thong Quan Ly Chuoi Nha Tro. Gom 4 thanh phan chinh:
- **Profile (Ho so)**: Thong tin ca nhan (ten, CCCD, anh, dia chi, lien he)
- **User (Tai khoan)**: Dang nhap, phan quyen, mat khau, trang thai
- **Vehicle (Xe)**: Dang ky phuong tien, bien so xe, quan ly bai xe
- **Notification (Thong bao)**: Gui/nhan thong bao, email, nhac nho

Phan tach ro rang: Profile = ho so, User = tai khoan. Mot nguoi co the co ho so nhung chua co tai khoan (khach vang lai).

## 2. CAC DOI TUONG SU DUNG

| Doi tuong | Mo ta | Vi du |
|-----------|-------|-------|
| **Khach thue chinh** | Nguoi ky hop dong, co Profile + User + Role TENANT | Nguoi thue phong dai han |
| **Nguoi o chung** | Nguoi than o cung, co Profile + RoomMember, chua co User | Vo/chong/con cua khach thue |
| **Khach vang lai** | Khach chua co hop dong, chi co Profile | Khach den xem phong |
| **Nhan vien** | Admin, Staff, Guard - co Profile + User + Role tuong ung | Quan ly vien, bao ve |

## 3. MOI QUAN HE GIUA CAC THANH PHAN

```
User (Tai khoan)  <--1-1-->  Profile (Ho so)
  |                              |
  |                              |--1-n--> Vehicle (Xe)
  |                              |--1-n--> Contract (Hop dong)
  |                              |--1-1--> RoomMember (Thanh vien phong)
  |
  |--1-n--> Notification (Thong bao)
```

- Mot User chi co mot Profile (1-1)
- Mot Profile co nhieu xe (1-n)
- Mot Profile co nhieu hop dong (1-n)
- Mot Profile la mot thanh vien phong (1-1)
- Mot User nhan nhieu thong bao (1-n)

## 4. PHAN QUYEN (RBAC)

He thong co 4 vai tro:

| Vai tro | Nguoi dung | Quyen han |
|---------|-----------|-----------|
| **ADMIN** | Quan tri vien | Toan quyen: tao/sua/xoa user, profile, phan quyen, duyet don, gui thong bao toan he thong |
| **STAFF** | Nhan vien quan ly | Quan ly ho so khach, xe, thong bao, xem bao cao. Khong duoc phan quyen. |
| **TENANT** | Khach thue | Xem thong tin ca nhan, dang ky xe, dang ky nguoi than, doi mat khau, xem hoa don |
| **GUARD** | Bao ve | Quet bien so xe, xem lich su xe vao/ra |

Cach hoat dong: Khi dang nhap, he thong tao JWT token chua username. Moi lan goi API, token gui kem. He thong kiem tra token, lay role, so sanh voi danh sach duoc phep truy cap endpoint do.

## 5. CHUC NANG CHINH

### 5.1. Quan ly Ho so (Profile)

**Tao ho so moi:**
- Admin nhap thong tin: ho ten, so dien thoai (10 so), email, CCCD (12 so), dia chi, ngay cap, ngay het han, noi cap
- Upload anh CCCD mat truoc, mat sau, anh chan dung
- Ho so duoc luu, chua co tai khoan dang nhap

**Phan loai ho so:**
- Khach thue: co hop dong, role = TENANT
- Nhan vien noi bo: role = ADMIN/STAFF/GUARD
- Khach vang lai: chua co hop dong, chua co tai khoan
- Ho so chua co tai khoan: danh sach rieng de admin tao tai khoan sau

**Cap nhat ho so:**
- Admin co the sua tat ca thong tin
- Khach thue tu sua mot so thong tin ca nhan
- Khong cho xoa ho so neu dang co hop dong ACTIVE

**Khoa/Mo khoa ho so:**
- Khoa: vo hieu hoa tai khoan + xe + ho so
- Mo khoa: kich hoat lai toan bo
- Ho so da khoa van giu du lieu hop dong lich su

### 5.2. Quan ly Tai khoan (User)

**Tao tai khoan - 2 cach:**

Cach 1: Admin tao thu cong
- Chon ho so chua co tai khoan
- Nhap username, password
- He thong gan role = TENANT (mac dinh)
- Gui email thong bao tai khoan

Cach 2: Tu dong generate
- Chon ho so
- He thong tu dong: username = email, password = so dien thoai
- Gui email thong bao
- Tien loi khi tao nhieu tai khoan

**Phan quyen:**
- Admin thay doi role cua user bat ky
- Vi du: nhan vien thang chuc Admin, hoac khach thue lam them Staff

**Khoa/Mo khoa tai khoan:**
- Admin bat/tat trang thai tai khoan
- Khi khoa: khong dang nhap duoc, thong bao "Tai khoan da bi khoa"

**Doi mat khau:**
- Nguoi dung tu doi: nhap mat khau cu + mat khau moi
- Admin reset: tao mat khau ngau nhien 10 ky tu, gui email

**Quen mat khau:**
- Nhap email -> he thong gui OTP (ma xac thuc)
- Nhap OTP dung -> cho phep tao mat khau moi

### 5.3. Quan ly Xe (Vehicle)

**Dang ky xe:**
- Khach thue nhap: bien so xe, hang xe, mau xe
- He thong tu dong gan phong dua vao hop dong dang ACTIVE
- Bien so xe khong duoc trung (kiem tra unique)

**Quan ly xe:**
- Admin xem danh sach xe theo chi nhanh, loc theo trang thai
- Tim kiem xe theo bien so, ten chu xe
- Xem chi tiet: thong tin xe, chu xe, phong

**Xoa/Khoi phuc xe:**
- Xoa: chuyen trang thai ve khong hoat dong (soft delete)
- Khoi phuc: admin kich hoat lai
- Khong xoa vinh vien de giu lich su

**Lien ket voi bai xe:**
- Xe dang ky duoc tu dong nhan dien khi vao/ra bai xe
- He thong AI quet bien so -> so sanh voi danh sach dang ky
- Luu lich su vao/ra (ParkingLog)

### 5.4. Dang ky Nguoi than (Guest Registration)

**Muc dich:** Cho phep khach thue dang ky nguoi o chung hoac khach den tham.

**Loai dang ky:**
- **STAYING_WITH**: Nguoi o chung lau dai (vo/chong/con) -> can duyet, co CCCD
- **VISITING**: Khach den tham ngan ngay -> can duyet, khong o qua dem

**Luong dang ky:**
1. Khach thue nhap thong tin nguoi than: ho ten, CCCD, dien thoai, moi quan he
2. Upload anh CCCD mat truoc, mat sau
3. Dang ky xe neu co (bien so, hang xe)
4. Gui don -> cho admin duyet

**Luong duyet:**
1. Admin xem danh sach don cho duyet
2. Xem chi tiet: thong tin, anh CCCD, xe
3. **Duyet**: kich hoat nguoi than + xe, gui thong bao "duyet thanh cong"
4. **Tu choi**: nhap ly do, huy xe da dang ky, gui thong bao "bi tu choi"

**Huy don:**
- Khach thue co the huy don truoc khi duyet
- Admin co the huy don da duyet

### 5.5. Thong bao (Notification)

**Gui thong bao - 3 cach:**

Cach 1: Gui ca nhan
- Chon nguoi (theo profileId)
- Nhap tieu de, noi dung
- Gui qua: thong bao trong app + email

Cach 2: Gui theo chi nhanh
- Chon chi nhanh
- Gui den tat ca user trong chi nhanh do
- Phu hop thong bao chung (tang gia, sua chua, v.v.)

Cach 3: Khach vang lai lien he
- Khach chua co tai khoan gui yeu cau
- He thong chuyen den admin xu ly

**Nhan thong bao:**
- User xem danh sach thong bao cua minh
- Dem so thong bao chua doc
- Danh dau da doc

**Tu dong gui:**
- Nhac nho cap nhat CCCD: chay dinh ky, tim ho so thieu thong tin -> gui thong bao
- Nhac no hoa don: tu dong gui khi hoa don qua han
- Thong bao hoa don moi: gui khi admin phat hanh hoa don

## 6. CAC LUONG HOAT DONG CHINH

### Luong 1: Tao Khach Thue Moi (Tu dau den cuoi)

```
B1: Admin tao Profile (nhap thong tin, upload CCCD)
B2: Admin tao User (2 cach: thu cong hoac auto-generate)
B3: He thong gan role = TENANT, gui email thong bao
B4: Khach thue dang nhap, doi mat khau (neu muon)
B5: Khach thue dang ky xe (nhap bien so, hang xe)
B6: Xe duoc kich hoat, tu dong lien ket voi phong
```

### Luong 2: Dang ky Nguoi o Chung

```
B1: Khach thue (TENANT) dang ky nguoi than
B2: Nhap thong tin ca nhan, moi quan he, loai (o chung / tham)
B3: Upload anh CCCD
B4: Dang ky xe neu co
B5: Gui don -> trang thai PENDING (cho duyet)
B6: Admin xem don, kiem tra thong tin
B7a: DUYET -> kich hoat nguoi than + xe -> gui thong bao
B7b: TU CHOI -> nhap ly do -> huy xe -> gui thong bao
```

### Luong 3: Quen Mat khau

```
B1: Nguoi dung nhap email
B2: He thong gui OTP den email
B3: Nguoi dung nhap OTP
B4: OTP dung -> cho phep tao mat khau moi
B5: Dang nhap bang mat khau moi
```

### Luong 4: Khoa/Mo khoa Tai khoan

```
B1: Admin quyet dinh khoa tai khoan (vi pham, nghi thue, v.v.)
B2: Chuyen trang thai ve khong hoat dong
B3: User khong dang nhap duoc
B4: Khi can: Admin mo khoa -> kich hoat lai
B5: Tai khoan, xe, ho so deu duoc khoi phuc
```

### Luong 5: Nhac nho Tu dong

```
B1: He thong chay dinh ky (22:05 moi ngay)
B2: Quet ho so thieu thong tin (CCCD, anh, dia chi)
B3: Gui thong bao nhac nho den user
B4: User cap nhat thong tin
```

## 7. DIEM DAC BIET CUA MODULE

1. **Phan tach Profile-User**: Ho so va tai khoan tach roi, cho phep co ho so truoc, tao tai khoan sau. Ho tro khach vang lai chua co tai khoan.

2. **Auto-generate tai khoan**: Tiet kiem thoi gian tao nhieu tai khoan, username=email, password=phone.

3. **Soft delete**: Khong xoa vinh vien, chi vo hieu hoa. Khoi phuc duoc khi can. Gi du lieu lich su.

4. **Dang ky nguoi than co duyet**: Dam bao an ninh, kiem soat nguoi o trong nha tro. Phan biet o chung lau dai va khach tham ngan ngay.

5. **Thong bao da kenh**: Trong app + email, gui ca nhan hoac theo nhom chi nhanh.

6. **Scheduler tu dong**: Nhac nho cap nhat CCCD, nhac no hoa don, thong bao hoa don moi - khong can thao tac tay.

7. **Lien ket bai xe**: Xe dang ky tu dong nhan dien qua AI, khong can the giu xe.

## 8. CAC TRANG THAI QUAN TRONG

| Thanh phan | Trang thai | Y nghia |
|------------|-----------|---------|
| **User** | ACTIVE / INACTIVE | Tai khoan dang hoat dong hay bi khoa |
| **Profile** | ACTIVE / INACTIVE | Ho so dang su dung hay da xoa |
| **Vehicle** | ACTIVE / INACTIVE | Xe dang dang ky hay da huy |
| **RoomMember** | PENDING / APPROVED / REJECTED / CANCELLED | Don dang ky cho duyet / da duyet / bi tu choi / da huy |
| **Contract** | ACTIVE / EXPIRED / TERMINATED | Hop dong dang hieu luc / het han / cham dut |

## 9. GIAO DIEN FRONTEND LIEN QUAN

### Web Admin
- Danh sach user: bang hien thi, loc theo role, trang thai
- Danh sach profile: loc khach thue / nhan vien / chua co tai khoan
- Form tao profile: nhap thong tin, upload anh
- Form tao user: chon profile, nhap username/password
- Phan quyen: dropdown chon role
- Duyet don nguoi than: xem thong tin, anh, xe, nut duyet/tu choi
- Thong bao: soan thu, chon nguoi nhan

### Web Tenant
- Thong tin ca nhan: xem/sua ho so
- Doi mat khau: form nhap cu/moi
- Xe cua toi: danh sach, dang ky moi
- Nguoi than: danh sach, dang ky moi, xem trang thai duyet
- Thong bao: danh sach, danh dau da doc

### Mobile App
- Profile: xem thong tin, cap nhat
- Xe: dang ky, xem danh sach
- Thong bao: nhan push notification, xem danh sach
- Hoa don: xem, thanh toan VNPay

## 10. TOM TAT CHO BAO CAO

Module Profile + User la nen tang cua he thong, quan ly toan bo thong tin nguoi dung tu khach thue, nhan vien den khach vang lai. Diem manh:

- Thiet ke phan tach Profile-User linh hoat
- Phan quyen 4 cap ro rang
- Dang ky nguoi than co kiem soat
- Tu dong hoa nhieu tac vu (tao tai khoan, gui thong bao, nhac nho)
- Soft delete bao toan du lieu
- Tich hop email + thong bao noi bo
- Lien ket voi bai xe thong minh

Phu hop voi thuc te quan ly nha tro: nhieu loai nguoi (chu thue, o chung, khach tham), can kiem soat ra vao, thong bao kip thoi, bao mat thong tin.
