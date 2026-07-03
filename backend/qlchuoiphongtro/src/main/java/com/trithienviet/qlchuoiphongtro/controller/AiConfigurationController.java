package com.trithienviet.qlchuoiphongtro.controller;

import com.trithienviet.qlchuoiphongtro.payloads.AiConfigurationDTO;
import com.trithienviet.qlchuoiphongtro.service.AiConfigurationService;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/ai-config")
@Tag(name = "AI Configuration", description = "API quản lý cấu hình AI")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AiConfigurationController {
    private final AiConfigurationService aiConfigurationService;

    /**
     * Lấy cấu hình AI duy nhất
     */
    @GetMapping
    public ResponseEntity<AiConfigurationDTO> getAiConfig() {
        return aiConfigurationService.getAiConfig()
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Cập nhật cấu hình AI
     */
    @PutMapping
    public ResponseEntity<AiConfigurationDTO> updateAiConfig(@RequestBody AiConfigurationDTO dto) {
        return ResponseEntity.ok(aiConfigurationService.updateAiConfig(dto));
    }
}