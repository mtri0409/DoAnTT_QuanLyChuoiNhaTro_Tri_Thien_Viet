package com.trithienviet.qlchuoiphongtro.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.entity.UserRole;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.service.UserService;

import jakarta.transaction.Transactional;

import org.modelmapper.ModelMapper;

@Service
public class UserServiceImpl implements UserService{

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ProfileRepo profileRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    @Override
    public UserDTO createAccountForProfile(Long profileId, String userName, String password) {
        // 1. Tìm Profile
        Profile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Not found profile with id : " + profileId));

        // 2. Tạo User Entity
        User newUser = new User();
        newUser.setUserName(userName);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole(UserRole.TENANT); 
        newUser.setProfile(profile);

        User savedUser = userRepo.save(newUser);

        return modelMapper.map(savedUser, UserDTO.class); 
    }
}
    

