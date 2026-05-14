package com.trithienviet.qlchuoiphongtro.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Danh mục (menu) dùng để phân loại và lọc tin tức.
 * <p>
 * Ví dụ hiển thị trên UI:
 * {@code Tất cả | Xu hướng | Cảnh báo | Khuyến mãi | ...}
 * </p>
 *
 * <p>
 * Mỗi {@link Post} thuộc về một {@code PostCategory}.
 * </p>
 *
 * <p>
 * Trường {@code displayOrder} dùng để sắp xếp thứ tự hiển thị trên thanh lọc,
 * giá trị nhỏ hơn hiển thị trước.
 * </p>
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "post_categories", indexes = {
        @Index(name = "idx_postcat_slug", columnList = "slug", unique = true)
})
public class PostCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer categoryId;

    /**
     * Tên hiển thị trên UI, ví dụ: "Xu hướng", "Cảnh báo".
     */
    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String name;

    /**
     * Slug dùng cho URL / filter param, ví dụ: "xu-huong", "canh-bao".
     * Phải là duy nhất và không dấu.
     */
    @NotBlank
    @Size(max = 120)
    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    /**
     * Mô tả ngắn về danh mục (tuỳ chọn).
     */
    @Column(length = 255)
    private String description;

    /**
     * Thứ tự hiển thị trên thanh menu lọc.
     * Giá trị nhỏ hơn → hiển thị trước (bên trái).
     */
    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    /**
     * Cho phép ẩn/hiện danh mục mà không cần xoá.
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    /**
     * Các bài đăng thuộc danh mục này.
     * Quan hệ ngược từ {@link Post}.
     */
    @OneToMany(mappedBy = "category", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Post> posts = new ArrayList<>();
}