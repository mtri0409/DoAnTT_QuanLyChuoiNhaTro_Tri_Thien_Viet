package com.trithienviet.qlchuoiphongtro.entity;

import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name="users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    @Column(unique = true,nullable = false)
    private String userName;
    private String password;

    @Enumerated(EnumType.STRING) 
    private UserRole role;

    @OneToOne(mappedBy = "user",fetch = FetchType.LAZY)
    private Profile profile;

    @OneToMany(mappedBy = "user",fetch = FetchType.LAZY)
    private List<Notification> notifications;
}
