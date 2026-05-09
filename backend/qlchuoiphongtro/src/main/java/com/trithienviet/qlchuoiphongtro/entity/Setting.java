package com.trithienviet.qlchuoiphongtro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity // Đừng quên @Entity để JPA nhận diện nhé
@Table(name="settings")
public class Setting {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Tên hệ thống không được để trống")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Hotline là bắt buộc")
    @Pattern(regexp = "^(0|\\+84)[0-9]{9,10}$", message = "Số điện thoại không đúng định dạng")
    private String hotline;

    @Email(message = "Email không hợp lệ")
    private String email; 
    @Column(columnDefinition = "TEXT")
    private String logo; // Lưu URL ảnh logo hoặc Base64

    private String favicon; // Icon nhỏ trên tab trình duyệt

    @Column(name = "facebook_link")
    private String facebookLink;

    @Column(name = "youtube_link")
    private String youtubeLink;

    private String address; // Địa chỉ văn phòng chính

    private String copyrightText; 

    // --- Cấu hình kỹ thuật ---
    
    @Column(name = "is_maintenance", nullable = false)
    private Boolean isMaintenance = false; // Chế độ bảo trì hệ thống

    @Column(name = "primary_color")
    private String primaryColor; // Mã màu chủ đạo (ví dụ: #0d6efd) giúp đổi màu app từ DB

    @Column(name = "meta_description", length = 500)
    private String metaDescription; // Mô tả cho SEO (Google Search)
}