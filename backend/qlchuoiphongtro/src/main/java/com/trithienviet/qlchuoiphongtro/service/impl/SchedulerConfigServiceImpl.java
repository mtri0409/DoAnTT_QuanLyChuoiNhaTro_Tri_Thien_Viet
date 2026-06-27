package com.trithienviet.qlchuoiphongtro.service.impl;

import com.trithienviet.qlchuoiphongtro.entity.SchedulerConfig;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.SchedulerConfigDTO;
import com.trithienviet.qlchuoiphongtro.repo.SchedulerConfigRepo;
import com.trithienviet.qlchuoiphongtro.scheduler.DynamicSchedulerService;
import com.trithienviet.qlchuoiphongtro.service.SchedulerConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SchedulerConfigServiceImpl implements SchedulerConfigService {

    private final SchedulerConfigRepo configRepo;
    private final DynamicSchedulerService dynamicSchedulerService;

    @Override
    public List<SchedulerConfigDTO> getAll() {
        return configRepo.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SchedulerConfigDTO update(Long id, SchedulerConfigDTO dto) {
        SchedulerConfig config = configRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SchedulerConfig", "id", id));

        if (dto.getCronExpression() != null) {
            config.setCronExpression(dto.getCronExpression());
        }
        if (dto.getIsActive() != null) {
            config.setIsActive(dto.getIsActive());
        }
        if (dto.getName() != null) {
            config.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            config.setDescription(dto.getDescription());
        }

        SchedulerConfig saved = configRepo.save(config);

        dynamicSchedulerService.rescheduleJob(saved.getCodeKey());

        return toDTO(saved);
    }

    @Override
    public boolean trigger(String codeKey) {
        return dynamicSchedulerService.triggerNow(codeKey);
    }

    private SchedulerConfigDTO toDTO(SchedulerConfig entity) {
        return SchedulerConfigDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .codeKey(entity.getCodeKey())
                .cronExpression(entity.getCronExpression())
                .isActive(entity.getIsActive())
                .description(entity.getDescription())
                .build();
    }
}
