package com.trithienviet.qlchuoiphongtro.payloads;

import com.trithienviet.qlchuoiphongtro.entity.PostType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO nhận dữ liệu từ client khi tạo mới hoặc cập nhật bài đăng.
 * Upload ảnh được xử lý riêng qua endpoint /images.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostRequestDTO {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề tối đa 255 ký tự")
    private String title;

    /**
     * Slug có thể để trống — Service sẽ tự sinh từ title nếu không truyền.
     */
    @Size(max = 300, message = "Slug tối đa 300 ký tự")
    private String slug;

    @Size(max = 500, message = "Tóm tắt tối đa 500 ký tự")
    private String summary;

    private String content;

    @NotNull(message = "Loại bài đăng không được để trống")
    private PostType type;

    /** ID danh mục. Null = bài đăng chưa phân loại. */
    private Integer categoryId;

    private Boolean pinned = false;
}