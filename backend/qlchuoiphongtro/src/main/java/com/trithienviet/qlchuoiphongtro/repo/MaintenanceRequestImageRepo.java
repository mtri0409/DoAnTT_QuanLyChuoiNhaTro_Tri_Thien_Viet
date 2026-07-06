package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.MaintenanceRequestImage;

@Repository
public interface MaintenanceRequestImageRepo extends JpaRepository<MaintenanceRequestImage, Integer> {

    List<MaintenanceRequestImage> findByMaintenanceRequest_RequestId(Integer requestId);

    long countByMaintenanceRequest_RequestId(Integer requestId);
}