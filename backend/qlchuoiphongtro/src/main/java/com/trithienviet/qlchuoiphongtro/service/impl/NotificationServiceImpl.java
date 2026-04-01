package com.trithienviet.qlchuoiphongtro.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Notification;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.payloads.NotificationDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;
import com.trithienviet.qlchuoiphongtro.repo.NotificationRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.service.NotificationService;

@Service
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private SimpMessagingTemplate messagingTemplate; // Thư viện bắn tin của Spring

    @Autowired 
    private ModelMapper modelMapper;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private NotificationRepo notificationRepo;

    @Override
    public void sendNotification(Long userId, NotificationDTO notificationDTO) {
        Notification notification = modelMapper.map(notificationDTO, Notification.class);
        if(userId == 0) {
            notification.setUser(null);
        }else{
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + userId));
             notification.setUser(user != null ? user : null);
        }   
        
        notification.setContent(notificationDTO.getContent());
        if(notification.getTitle()==null){
             throw new RuntimeException("tilte không được null");
        }
        notification.setTitle(notificationDTO.getTitle());
       
        notification.setIsRead(false);
        notification.setType(notification.getType());
        notification.setCreatedAt(LocalDateTime.now());
        
        // 1. Nếu gửi cho cá nhân
        if (userId != 0) {
            messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/notifications", 
                notificationDTO
            );
        }

        // 2. Nếu là thông báo bảo trì hoặc gửi cho TẤT CẢ (userId = 0)
        if (userId == 0 || "MAINTENANCE".equals(notificationDTO.getType())) {
            messagingTemplate.convertAndSend("/topic/public", notificationDTO);
        }
        notificationRepo.save(notification);
    }
    @Override
    public List<NotificationDTO> getNotificationsByUserId(Long userId) {
        // Lấy từ DB, sắp xếp thông báo mới nhất lên đầu
        List<Notification> notifications = notificationRepo.findByUserUserIdOrderByCreatedAtDesc(userId);
        
        // Chuyển danh sách Entity sang DTO bằng ModelMapper
        return notifications.stream()
                .map(noti -> modelMapper.map(noti, NotificationDTO.class))
                .collect(Collectors.toList());
    }
    @Override
    public void markAsRead(Long notiId) {
        Notification notification = notificationRepo.findById(notiId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));
        
        notification.setIsRead(true);
        notificationRepo.save(notification);
    }

    @Override
    public PageResponse<NotificationDTO> getAllNoti(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder){
         Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Notification> profilePage = notificationRepo.findAll(pageDetails);

        List<Notification> notifications = profilePage.getContent();
        List<NotificationDTO>  notificationDTOs = notifications.stream()
                .map(p -> modelMapper.map(p, NotificationDTO.class))
                .collect(Collectors.toList());
        
        PageResponse<NotificationDTO> notificationDTO = new PageResponse<>();

        notificationDTO.setContent(notificationDTOs);
        notificationDTO.setPageNumber(profilePage.getNumber());
        notificationDTO.setPageSize(profilePage.getSize());
        notificationDTO.setTotalElements(profilePage.getTotalElements());
        notificationDTO.setTotalPages(profilePage.getTotalPages());
        notificationDTO.setLastPage(profilePage.isLast());

        return notificationDTO;
    }
    @Override
    public void sendSystemNotification(Long userId, String title, String content, String type) {
        processAndSend(userId, title, content, type);
    }
    // --- HÀM CORE: Xử lý chính ---
    private void processAndSend(Long userId, String title, String content, String type) {
        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Tiêu đề không được để trống!");
        }

        Notification notification = new Notification();
        
        // 2. Xử lý User (Chung hay riêng)
        if (userId != 0) {
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng ID: " + userId));
            notification.setUser(user);
        } else {
            notification.setUser(null);
        }

        // 3. Set thông tin Entity
        notification.setTitle(title); // Hãy chắc chắn trong Entity đã sửa thành title (không phải tilte)
        notification.setContent(content);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        // 4. Lưu Database
        notificationRepo.save(notification);

        // 5. Bắn WebSocket Real-time
        NotificationDTO payload = modelMapper.map(notification, NotificationDTO.class);
        
        // Gửi cá nhân
        if (userId != 0) {
            messagingTemplate.convertAndSendToUser(
                userId.toString(), 
                "/queue/notifications", 
                payload
            );
        }

        // Gửi chung (nếu là bảo trì hoặc userId = 0)
        if (userId == 0 || "MAINTENANCE".equals(type) || "SYSTEM".equals(type)) {
            messagingTemplate.convertAndSend("/topic/public", payload);
        }
    }
}