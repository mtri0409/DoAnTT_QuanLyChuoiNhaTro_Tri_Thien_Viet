package com.trithienviet.qlchuoiphongtro.entity;

/**
 * Trạng thái đơn đăng ký người thân
 */
public enum RegistrationStatus {
    PENDING("Chờ duyệt"),
    APPROVED("Đã duyệt"),
    REJECTED("Bị từ chối"),
    CANCELLED("Bị hủy");

    private final String description;

    RegistrationStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
