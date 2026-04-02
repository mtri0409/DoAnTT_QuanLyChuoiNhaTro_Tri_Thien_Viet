package com.trithienviet.qlchuoiphongtro.entity;

public enum ContractStatus {
    PENDING, // Chờ bắt đầu
    ACTIVE, // Đang hiệu lực
    EXPIRED, // Hết hạn tự nhiên
    TERMINATED, // Chấm dứt sớm
    CANCELLED, // Hủy trước khi active
    DEPOSITED // Đã cọc
}