package com.trithienviet.qlchuoiphongtro.controller;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.NotificationDTO;
import com.trithienviet.qlchuoiphongtro.payloads.NotificationLoadDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ApiResponse;
import com.trithienviet.qlchuoiphongtro.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/admin/notification")
    public ResponseEntity<ApiResponse<PageResponse<NotificationLoadDTO>>> getAll( 
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_NOTIFICATION_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<NotificationLoadDTO> notificationResponse = notificationService.getAllNoti(
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "notifi":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(ApiResponse.success(notificationResponse), HttpStatus.OK);     
    }
    // 1. API dành cho Admin gửi thông báo thủ công
    @PostMapping("/notification/send-manual")
    public ResponseEntity<ApiResponse<String>> sendManualNotification(
            @RequestParam(name = "profileId", defaultValue = "0") Long profileId,
            @RequestParam(name = "branchId", defaultValue = "0") Integer branchId,
            @RequestBody NotificationDTO notificationDTO) {
        
        notificationService.sendNotification(profileId, branchId, notificationDTO);
        
        return new ResponseEntity<>(ApiResponse.success("Gửi thông báo thành công!"), HttpStatus.OK);
    }

    // 2. API lấy danh sách thông báo cho User (để hiện ở cái chuông)
    @GetMapping("/public/notification/user/{userId}")
    public ResponseEntity<ApiResponse<List<NotificationLoadDTO>>> getNotificationsByUser(@PathVariable Long userId) {
        List<NotificationLoadDTO> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/public/notification/unread-count/{userId}")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.countUnread(userId)));
    }
    // 3. API đánh dấu đã đọc
    @PutMapping("/public/notification/{notiId}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long notiId) {
        notificationService.markAsRead(notiId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}