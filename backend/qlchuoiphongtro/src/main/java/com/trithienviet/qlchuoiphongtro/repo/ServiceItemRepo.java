package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.ServiceItem;

@Repository
public interface ServiceItemRepo extends JpaRepository<ServiceItem, Integer> {
    List<ServiceItem> findByServiceType(String serviceType);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM ServiceItem s WHERE s.is_active = true")
    List<ServiceItem> findActiveServices();
}