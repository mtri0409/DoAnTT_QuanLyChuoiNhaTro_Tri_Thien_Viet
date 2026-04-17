package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDateTime;
import com.trithienviet.qlchuoiphongtro.entity.PostStatus;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoommatePostDTO {

    private Integer postId;
    private Long authorId;
    private String authorName;
    private String authorPhone;
    private String roomName;
    private String branchName;
    private String branchAddress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime expiresAt;

    private Long roomId;
    private String description;
    private PostStatus status;
}