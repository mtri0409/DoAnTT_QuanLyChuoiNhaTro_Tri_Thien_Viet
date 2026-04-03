package com.trithienviet.qlchuoiphongtro.helper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.trithienviet.qlchuoiphongtro.config.EmailTemplate;
import com.trithienviet.qlchuoiphongtro.config.NotificationConstant;
import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.Invoice;
import com.trithienviet.qlchuoiphongtro.service.EmailService;
import com.trithienviet.qlchuoiphongtro.service.NotificationService;

import jakarta.validation.constraints.Email;

@Component
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
}
