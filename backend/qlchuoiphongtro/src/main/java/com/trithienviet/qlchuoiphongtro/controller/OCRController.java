package com.trithienviet.qlchuoiphongtro.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;

import com.trithienviet.qlchuoiphongtro.service.OCRService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
public class OCRController {

    @Autowired
    private OCRService ocrService;

    @PostMapping(value = "/admin/ocr/water", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadAndScan(@RequestParam("file") MultipartFile file) {
        String resultNumber = ocrService.scanMeterImage(file);

        Map<String, Object> data = Map.of(
            "detectedNumber", resultNumber,
            "status", "success"
        );
        return ResponseEntity.ok(data);
    }
}
