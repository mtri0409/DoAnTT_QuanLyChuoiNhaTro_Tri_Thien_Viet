package com.trithienviet.qlchuoiphongtro.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.trithienviet.qlchuoiphongtro.entity.ServiceItem;

public interface ServiceRepo extends JpaRepository<ServiceItem, Integer> {

}