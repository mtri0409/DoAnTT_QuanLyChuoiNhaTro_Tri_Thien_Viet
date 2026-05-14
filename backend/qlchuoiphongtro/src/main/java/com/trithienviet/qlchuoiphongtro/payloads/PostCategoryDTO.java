package com.trithienviet.qlchuoiphongtro.payloads;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostCategoryDTO {

    private Integer categoryId;

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 100, message = "Tên danh mục tối đa 100 ký tự")
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Size(max = 120, message = "Slug tối đa 120 ký tự")
    private String slug;

    @Size(max = 255, message = "Mô tả tối đa 255 ký tự")
    private String description;

    private Integer displayOrder;

    private Boolean active;
}