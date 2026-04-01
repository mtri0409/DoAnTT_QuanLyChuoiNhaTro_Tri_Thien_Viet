package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.trithienviet.qlchuoiphongtro.entity.Notification;

public interface NotificationRepo extends JpaRepository<Notification,Long> {

    List<Notification> findByUserUserIdOrderByCreatedAtDesc(Long userId);
} 