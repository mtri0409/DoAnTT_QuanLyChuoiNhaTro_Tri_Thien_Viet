package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "posts", indexes = {
        @Index(name = "idx_post_author_created", columnList = "author_id, created_at"),
        @Index(name = "idx_post_type_status", columnList = "type, publish_status"),
        @Index(name = "idx_post_category_status", columnList = "category_id, publish_status"),
        @Index(name = "idx_post_slug", columnList = "slug", unique = true)
})
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer postId;

    // ------------------------------------------------------------------ //
    // Nội dung bài đăng //
    // ------------------------------------------------------------------ //

    /**
     * Tiêu đề bài đăng.
     */
    @NotBlank
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    @Column(nullable = false, length = 255)
    private String title;

    /**
     * Slug thân thiện SEO, duy nhất, tự động sinh từ title.
     * Ví dụ: "canh-bao-lua-dao-cho-thue-phong-thang-6-2025"
     */
    @NotBlank
    @Size(max = 300)
    @Column(nullable = false, unique = true, length = 300)
    private String slug;

    /**
     * Mô tả ngắn / tóm tắt (dùng làm excerpt hoặc meta description).
     */
    @Size(max = 500)
    @Column(name = "summary", length = 500)
    private String summary;

    /**
     * Nội dung đầy đủ của bài đăng (HTML hoặc Markdown).
     * Không bắt buộc với bài {@code BANNER} chỉ cần ảnh + tiêu đề.
     */
    @Column(columnDefinition = "TEXT")
    private String content;

    // ------------------------------------------------------------------ //
    // Phân loại & trạng thái //
    // ------------------------------------------------------------------ //

    /**
     * Kiểu bài đăng: ARTICLE (tin tức) hoặc BANNER (banner quảng bá).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private PostType type = PostType.ARTICLE;

    /**
     * Trạng thái xuất bản: DRAFT → PUBLISHED → ARCHIVED.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "publish_status", nullable = false, length = 12)
    @Builder.Default
    private PostPublishStatus publishStatus = PostPublishStatus.DRAFT;

    /**
     * Ghim bài đăng lên đầu danh sách (sticky post).
     */
    @Column(nullable = false)
    @Builder.Default
    private Boolean pinned = false;

    // ------------------------------------------------------------------ //
    // Thời gian //
    // ------------------------------------------------------------------ //

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Thời điểm chính thức xuất bản (có thể đặt lịch trước).
     * Null nếu chưa xuất bản.
     */
    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    // ------------------------------------------------------------------ //
    // Quan hệ //
    // ------------------------------------------------------------------ //

    /**
     * Tác giả bài đăng – phải là User có role ADMIN hoặc STAFF.
     * Xử lý validate role ở Service layer, không ràng buộc ở DB.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private User author;

    /**
     * Danh mục của bài đăng (Xu hướng, Cảnh báo, …).
     * Nullable – bài đăng có thể chưa được phân loại (hiển thị ở "Tất cả").
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = true)
    private PostCategory category;

    /**
     * Danh sách hình ảnh đính kèm.
     * Dùng {@code orphanRemoval = true} để tự xóa ảnh khi bị remove khỏi list.
     */
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PostImage> images = new ArrayList<>();

    // ------------------------------------------------------------------ //
    // JPA lifecycle hooks //
    // ------------------------------------------------------------------ //

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ------------------------------------------------------------------ //
    // Helper methods //
    // ------------------------------------------------------------------ //

    /**
     * Trả về URL ảnh đại diện (primary image) của bài đăng.
     * Trả về {@code null} nếu bài chưa có ảnh nào.
     */
    public String getThumbnailUrl() {
        return images.stream()
                .filter(PostImage::getIsPrimary)
                .map(PostImage::getImageUrl)
                .findFirst()
                .orElse(images.isEmpty() ? null : images.get(0).getImageUrl());
    }

    /**
     * Publish bài đăng: chuyển sang PUBLISHED và ghi nhận thời điểm.
     */
    public void publish() {
        this.publishStatus = PostPublishStatus.PUBLISHED;
        if (this.publishedAt == null) {
            this.publishedAt = LocalDateTime.now();
        }
    }

    /**
     * Lưu trữ bài đăng (đưa về ARCHIVED).
     */
    public void archive() {
        this.publishStatus = PostPublishStatus.ARCHIVED;
    }
}