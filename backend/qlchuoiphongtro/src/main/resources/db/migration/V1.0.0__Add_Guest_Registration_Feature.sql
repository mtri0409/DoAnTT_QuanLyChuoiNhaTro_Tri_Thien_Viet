-- Migration: Add Guest Registration Feature
-- Date: 2026-06-07
-- Description: Thêm các cột và constraints để hỗ trợ chức năng đăng ký người thân

-- =====================================================
-- 1. Thêm cột vào bảng room_members
-- =====================================================

ALTER TABLE room_members
ADD COLUMN type VARCHAR(20) DEFAULT 'MAIN_TENANT' COMMENT 'Loại thành viên: MAIN_TENANT, STAYING_WITH, VISITING';

ALTER TABLE room_members
ADD COLUMN relationship_type VARCHAR(100) COMMENT 'Mối quan hệ: vợ/chồng, con, anh em, v.v.';

ALTER TABLE room_members
ADD COLUMN registration_date DATETIME COMMENT 'Ngày đăng ký người thân';

ALTER TABLE room_members
ADD COLUMN registration_status VARCHAR(20) COMMENT 'Trạng thái duyệt: PENDING, APPROVED, REJECTED, CANCELLED';

ALTER TABLE room_members
ADD COLUMN approved_by BIGINT COMMENT 'ID Profile của người duyệt';

ALTER TABLE room_members
ADD COLUMN approved_at DATETIME COMMENT 'Thời gian duyệt';

ALTER TABLE room_members
ADD COLUMN rejection_reason LONGTEXT COMMENT 'Lý do từ chối';

-- Thêm foreign key
ALTER TABLE room_members
ADD CONSTRAINT fk_room_members_approved_by
FOREIGN KEY (approved_by) REFERENCES profiles(profile_id);

-- Tạo index để tối ưu query
CREATE INDEX idx_room_members_registration_status ON room_members(registration_status);
CREATE INDEX idx_room_members_type ON room_members(type);

-- =====================================================
-- 2. Thêm cột vào bảng profiles
-- =====================================================

ALTER TABLE profiles
ADD COLUMN profile_photo VARCHAR(255) COMMENT 'Ảnh đại diện của người thân';

ALTER TABLE profiles
ADD COLUMN relationship VARCHAR(100) COMMENT 'Mối quan hệ với chủ hợp đồng';

-- =====================================================
-- 3. Thêm cột vào bảng vehicles
-- =====================================================

ALTER TABLE vehicles
ADD COLUMN registered_by_member_id INT COMMENT 'ID RoomMember của người đăng ký xe';

ALTER TABLE vehicles
ADD COLUMN member_relation VARCHAR(100) COMMENT 'Mối quan hệ của người đăng ký xe';

-- Thêm foreign key
ALTER TABLE vehicles
ADD CONSTRAINT fk_vehicles_registered_by_member
FOREIGN KEY (registered_by_member_id) REFERENCES room_members(member_id);

-- Tạo index
CREATE INDEX idx_vehicles_registered_by_member ON vehicles(registered_by_member_id);

-- =====================================================
-- 4. Cập nhật dữ liệu hiện tại (nếu cần)
-- =====================================================

-- Cập nhật type cho các thành viên hiện tại
UPDATE room_members
SET type = 'MAIN_TENANT'
WHERE type IS NULL;

-- Cập nhật registration_status cho các thành viên hiện tại
UPDATE room_members
SET registration_status = 'APPROVED'
WHERE registration_status IS NULL;

-- =====================================================
-- 5. Thêm NOT NULL constraints (sau khi đã update dữ liệu)
-- =====================================================

ALTER TABLE room_members
MODIFY COLUMN type VARCHAR(20) NOT NULL DEFAULT 'MAIN_TENANT';

ALTER TABLE room_members
MODIFY COLUMN registration_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';

-- =====================================================
-- 6. Tạo trigger để tự động set registration_date
-- =====================================================

DELIMITER //

CREATE TRIGGER trg_room_members_registration_date
BEFORE INSERT ON room_members
FOR EACH ROW
BEGIN
    IF NEW.registration_date IS NULL AND NEW.registration_status = 'PENDING' THEN
        SET NEW.registration_date = NOW();
    END IF;
END //

DELIMITER ;

-- =====================================================
-- 7. Tạo view cho việc báo cáo
-- =====================================================

CREATE VIEW vw_pending_guest_registrations AS
SELECT
    rm.member_id,
    rm.profile_id,
    p.full_name,
    p.phone,
    p.email,
    p.identity_number,
    rm.relationship_type,
    rm.type as member_type,
    rm.registration_date,
    r.room_name,
    f.floor_name,
    b.branch_name,
    COUNT(v.vehicle_id) as vehicle_count
FROM room_members rm
INNER JOIN profiles p ON rm.profile_id = p.profile_id
INNER JOIN contracts c ON rm.contract_id = c.contract_id
INNER JOIN rooms r ON c.room_id = r.room_id
INNER JOIN floors f ON r.floor_id = f.floor_id
INNER JOIN branches b ON f.branch_id = b.branch_id
LEFT JOIN vehicles v ON v.registered_by_member_id = rm.member_id
WHERE rm.registration_status = 'PENDING'
GROUP BY rm.member_id, rm.profile_id, p.full_name, p.phone, p.email,
         p.identity_number, rm.relationship_type, rm.type, rm.registration_date,
         r.room_name, f.floor_name, b.branch_name;

-- =====================================================
-- 8. Tạo view cho việc theo dõi xe của người thân
-- =====================================================

CREATE VIEW vw_guest_vehicles AS
SELECT
    v.vehicle_id,
    v.license_plate,
    v.brand,
    v.color,
    rm.member_id,
    p.full_name as guest_name,
    rm.relationship_type,
    r.room_name,
    c.representative_id,
    pr.full_name as tenant_name,
    v.status,
    v.registered_at
FROM vehicles v
INNER JOIN room_members rm ON v.registered_by_member_id = rm.member_id
INNER JOIN profiles p ON rm.profile_id = p.profile_id
INNER JOIN contracts c ON rm.contract_id = c.contract_id
INNER JOIN rooms r ON c.room_id = r.room_id
INNER JOIN profiles pr ON c.representative_id = pr.profile_id
WHERE rm.type IN ('STAYING_WITH', 'VISITING');

-- Commit changes
COMMIT;
