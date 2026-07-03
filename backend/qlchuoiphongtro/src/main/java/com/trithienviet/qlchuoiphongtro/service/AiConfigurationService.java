package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.AiConfigurationDTO;
import java.util.Optional;

public interface AiConfigurationService {
    /**
     * Lấy cấu hình AI duy nhất (chỉ có 1 record trong DB)
     */
    Optional<AiConfigurationDTO> getAiConfig();

    /**
     * Cập nhật cấu hình AI
     */
    AiConfigurationDTO updateAiConfig(AiConfigurationDTO dto);
}