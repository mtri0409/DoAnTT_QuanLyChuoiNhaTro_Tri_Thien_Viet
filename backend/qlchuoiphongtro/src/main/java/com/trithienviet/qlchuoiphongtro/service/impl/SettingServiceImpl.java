package com.trithienviet.qlchuoiphongtro.service.impl;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.entity.Setting;
import com.trithienviet.qlchuoiphongtro.exceptions.APIException;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileImageDTO;
import com.trithienviet.qlchuoiphongtro.payloads.SettingDTO;
import com.trithienviet.qlchuoiphongtro.payloads.SettingImageDTO;
import com.trithienviet.qlchuoiphongtro.repo.SettingRepo;
import com.trithienviet.qlchuoiphongtro.service.FileService;
import com.trithienviet.qlchuoiphongtro.service.SettingService;

@Service // Đừng quên annotation này để Spring quản lý
public class SettingServiceImpl implements SettingService {

    @Autowired
    private SettingRepo settingRepo;

    @Autowired
    private ModelMapper modelMapper;
    @Value("${path.upload.system}")
    private String path;

    @Autowired 
    private FileService fileService;
    @Override
    public SettingDTO getSetting() {
        // Lấy record đầu tiên (id = 1). 
        // Nếu database trống, bạn có thể tạo mới một object mặc định hoặc ném lỗi.
        Setting setting = settingRepo.findById(1)
                .orElseThrow(() -> new RuntimeException("Cấu hình hệ thống chưa được thiết lập!"));

        // Chuyển đổi từ Entity sang DTO
        return this.modelMapper.map(setting, SettingDTO.class);
    }

    @Override
    public SettingDTO updateSetting(SettingDTO settingDTO) {
        // Tìm setting hiện tại
        Setting setting = settingRepo.findById(1)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình để cập nhật!"));

        // Cập nhật các trường từ DTO vào Entity
        setting.setName(settingDTO.getName());
        setting.setHotline(settingDTO.getHotline());
        setting.setLogo(settingDTO.getLogo());
        setting.setEmail(settingDTO.getEmail());
        setting.setFacebookLink(settingDTO.getFacebookLink());
        setting.setYoutubeLink(settingDTO.getYoutubeLink());
        setting.setAddress(settingDTO.getAddress());
        setting.setCopyrightText(settingDTO.getCopyrightText());
        setting.setIsMaintenance(settingDTO.getIsMaintenance());
        setting.setPrimaryColor(settingDTO.getPrimaryColor());

        // Lưu lại
        Setting updatedSetting = settingRepo.save(setting);
        
        return this.modelMapper.map(updatedSetting, SettingDTO.class);
    }

    public SettingImageDTO updateLogo(MultipartFile image) throws IOException{
        Setting setting = settingRepo.findById(1)
                .orElseThrow(() -> new ResourceNotFoundException("Hệ thống", "", ""));
        if (setting == null) {
            throw new APIException("Không tìm thấy ");

        }
        String fileName = fileService.uploadImage(path, image);
        setting.setLogo(fileName);
        Setting updateLogo = settingRepo.save(setting);

        return modelMapper.map(updateLogo, SettingImageDTO.class);
    }
    public SettingImageDTO updateFavicon(MultipartFile image) throws IOException{
        Setting setting = settingRepo.findById(1)
                .orElseThrow(() -> new ResourceNotFoundException("Hệ thống", "", ""));
        if (setting == null) {
            throw new APIException("Không tìm thấy ");

        }
        String fileName = fileService.uploadImage(path, image);
        setting.setFavicon(fileName);
        Setting updateLogo = settingRepo.save(setting);

        return modelMapper.map(updateLogo, SettingImageDTO.class);
    }

    @Override
    public InputStream getImageSystem(String fileName) throws FileNotFoundException {
        return fileService.getResource(path, fileName);
    }

}