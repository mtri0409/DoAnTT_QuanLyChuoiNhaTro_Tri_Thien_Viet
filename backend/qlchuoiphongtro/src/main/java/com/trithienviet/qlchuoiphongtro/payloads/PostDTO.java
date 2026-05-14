package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDateTime;

import com.trithienviet.qlchuoiphongtro.entity.PostPublishStatus;
import com.trithienviet.qlchuoiphongtro.entity.PostType;

import lombok.*;

/**
 * DTO nhẹ dùng trong danh sách bài đăng (list view).
 * Chỉ chứa thông tin cần thiết để hiển thị card/banner, không kèm content đầy
 * đủ.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDTO {

    private Integer postId;
    private String title;
    private String slug;
    private String summary;

    /** URL ảnh đại diện (thumbnail / banner chính). */
    private String thumbnailUrl;

    private PostType type;
    private PostPublishStatus publishStatus;
    private Boolean pinned;

    private LocalDateTime createdAt;
    private LocalDateTime publishedAt;

    /** Tên tác giả (author.userName). */
    private String authorName;

    /** Danh mục bài đăng. */
    private String categoryName;
    private String categorySlug;
}