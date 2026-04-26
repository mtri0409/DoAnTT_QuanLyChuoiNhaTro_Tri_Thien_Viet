package com.trithienviet.qlchuoiphongtro.service;

import org.springframework.web.multipart.MultipartFile;

public interface OCRService {
    public String scanMeterImage(MultipartFile file);
}