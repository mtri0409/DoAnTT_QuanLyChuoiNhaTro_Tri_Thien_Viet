package com.trithienviet.qlchuoiphongtro.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import com.trithienviet.qlchuoiphongtro.service.OCRService;

@RestController
@RequestMapping("/api/")
// @CrossOrigin(origins = "*")
public class OCRController {

    @Autowired
    private OCRService ocrService;

    @PostMapping(value = "admin/ocr/water", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
   public ResponseEntity<?> uploadAndScan(@RequestParam("file") MultipartFile file) {
        // Bước A: (Bạn có thể thêm code lưu file vào database/thư mục ở đây)
        
        // Bước B: Quét lấy số
        String resultNumber = ocrService.scanMeterImage(file);

        return ResponseEntity.ok(Map.of(
            "detectedNumber", resultNumber,
            "status", "success"
        ));
    }
}