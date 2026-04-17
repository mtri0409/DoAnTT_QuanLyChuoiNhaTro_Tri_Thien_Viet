package com.trithienviet.qlchuoiphongtro.service;

import java.util.List;

import com.trithienviet.qlchuoiphongtro.payloads.NotificationDTO;
import com.trithienviet.qlchuoiphongtro.payloads.NotificationLoadDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;

public interface NotificationService {
    void sendNotification(Long profileId,Integer branchId,NotificationDTO notificationDTO);
    List<NotificationLoadDTO> getNotificationsByUserId(Long userId);
    void markAsRead(Long notiId);
    PageResponse<NotificationLoadDTO> getAllNoti(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);
    void sendSystemNotification(Long profileId, String title, String content, String type);
    long countUnread(Long userId);
}
