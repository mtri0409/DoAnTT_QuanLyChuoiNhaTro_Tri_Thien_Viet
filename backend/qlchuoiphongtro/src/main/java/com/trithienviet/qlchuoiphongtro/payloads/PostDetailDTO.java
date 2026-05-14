package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDateTime;
import java.util.List;

import com.trithienviet.qlchuoiphongtro.entity.PostPublishStatus;
import com.trithienviet.qlchuoiphongtro.entity.PostType;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PostDetailDTO {

    private Integer postId;
    private String title;
    private String slug;
    private String summary;
    private String content;

    private PostType type;
    private PostPublishStatus publishStatus;
    private Boolean pinned;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime publishedAt;

    private Long authorId;
    private String authorName;

    private PostCategoryDTO category;

    private List<PostImageDTO> images;
}