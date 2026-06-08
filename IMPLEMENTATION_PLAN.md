# Kế hoạch: Chức năng Đăng ký Người Thân Đến Ở Nhờ

## 1. Mở rộng Entity

### 1.1 RoomMember.java
**Thêm field:**
- `type` (Enum: MAIN_TENANT, STAYING_WITH, VISITING) - để phân biệt người chính thức / ở nhờ / đến chơi
- `relationshipType` (String) - mối quan hệ (vợ/chồng, con, anh em, v.v.)
- `registrationDate` (LocalDateTime) - ngày đăng ký
- `approvalStatus` (Enum: PENDING, APPROVED, REJECTED)
- `approvedBy` (Profile) - người quản lý duyệt dơn
- `approvedAt` (LocalDateTime)
- `rejectionReason` (String)

### 1.2 Profile.java
**Thêm field:**
- `profilePhoto` (String) - ảnh đại diện (ngoài ảnh CCCD)
- `relationship` (String) - mối quan hệ với chủ hợp đồng

### 1.3 Vehicle.java
**Thêm field:**
- `registeredByMember` (RoomMember) - người nào đăng ký biển số xe
- `memberRelation` (String) - mối quan hệ của người đăng ký

---

## 2. Enum mới

### RoomMemberType.java
```
MAIN_TENANT      // Người chính thức trong hợp đồng
STAYING_WITH     // Người ở nhờ (thường xuyên)
VISITING         // Khách đến chơi (tạm thời)
```

### RegistrationStatus.java
```
PENDING      // Chờ duyệt
APPROVED     // Đã duyệt
REJECTED     // Bị từ chối
CANCELLED    // Bị hủy
```

---

## 3. DTO mới

### GuestRegistrationRequestDTO
```
profileId (Long)                 - ID Profile người thân (null nếu tạo mới)
fullName (String)                - Họ tên
phone (String)                   - SĐT
email (String)                   - Email
identityNumber (String)          - CCCD
idFrontImage (MultipartFile)     - Ảnh CCCD mặt trước
idBackImage (MultipartFile)      - Ảnh CCCD mặt sau
idIssueDate (LocalDate)          - Ngày cấp
idExpirationDate (LocalDate)     - Ngày hết hạn
idIssuePlace (String)            - Nơi cấp
address (String)                 - Địa chỉ
relationship (String)            - Mối quan hệ (vợ/chồng, con, anh em, v.v.)
memberType (RoomMemberType)      - Loại thành viên (STAYING_WITH, VISITING)
vehicles (List<VehicleRegisterDTO>) - Danh sách xe cần đăng ký
roomId (Long)                    - ID phòng (để lấy contract)
```

### VehicleRegisterDTO
```
licensePlate (String)
brand (String)
color (String)
```

### GuestRegistrationResponseDTO
```
registrationId (Long)
profileId (Long)
fullName (String)
phone (String)
memberType (RoomMemberType)
relationship (String)
status (RegistrationStatus)
createdAt (LocalDateTime)
vehicles (List<VehicleDTO>)
```

---

## 4. API Endpoints

### 4.1 Người thuê phòng tạo đơn đăng ký
```
POST /api/v1/tenant/guests/register
Header: Authorization: Bearer {token}
Body: GuestRegistrationRequestDTO
Response: ApiResponse<GuestRegistrationResponseDTO>
```

### 4.2 Quản lý duyệt/từ chối
```
PATCH /api/v1/admin/guests/{registrationId}/approve
PATCH /api/v1/admin/guests/{registrationId}/reject
Body: { rejectionReason: String (optional) }
```

### 4.3 Xem danh sách đơn chờ duyệt
```
GET /api/v1/admin/guests/pending
GET /api/v1/admin/guests/all
```

### 4.4 Xem danh sách người thân đã đăng ký
```
GET /api/v1/tenant/guests
GET /api/v1/tenant/guests/{roomId}
```

---

## 5. Business Logic

### 5.1 Khi tạo đơn đăng ký:
1. Kiểm tra user là TENANT
2. Kiểm tra user có contract ACTIVE ở phòng được chỉ định
3. Nếu profileId null → tạo Profile mới, upload ảnh CCCD
4. Tạo RoomMember mới với type = STAYING_WITH/VISITING, status = PENDING
5. Nếu có vehicles → tạo Vehicle records, gắn với RoomMember
6. Gửi thông báo cho Admin/Quản lý duyệt

### 5.2 Khi Admin duyệt:
1. Cập nhật RoomMember status = APPROVED, approvedAt = now
2. Cập nhật Vehicle status = true (active)
3. Gửi thông báo cho Tenant

### 5.3 Khi Admin từ chối:
1. Cập nhật RoomMember status = REJECTED, rejectionReason
2. Xóa/vô hiệu hóa Vehicle records
3. Gửi thông báo cho Tenant

---

## 6. Thứ tự thực hiện

1. ✅ Tạo Enum: RoomMemberType, RegistrationStatus
2. ✅ Mở rộng Entity: RoomMember, Profile, Vehicle
3. ✅ Tạo DTO: GuestRegistrationRequestDTO, GuestRegistrationResponseDTO, VehicleRegisterDTO
4. ✅ Tạo Repository queries mới
5. ✅ Service: GuestRegistrationService
6. ✅ Controller: GuestRegistrationController
7. ✅ MapStruct Mapper (nếu dùng)
8. ✅ Integration test

