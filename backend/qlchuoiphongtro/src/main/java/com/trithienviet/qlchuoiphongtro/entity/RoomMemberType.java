package com.trithienviet.qlchuoiphongtro.entity;

/**
 * Loại thành viên trong phòng
 */
public enum RoomMemberType {
    MAIN_TENANT("Người thuê chính thức"),
    STAYING_WITH("Người ở nhờ"),
    VISITING("Khách đến chơi");

    private final String description;

    RoomMemberType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
