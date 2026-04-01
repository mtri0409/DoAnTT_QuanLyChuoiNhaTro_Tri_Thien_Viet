package com.trithienviet.qlchuoiphongtro.service;

import java.util.List;

import com.trithienviet.qlchuoiphongtro.payloads.NotificationDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;

public interface NotificationService {
    void sendNotification(Long userId,NotificationDTO notificationDTO);
    List<NotificationDTO> getNotificationsByUserId(Long userId);
    void markAsRead(Long notiId);
    PageResponse<NotificationDTO> getAllNoti(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);
    void sendSystemNotification(Long userId, String title, String content, String type);
}
