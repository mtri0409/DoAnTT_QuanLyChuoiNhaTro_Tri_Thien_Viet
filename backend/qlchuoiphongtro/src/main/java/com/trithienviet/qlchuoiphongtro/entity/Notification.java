package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.annotations.ManyToAny;
import org.hibernate.engine.profile.Fetch;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Getter
@Setter
@Table(name="notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @Column(nullable = false)
    private String tilte;
    
    @Column(columnDefinition = "TEXT")
    private String content;

    private String type;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch= FetchType.LAZY)
    @JoinColumn(name="user_id",nullable = false)
    private User user;
}
