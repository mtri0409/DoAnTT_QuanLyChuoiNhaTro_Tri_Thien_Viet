package com.trithienviet.qlchuoiphongtro.controller;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.payloads.ProfileImageDTO;
import com.trithienviet.qlchuoiphongtro.payloads.SettingDTO;
import com.trithienviet.qlchuoiphongtro.payloads.SettingImageDTO;
import com.trithienviet.qlchuoiphongtro.service.SettingService;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
public class SettingController {

    @Autowired
    private SettingService settingService;

    @GetMapping("/public/settings")
    public ResponseEntity<SettingDTO> getSystemSettings() {
        return ResponseEntity.ok(this.settingService.getSetting());
    }

    @PutMapping("/admin/settings")
    public ResponseEntity<SettingDTO> updateSystemSettings(@Valid @RequestBody SettingDTO settingDTO) {
        SettingDTO updatedSetting = this.settingService.updateSetting(settingDTO);
        return ResponseEntity.ok(updatedSetting);
    }

    @PutMapping("/admin/system/logo")
    public ResponseEntity<SettingImageDTO> updateLogo(
            @RequestParam("image") MultipartFile image) throws IOException {

        SettingImageDTO updateLogo = settingService.updateLogo(image);
        return ResponseEntity.ok(updateLogo);
    }

    @PutMapping("/admin/system/favicon")
    public ResponseEntity<SettingImageDTO> updateFavicon(
            @RequestParam("image") MultipartFile image) throws IOException {

        SettingImageDTO updateFavicon = settingService.updateFavicon(image);
        return ResponseEntity.ok(updateFavicon);
    }

    @GetMapping("/public/system/image/{fileName}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String fileName) throws IOException {
        InputStream imageStream = settingService.getImageSystem(fileName);

        MediaType mediaType = MediaType.IMAGE_JPEG;
        if (fileName.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDisposition(ContentDisposition.inline().filename(fileName).build());
        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(imageStream));
    }
}
