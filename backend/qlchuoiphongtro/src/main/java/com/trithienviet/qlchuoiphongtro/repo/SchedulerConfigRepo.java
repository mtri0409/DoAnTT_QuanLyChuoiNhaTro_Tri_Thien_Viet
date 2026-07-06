package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.SchedulerConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchedulerConfigRepo extends JpaRepository<SchedulerConfig, Long> {

    Optional<SchedulerConfig> findByCodeKey(String codeKey);

    List<SchedulerConfig> findByIsActiveTrue();
}
