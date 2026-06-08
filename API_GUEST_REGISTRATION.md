# API Documentation: Chức năng Đăng ký Người Thân Đến Ở Nhờ

## Overview
API cho phép người thuê phòng đăng ký người thân (vợ/chồng, con, anh em, v.v.) đến ở nhờ hoặc đến chơi. Quản lý có thể duyệt hoặc từ chối đơn đăng ký. Hỗ trợ đăng ký biển số xe cho người thân.

---

## Base URL
```
http://localhost:8080/api/v1
```

---

## Authentication
Tất cả endpoint yêu cầu JWT token trong header:
```
Authorization: Bearer {token}
```

---

## 1. Đăng ký Người Thân

### Endpoint
```
POST /tenant/guests/register
```

### Permissions
- **TENANT** (Người thuê phòng)

### Request Body
```json
{
  "profileId": null,                    // null nếu tạo profile mới
  "fullName": "Nguyễn Thị B",
  "phone": "0987654321",
  "email": "b@example.com",
  "identityNumber": "012345678901",
  "idIssueDate": "2020-01-15",
  "idExpirationDate": "2030-01-15",
  "idIssuePlace": "Công an TP. HCM",
  "address": "123 Đường ABC, Quận 1, TP. HCM",
  "relationship": "Vợ",
  "memberType": "STAYING_WITH",        // STAYING_WITH hoặc VISITING
  "roomId": 1,
  "vehicles": [
    {
      "licensePlate": "51A-12345",
      "brand": "Toyota Camry",
      "color": "Trắng"
    }
  ]
}
```

### Response (201 Created)
```json
{
  "status": true,
  "message": "Success",
  "data": {
    "memberId": 1,
    "profileId": 5,
    "fullName": "Nguyễn Thị B",
    "phone": "0987654321",
    "email": "b@example.com",
    "identityNumber": "012345678901",
    "address": "123 Đường ABC, Quận 1, TP. HCM",
    "memberType": "STAYING_WITH",
    "relationship": "Vợ",
    "status": "PENDING",
    "createdAt": "2026-06-07T12:22:31",
    "approvedAt": null,
    "approvedByName": null,
    "rejectionReason": null,
    "vehicles": [
      {
        "brand": "Toyota Camry",
        "licensePlate": "51A-12345"
      }
    ]
  }
}
```

---

## 2. Upload Ảnh CCCD Mặt Trước

### Endpoint
```
PUT /tenant/guests/{memberId}/id-front
```

### Parameters
- `memberId` (path): ID của RoomMember

### Request (Form Data)
```
image: <file>  (MultipartFile - PNG, JPG, JPEG)
```

### Response (200 OK)
```json
{
  "status": true,
  "message": "Success",
  "data": {
    "memberId": 1,
    "profileId": 5,
    "fullName": "Nguyễn Thị B",
    ...
  }
}
```

---

## 3. Upload Ảnh CCCD Mặt Sau

### Endpoint
```
PUT /tenant/guests/{memberId}/id-back
```

### Parameters
- `memberId` (path): ID của RoomMember

### Request (Form Data)
```
image: <file>  (MultipartFile - PNG, JPG, JPEG)
```

### Response (200 OK)
Tương tự endpoint 2

---

## 4. Duyệt Đơn Đăng ký (Admin/Manager)

### Endpoint
```
PATCH /admin/guests/{memberId}/approve
```

### Permissions
- **ADMIN** hoặc **MANAGER**

### Parameters
- `memberId` (path): ID của RoomMember

### Response (200 OK)
```json
{
  "status": true,
  "message": "Success",
  "data": {
    "memberId": 1,
    "profileId": 5,
    "fullName": "Nguyễn Thị B",
    "status": "APPROVED",
    "approvedAt": "2026-06-07T12:25:00",
    "approvedByName": "Quản lý A",
    "vehicles": [
      {
        "brand": "Toyota Camry",
        "licensePlate": "51A-12345"
      }
    ]
  }
}
```

### Side Effects
- Cập nhật trạng thái RoomMember thành APPROVED
- Kích hoạt tất cả Vehicle (status = true)
- Gửi thông báo cho Tenant

---

## 5. Từ Chối Đơn Đăng ký (Admin/Manager)

### Endpoint
```
PATCH /admin/guests/{memberId}/reject
```

### Permissions
- **ADMIN** hoặc **MANAGER**

### Parameters
- `memberId` (path): ID của RoomMember

### Request Body
```json
{
  "rejectionReason": "CCCD không hợp lệ"
}
```

### Response (200 OK)
```json
{
  "status": true,
  "message": "Success",
  "data": {
    "memberId": 1,
    "profileId": 5,
    "fullName": "Nguyễn Thị B",
    "status": "REJECTED",
    "approvedAt": "2026-06-07T12:25:00",
    "rejectionReason": "CCCD không hợp lệ"
  }
}
```

### Side Effects
- Cập nhật trạng thái RoomMember thành REJECTED
- Vô hiệu hóa tất cả Vehicle (status = false)
- Gửi thông báo cho Tenant

---

## 6. Lấy Danh sách Đơn Chờ Duyệt

### Endpoint
```
GET /admin/guests/pending
```

### Permissions
- **ADMIN** hoặc **MANAGER**

### Query Parameters
```
pageNumber=1
pageSize=10
```

### Response (200 OK)
```json
{
  "status": true,
  "message": "Success",
  "data": {
    "content": [
      {
        "memberId": 1,
        "profileId": 5,
        "fullName": "Nguyễn Thị B",
        "status": "PENDING",
        "createdAt": "2026-06-07T12:22:31"
      }
    ],
    "pageNumber": 0,
    "pageSize": 10,
    "totalElements": 5,
    "totalPages": 1,
    "lastPage": true
  }
}
```

---

## 7. Lấy Danh sách Người Thân của Phòng (Tất cả trạng thái)

### Endpoint
```
GET /tenant/guests
```

### Permissions
- **TENANT** (Chỉ xem được phòng của mình)

### Query Parameters
```
roomId=1 (required)
```

### Response (200 OK)
```json
{
  "status": true,
  "message": "Success",
  "data": [
    {
      "memberId": 1,
      "profileId": 5,
      "fullName": "Nguyễn Thị B",
      "memberType": "STAYING_WITH",
      "relationship": "Vợ",
      "status": "PENDING"
    },
    {
      "memberId": 2,
      "profileId": 6,
      "fullName": "Nguyễn Văn C",
      "memberType": "VISITING",
      "relationship": "Bạn",
      "status": "APPROVED"
    }
  ]
}
```

---

## 8. Lấy Danh sách Người Thân Đã Duyệt

### Endpoint
```
GET /tenant/guests/approved
```

### Permissions
- **TENANT**

### Query Parameters
```
roomId=1 (required)
```

### Response (200 OK)
```json
{
  "status": true,
  "message": "Success",
  "data": [
    {
      "memberId": 2,
      "profileId": 6,
      "fullName": "Nguyễn Văn C",
      "memberType": "VISITING",
      "relationship": "Bạn",
      "status": "APPROVED"
    }
  ]
}
```

---

## 9. Lấy Chi tiết Đơn Đăng ký

### Endpoint
```
GET /guests/{memberId}
```

### Permissions
- **PUBLIC** (Ai cũng có thể xem)

### Parameters
- `memberId` (path): ID của RoomMember

### Response (200 OK)
```json
{
  "status": true,
  "message": "Success",
  "data": {
    "memberId": 1,
    "profileId": 5,
    "fullName": "Nguyễn Thị B",
    "phone": "0987654321",
    "email": "b@example.com",
    "identityNumber": "012345678901",
    "address": "123 Đường ABC, Quận 1, TP. HCM",
    "memberType": "STAYING_WITH",
    "relationship": "Vợ",
    "status": "PENDING",
    "createdAt": "2026-06-07T12:22:31",
    "vehicles": [
      {
        "brand": "Toyota Camry",
        "licensePlate": "51A-12345"
      }
    ]
  }
}
```

---

## 10. Hủy Đơn Đăng ký

### Endpoint
```
PATCH /guests/{memberId}/cancel
```

### Permissions
- **TENANT** (Chủ đơn)
- **ADMIN** hoặc **MANAGER**

### Parameters
- `memberId` (path): ID của RoomMember

### Response (200 OK)
```json
{
  "status": true,
  "message": "Success",
  "data": {
    "memberId": 1,
    "status": "CANCELLED"
  }
}
```

### Side Effects
- Cập nhật trạng thái RoomMember thành CANCELLED
- Xóa tất cả Vehicle liên quan

---

## Enum Values

### RoomMemberType
```
MAIN_TENANT    // Người thuê chính thức
STAYING_WITH   // Người ở nhờ (thường xuyên)
VISITING       // Khách đến chơi (tạm thời)
```

### RegistrationStatus
```
PENDING        // Chờ duyệt
APPROVED       // Đã duyệt
REJECTED       // Bị từ chối
CANCELLED      // Bị hủy
```

---

## Error Responses

### 400 Bad Request
```json
{
  "status": false,
  "message": "Validation error",
  "errors": ["Họ tên không được để trống"]
}
```

### 401 Unauthorized
```json
{
  "status": false,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "status": false,
  "message": "Bạn không có quyền thực hiện hành động này"
}
```

### 404 Not Found
```json
{
  "status": false,
  "message": "Không tìm thấy RoomMember với ID: 999"
}
```

### 409 Conflict
```json
{
  "status": false,
  "message": "Biển số xe 51A-12345 đã tồn tại"
}
```

---

## Database Schema Changes

### Thêm cột vào `room_members`
```sql
ALTER TABLE room_members ADD COLUMN type VARCHAR(20);
ALTER TABLE room_members ADD COLUMN relationship_type VARCHAR(100);
ALTER TABLE room_members ADD COLUMN registration_date DATETIME;
ALTER TABLE room_members ADD COLUMN registration_status VARCHAR(20);
ALTER TABLE room_members ADD COLUMN approved_by BIGINT;
ALTER TABLE room_members ADD COLUMN approved_at DATETIME;
ALTER TABLE room_members ADD COLUMN rejection_reason TEXT;

ALTER TABLE room_members ADD FOREIGN KEY (approved_by) REFERENCES profiles(profile_id);
```

### Thêm cột vào `profiles`
```sql
ALTER TABLE profiles ADD COLUMN profile_photo VARCHAR(255);
ALTER TABLE profiles ADD COLUMN relationship VARCHAR(100);
```

### Thêm cột vào `vehicles`
```sql
ALTER TABLE vehicles ADD COLUMN registered_by_member_id INT;
ALTER TABLE vehicles ADD COLUMN member_relation VARCHAR(100);

ALTER TABLE vehicles ADD FOREIGN KEY (registered_by_member_id) REFERENCES room_members(member_id);
```

---

## Example Flow

### 1. Tenant đăng ký người thân
```bash
curl -X POST http://localhost:8080/api/v1/tenant/guests/register \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Nguyễn Thị B",
    "phone": "0987654321",
    "email": "b@example.com",
    "identityNumber": "012345678901",
    "idIssueDate": "2020-01-15",
    "idExpirationDate": "2030-01-15",
    "idIssuePlace": "Công an TP. HCM",
    "address": "123 Đường ABC",
    "relationship": "Vợ",
    "memberType": "STAYING_WITH",
    "roomId": 1,
    "vehicles": [{"licensePlate": "51A-12345", "brand": "Toyota"}]
  }'
```

### 2. Admin kiểm tra danh sách chờ duyệt
```bash
curl http://localhost:8080/api/v1/admin/guests/pending \
  -H "Authorization: Bearer {admin-token}"
```

### 3. Admin duyệt đơn
```bash
curl -X PATCH http://localhost:8080/api/v1/admin/guests/1/approve \
  -H "Authorization: Bearer {admin-token}"
```

---

## Notes
- Khi duyệt, tất cả xe sẽ được kích hoạt (status = true)
- Khi từ chối, tất cả xe sẽ bị vô hiệu hóa (status = false)
- Biển số xe phải unique trong hệ thống
- Mỗi người chỉ được đăng ký 1 lần tại mỗi phòng
- Notification sẽ được gửi cho Admin khi có đơn mới
