package com.trithienviet.qlchuoiphongtro.helper;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.trithienviet.qlchuoiphongtro.config.EmailTemplate;
import com.trithienviet.qlchuoiphongtro.config.NotificationConstant;
import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.Invoice;
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.RoomMember;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.service.EmailService;
import com.trithienviet.qlchuoiphongtro.service.NotificationService;

import jakarta.validation.constraints.Email;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class NotificationHelper {
    @Autowired
    private EmailService emailService;
    @Autowired
    private NotificationService notificationService;

    public void sendNotificationActiveContract(Contract contract) {
        // 1. Lấy dữ liệu từ object contract
        String email = contract.getRepresentative().getEmail();
        String fullName = contract.getRepresentative().getFullName();
        String roomName = contract.getRoom().getRoomName();
        
        // 2. Build nội dung dùng Constant (Gom logic vào một chỗ)
        String template = EmailTemplate.getContractActivated(
            fullName, roomName, 
            contract.getStartDate().toString(), 
            contract.getEndDate().toString()
        );
        
        String title = NotificationConstant.CONTRACT_ACTIVE_TITLE;
        String content = String.format(
            NotificationConstant.CONTRACT_ACTIVE_CONTENT, 
            fullName, roomName
        );

            emailService.sendHtmlEmail(email, "HỢP ĐỒNG ĐÃ ĐƯỢC KÍCH HOẠT", template);
            notificationService.sendSystemNotification(
            contract.getRepresentative().getProfileId(), 
            title, 
            content, 
            NotificationConstant.TYPE_CONTRACT
        );
    }

    public void sendNotificationExpiredContract(Contract contract) {
    
        String email = contract.getRepresentative().getEmail();
        String fullName = contract.getRepresentative().getFullName();
        String roomName = contract.getRoom().getRoomName();
        
      
        String template = EmailTemplate.getContractExpired(
            fullName, roomName, 
            contract.getEndDate().toString()
        );
        
        String title = NotificationConstant.CONTRACT_ACTIVE_TITLE;
        String content = String.format(
            NotificationConstant.CONTRACT_ACTIVE_CONTENT, 
            fullName, roomName
        );

            emailService.sendHtmlEmail(email, "HỢP ĐỒNG ĐÃ HẾT HẠN", template);
            notificationService.sendSystemNotification(
            contract.getRepresentative().getProfileId(), 
            title, 
            content, 
            NotificationConstant.TYPE_CONTRACT
        );
    }

    public void sendNotificationNewInvoid(Invoice invoice) {
    
        String email = invoice.getContract().getRepresentative().getEmail();
        String fullName = invoice.getContract().getRepresentative().getFullName();
        String roomName = invoice.getContract().getRoom().getRoomName();
        String roomFee = invoice.getRoomPrice().toString();
        String month = invoice.getPeriodMonth().toString();
        String year = invoice.getPeriodYear().toString();
        String amount = invoice.getTotalAmount().toString();
        String serviceTotal = invoice.getRoomServiceAmount().toString();
        // String deadline = invoice.getDueDate().toString();
        String template = EmailTemplate.getNewBill(
            fullName,month,year , amount , roomFee,serviceTotal,"deadline"
        );
        
        String title = NotificationConstant.BILL_NEW_TITLE;
        String content = String.format(
            NotificationConstant.BILL_NEW_CONTENT, 
            month, roomName,amount
        );

            emailService.sendHtmlEmail(email, "HỢP ĐỒNG ĐÃ HẾT HẠN", template);
            notificationService.sendSystemNotification(
            invoice.getContract().getRepresentative().getProfileId(), 
            title, 
            content, 
            NotificationConstant.TYPE_CONTRACT
        );
    }
    public String sendOVerBillToAllMembers(Invoice invoice) {
        Contract contract = invoice.getContract();
        if (contract == null) {
            log.error("Failed to send overdue notifications: Contract not found for Invoice ID {}", invoice.getInvoiceId());
            throw new RuntimeException("Không tìn thấy họp đồng của invoice này");
        }
        String amount = invoice.getTotalAmount().toString();
        List<RoomMember> members = contract.getRoomMembers();

        if (members == null || members.isEmpty()) {
            throw new RuntimeException("Không tìn thấy các thành viên của họp đồng này");
        }
        for (RoomMember member : members) {
            try {
                // Only process members currently staying
                if (Boolean.TRUE.equals(member.getIsStaying())) {
                    Profile profile = member.getProfile();
                  
                    if (profile != null) {
                        String email = profile.getEmail();
                        if(email.isBlank() || email.isEmpty())
                        {
                            continue;
                        }
                        String fullName = profile.getFullName();
                        
                        // 1. Send Email Notification
                        String emailTemplate = EmailTemplate.getOverdueBill(fullName, amount);
                        emailService.sendHtmlEmail(email, "OVERDUE INVOICE NOTICE", emailTemplate);
                        
                        // 2. Send System Notification
                        String title = NotificationConstant.BILL_REMIND_CONTENT;
                        String content = String.format(NotificationConstant.BILL_REMIND_CONTENT, amount);

                        notificationService.sendSystemNotification(
                            profile.getProfileId(), // Changed from representative to current member's profileId
                            title, 
                            content, 
                            NotificationConstant.TYPE_OVER_BILL
                        );

                    
                    } else {
                        log.warn("Skipping member ID {}: Profile is null", member.getMemberId());
                    }
                }
            } catch (Exception e) {
                // Catch exception inside the loop so one failure doesn't stop the whole process
                log.error("Error occurred while sending overdue notification to Member ID {}: {}", 
                        member.getMemberId(), e.getMessage());
                throw new RuntimeException("Error while sending overdue notify to member " + member.getMemberId() +" : " +e.getMessage());
            }
        }
        return "Đã gửi xong hóa đơn quá hạn thanh toán";
    }

    public void sendIncompleteProfileReminders (Profile profile)
    {
        String email = profile.getEmail();
        String fullName = profile.getFullName();
        String deadline = LocalDate.now().plusDays(10).toString();
        String template = EmailTemplate.getRequestUpdateIdentity(fullName, deadline);
        if(email !=null )
        {
            emailService.sendHtmlEmail(email, "Thông báo cập nhập thông tin", template);
            String title = NotificationConstant.PROFILE_INCOMPLETE_TITLE;
            String content = String.format(NotificationConstant.PROFILE_INCOMPLETE_CONTENT,fullName,deadline);
            notificationService.sendSystemNotification(profile.getProfileId(), title, content, NotificationConstant.TYPE_PROFILE_UPDATE);
        }else{
            return;
        }
    }
}
