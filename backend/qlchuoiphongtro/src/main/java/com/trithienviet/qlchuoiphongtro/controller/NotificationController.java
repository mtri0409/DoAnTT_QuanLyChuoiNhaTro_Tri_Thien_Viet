package com.trithienviet.qlchuoiphongtro.controller;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.NotificationDTO;
import com.trithienviet.qlchuoiphongtro.payloads.NotificationLoadDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleLoadDTO;
import com.trithienviet.qlchuoiphongtro.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/admin/notification")
    public ResponseEntity<PageResponse<NotificationLoadDTO>> getAll( 
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_NOTIFICATION_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<NotificationLoadDTO> notificationResponse = notificationService.getAllNoti(
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "notifi":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(notificationResponse, HttpStatus.OK);     
    }
    // 1. API dành cho Admin gửi thông báo thủ công
    @PostMapping("/admin/notification/send-manual")
    public ResponseEntity<String> sendManualNotification(
            @RequestParam(name = "profileId", defaultValue = "0") Long profileId,
            @RequestParam(name = "branchId", defaultValue = "0") Integer branchId,
            @RequestBody NotificationDTO notificationDTO) {
        
        notificationService.sendNotification(profileId, branchId, notificationDTO);
        
        return new ResponseEntity<>("Gửi thông báo thành công!", HttpStatus.OK);
    }

    // 2. API lấy danh sách thông báo cho User (để hiện ở cái chuông)
    @GetMapping("public/notification/user/{userId}")
    public ResponseEntity<List<NotificationLoadDTO>> getNotificationsByUser(@PathVariable Long userId) {
        // Tri cần viết thêm hàm này trong Service để lấy từ Repository nhé
        List<NotificationLoadDTO> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("public/notification/unread-count/{userId}")
    public ResponseEntity<Long> getUnreadCount(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.countUnread(userId));
    }
    // 3. API đánh dấu đã đọc
    @PutMapping("/public/notification/{notiId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long notiId) {
        notificationService.markAsRead(notiId);
        return ResponseEntity.ok().build();
    }
}