package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.SchedulerConfigDTO;

import java.util.List;

public interface SchedulerConfigService {

    List<SchedulerConfigDTO> getAll();

    SchedulerConfigDTO update(Long id, SchedulerConfigDTO dto);

    boolean trigger(String codeKey);
}
