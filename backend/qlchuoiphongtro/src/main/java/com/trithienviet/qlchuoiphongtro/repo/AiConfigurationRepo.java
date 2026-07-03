package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.AiConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiConfigurationRepo extends JpaRepository<AiConfiguration, Long> {
    // Lấy config duy nhất (giả sử chỉ có 1 record trong DB)
    Optional<AiConfiguration> findTopByOrderByConfigIdAsc();
}