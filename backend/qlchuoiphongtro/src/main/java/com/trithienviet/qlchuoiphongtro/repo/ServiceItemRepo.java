package com.trithienviet.qlchuoiphongtro.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.ServiceItem;

@Repository
public interface ServiceItemRepo extends JpaRepository<ServiceItem, Integer> {
}