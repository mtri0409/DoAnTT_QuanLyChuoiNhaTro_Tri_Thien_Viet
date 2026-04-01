package com.trithienviet.qlchuoiphongtro.payloads;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class NotificationDTO {
    private Long notificationId;
    private Long userName;
    private Integer userId;
    private String title;
    private String content;
    private Boolean isRead;
    private String type;
    private LocalDateTime createdAt;

}
