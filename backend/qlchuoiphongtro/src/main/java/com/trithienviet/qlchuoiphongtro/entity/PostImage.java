package com.trithienviet.qlchuoiphongtro.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "post_images", indexes = {
        @Index(name = "idx_postimg_post", columnList = "post_id")
})
public class PostImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer imageId;

    /**
     * URL / đường dẫn lưu trữ của ảnh (cloud storage hoặc local).
     */
    @NotBlank
    @Column(name = "image_url", nullable = false, columnDefinition = "TEXT")
    private String imageUrl;

    /**
     * Alt text cho ảnh (SEO + accessibility).
     */
    @Column(name = "alt_text", length = 255)
    private String altText;

    /**
     * Thứ tự hiển thị trong gallery của bài đăng.
     * Giá trị nhỏ hơn → hiển thị trước.
     */
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Đánh dấu đây là ảnh đại diện (thumbnail / banner chính) của bài đăng.
     */
    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;
}