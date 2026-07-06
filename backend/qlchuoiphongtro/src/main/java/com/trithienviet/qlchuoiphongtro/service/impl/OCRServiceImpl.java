package com.trithienviet.qlchuoiphongtro.service.impl;

import com.trithienviet.qlchuoiphongtro.service.OCRService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
@Slf4j // Sử dụng log thay vì System.out hoặc printStackTrace
public class OCRServiceImpl implements OCRService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${app.ai-ocr-url:http://localhost:8000/api}")
    private String pythonOcrUrl;

  @Override
    public String scanMeterImage(MultipartFile file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            // Thêm tham số debug=true vào URL để Python trả về chi tiết các box tìm được
            String urlWithDebug = pythonOcrUrl + "/detect" + "?type=water_meter";
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // Gọi API
            ResponseEntity<Map> response = restTemplate.postForEntity(urlWithDebug, requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> responseBody = response.getBody();
                
                // Log toàn bộ JSON để kiểm tra trên Console của Spring Boot
                System.out.println("JSON từ Python: " + responseBody);

                if ("success".equals(responseBody.get("status"))) {
                    // LẤY ĐÚNG KEY "result" NHƯ TRONG PYTHON TRẢ VỀ
                    Object resultObj = responseBody.get("result");
                    return (resultObj != null) ? resultObj.toString() : "00000";
                }
            }
        } catch (Exception e) {
            System.err.println("Lỗi kết nối OCR: " + e.getMessage());
            return "ERROR_CONN";
        }
        return "00000";
    }
}