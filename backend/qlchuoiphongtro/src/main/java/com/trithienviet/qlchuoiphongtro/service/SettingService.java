package com.trithienviet.qlchuoiphongtro.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.payloads.SettingDTO;
import com.trithienviet.qlchuoiphongtro.payloads.SettingImageDTO;

public interface SettingService {
    SettingDTO updateSetting(SettingDTO settingDTO);
    SettingDTO getSetting();
    SettingImageDTO updateLogo(MultipartFile image) throws IOException;
    SettingImageDTO updateFavicon(MultipartFile image) throws IOException;
    InputStream getImageSystem(String fileName) throws FileNotFoundException;
} 