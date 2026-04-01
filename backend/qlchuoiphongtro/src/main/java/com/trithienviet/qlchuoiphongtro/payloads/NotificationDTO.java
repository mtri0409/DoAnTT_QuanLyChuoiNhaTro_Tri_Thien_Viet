package com.trithienviet.qlchuoiphongtro.payloads;

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
    private Long userId;
    private String title;
    
    private String content;
    private Boolean isRead;
    private String type;
}
