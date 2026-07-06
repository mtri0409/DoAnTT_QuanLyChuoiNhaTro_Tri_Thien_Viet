package com.trithienviet.qlchuoiphongtro.service.impl;

import com.trithienviet.qlchuoiphongtro.entity.AiConfiguration;
import com.trithienviet.qlchuoiphongtro.payloads.AiConfigurationDTO;
import com.trithienviet.qlchuoiphongtro.repo.AiConfigurationRepo;
import com.trithienviet.qlchuoiphongtro.service.AiConfigurationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiConfigurationServiceImpl implements AiConfigurationService {
    private final AiConfigurationRepo aiConfigurationRepo;
    private final ModelMapper modelMapper;

    @Override
    public Optional<AiConfigurationDTO> getAiConfig() {
        return aiConfigurationRepo.findTopByOrderByConfigIdAsc()
                .map(config -> modelMapper.map(config, AiConfigurationDTO.class));
    }

    @Override
    @Transactional
    public AiConfigurationDTO updateAiConfig(AiConfigurationDTO dto) {
        AiConfiguration config = aiConfigurationRepo.findTopByOrderByConfigIdAsc()
                .orElseGet(AiConfiguration::new); // Tạo mới nếu không tồn tại

        // Cập nhật các trường
        config.setApiKey(dto.getApiKey());
        config.setBaseUrl(dto.getBaseUrl());
        config.setModel(dto.getModel());
        config.setDescription(dto.getDescription());

        // Lưu vào DB
        AiConfiguration savedConfig = aiConfigurationRepo.save(config);
        return modelMapper.map(savedConfig, AiConfigurationDTO.class);
    }
}