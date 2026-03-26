package com.trithienviet.qlchuoiphongtro.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trithienviet.qlchuoiphongtro.entity.Profile;

public interface ProfileRepo extends JpaRepository<Profile,Long> {
    
}
