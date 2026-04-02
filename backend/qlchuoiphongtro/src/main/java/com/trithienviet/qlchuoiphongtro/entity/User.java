package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.ManyToAny;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
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

    private Boolean isActice = true;
    
    @OneToOne 
    @JoinColumn(name="profile_id", nullable = true,unique = true)
    private Profile profile;
    @OneToMany(mappedBy = "user",fetch = FetchType.LAZY)
    private List<Notification> notifications;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable( name="user_branches" ,
                joinColumns = @JoinColumn(name="user_id") ,
                inverseJoinColumns = @JoinColumn(name="branch_id")
                )   
    private List<Branch> branches;
    
    private String resetToken;
    private LocalDateTime resetTokenExpiry;
    
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OtpToken> otpTokens = new ArrayList<>();
}
