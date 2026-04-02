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
// import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.config.EmailTemplate;
import com.trithienviet.qlchuoiphongtro.entity.Notification;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.payloads.NotificationDTO;
import com.trithienviet.qlchuoiphongtro.payloads.NotificationLoadDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;
import com.trithienviet.qlchuoiphongtro.repo.NotificationRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.service.EmailService;
import com.trithienviet.qlchuoiphongtro.service.NotificationService;

@Service
public class NotificationServiceImpl implements NotificationService {

    // @Autowired
    // private SimpMessagingTemplate messagingTemplate; // Thư viện bắn tin của Spring

    @Autowired 
    private ModelMapper modelMapper;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private NotificationRepo notificationRepo;

    @Autowired EmailService emailService;
  @Override
    public void sendNotification(Long profileId,Integer branchId, NotificationDTO notificationDTO) {
        Notification notification = modelMapper.map(notificationDTO, Notification.class);
        
        if (profileId != null && profileId != 0) {
            User user = userRepo.findByProfileId(profileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với hồ sơ ID: " + profileId));
            notification.setUser(user);
            notification.setTitle(notificationDTO.getTitle());
            notification.setContent("Xin chào " + user.getProfile().getFullName() +", Chúng tôi xin gưi thông báo là : " +notificationDTO.getContent());
            notification.setType(notification.getType());
            notification.setIsRead(false);
            notification.setCreatedAt(LocalDateTime.now());
            notificationRepo.save(notification);
            
            String template = EmailTemplate.getManualNotification(notificationDTO.getTitle(), notificationDTO.getContent());
            emailService.sendHtmlEmail(user.getProfile().getEmail(), notificationDTO.getTitle(), template);
        }
        if(branchId != 0 && branchId !=null )
        {
            List<User> usersInBranch = userRepo.findAllByBranchId(branchId);
            List<Notification> notifications = usersInBranch.stream().map(user -> {
                Notification notify = modelMapper.map(notificationDTO, Notification.class);
                            notify.setUser(user);
                            notify.setTitle(notificationDTO.getTitle());
                            notify.setTitle("Xin chào " + user.getProfile().getFullName() +", Chung tôi xin gưi thông báo là : " +notificationDTO.getContent());
                            notify.setIsRead(false);
                            notify.setCreatedAt(LocalDateTime.now());
                            return notify;
                    }).collect(Collectors.toList());
            if (notificationDTO.getTitle() == null || notificationDTO.getTitle().isBlank()) {
                throw new RuntimeException("Tiêu đề thông báo không được để trống");
            }
            notificationRepo.saveAll(notifications);
        }
      
    }
    @Override
    public List<NotificationLoadDTO> getNotificationsByUserId(Long userId) {
        // Lấy từ DB, sắp xếp thông báo mới nhất lên đầu
        List<Notification> notifications = notificationRepo.findByUserUserIdOrderByCreatedAtDesc(userId);
        
        // Chuyển danh sách Entity sang DTO bằng ModelMapper
        return notifications.stream()
                .map(noti -> modelMapper.map(noti, NotificationLoadDTO.class))
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
    public PageResponse<NotificationLoadDTO> getAllNoti(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder){
         Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Notification> profilePage = notificationRepo.findAll(pageDetails);

        List<Notification> notifications = profilePage.getContent();
        List<NotificationLoadDTO>  notificationDTOs = notifications.stream()
                .map(p -> modelMapper.map(p, NotificationLoadDTO.class))
                .collect(Collectors.toList());
        
        PageResponse<NotificationLoadDTO> notificationDTO = new PageResponse<>();

        notificationDTO.setContent(notificationDTOs);
        notificationDTO.setPageNumber(profilePage.getNumber());
        notificationDTO.setPageSize(profilePage.getSize());
        notificationDTO.setTotalElements(profilePage.getTotalElements());
        notificationDTO.setTotalPages(profilePage.getTotalPages());
        notificationDTO.setLastPage(profilePage.isLast());

        return notificationDTO;
    }
    @Override
    public void sendSystemNotification(Long profileId, String title, String content, String type) {
        User user = userRepo.findByProfileId(profileId)
                    .orElseThrow(()-> new RuntimeException("Không tìm thấy tài khoản với id "+profileId));
        processAndSend(user.getUserId(), title, content, type);
    }
    // --- HÀM CORE: Xử lý chính ---
    private void processAndSend(Long userId, String title, String content, String type) {
        if (title == null || title.trim().isEmpty()) {
            throw new RuntimeException("Tiêu đề không được để trống!");
        }

        Notification notification = new Notification();
        
        if (userId != 0) {
            User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng ID: " + userId));
            notification.setUser(user);
        } else {
            notification.setUser(null);
        }

        notification.setTitle(title); 
        notification.setContent(content);
        notification.setType(type);
        notification.setIsRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        // 4. Lưu Database
        notificationRepo.save(notification);

    }
}