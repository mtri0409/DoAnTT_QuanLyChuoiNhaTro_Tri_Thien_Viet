package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.config.EmailTemplate;
import com.trithienviet.qlchuoiphongtro.service.EmailService;
import com.trithienviet.qlchuoiphongtro.service.impl.EmailServiceImpl;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private EmailService emailService;

    @GetMapping("/mail")
    public String testMail() {
        String html = EmailTemplate.getContractExpiring("Phạm Đình Minh Trí", "20-10-2025");
        emailService.sendHtmlEmail("tnt80582@gmail.com", "THÔNG BÁO GIA HẠN HỌP ĐỒNG", html);
        return "Gửi thành công!";
    }
}
