package com.trithienviet.qlchuoiphongtro.service;

public interface EmailService {
    void sendHtmlEmail(String to, String subject, String content);
}
