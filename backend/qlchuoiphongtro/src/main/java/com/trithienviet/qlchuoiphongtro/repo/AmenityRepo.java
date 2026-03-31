package com.trithienviet.qlchuoiphongtro.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.trithienviet.qlchuoiphongtro.entity.Amenity;

public interface AmenityRepo extends JpaRepository<Amenity, Integer> {
}