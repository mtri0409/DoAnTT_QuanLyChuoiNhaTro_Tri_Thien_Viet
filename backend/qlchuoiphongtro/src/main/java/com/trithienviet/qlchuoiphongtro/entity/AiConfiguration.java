package com.trithienviet.qlchuoiphongtro.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "ai_configurations")
@Getter
@Setter
public class AiConfiguration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "config_id", columnDefinition = "INT COMMENT 'Primary key, auto increment'")
    private Long configId;

    @Column(name = "api_key", columnDefinition = "TEXT COMMENT 'API Key cho AI Provider'")
    private String apiKey;

    @Column(name = "base_url", columnDefinition = "VARCHAR(255) COMMENT 'Base URL của AI Provider'")
    private String baseUrl;

    @Column(name = "model", columnDefinition = "VARCHAR(100) COMMENT 'Tên model AI'")
    private String model;

    @Column(name = "description", columnDefinition = "VARCHAR(255) COMMENT 'Mô tả cấu hình'")
    private String description;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật cuối'")
    private LocalDateTime updatedAt;

    /**
     * Tạo bảng ai_configurations khi khởi động ứng dụng (Hibernate auto-ddl)
     * Chú ý: Chỉ sử dụng cho môi trường phát triển. Trong production, dùng migration tool (Flyway/Liquibase).
     */
    public static final String CREATE_TABLE_SQL = """
        CREATE TABLE IF NOT EXISTS ai_configurations (
            config_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Primary key, auto increment',
            api_key TEXT COMMENT 'API Key cho AI Provider',
            base_url VARCHAR(255) COMMENT 'Base URL của AI Provider',
            model VARCHAR(100) COMMENT 'Tên model AI',
            description VARCHAR(255) COMMENT 'Mô tả cấu hình',
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Thời gian cập nhật cuối'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Lưu trữ cấu hình AI (API_KEY, BASE_URL, MODEL)';
    """;
}