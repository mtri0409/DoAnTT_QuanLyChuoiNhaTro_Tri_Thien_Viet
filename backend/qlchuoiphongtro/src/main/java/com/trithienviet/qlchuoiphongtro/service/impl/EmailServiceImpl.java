package com.trithienviet.qlchuoiphongtro.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.service.EmailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Async // Chạy ngầm để không bắt User đợi lâu
    public void sendHtmlEmail(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true để gửi định dạng HTML (cho đẹp)
            
            mailSender.send(message);
        } catch (MessagingException e) {
            // Log lỗi nếu gửi mail thất bại
            System.err.println("Lỗi gửi mail: " + e.getMessage());
        }
    }
}