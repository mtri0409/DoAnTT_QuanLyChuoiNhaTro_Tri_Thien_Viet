package com.trithienviet.qlchuoiphongtro.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.payloads.LoginCredentials;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.security.JWTUtil;
import com.trithienviet.qlchuoiphongtro.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")

public class AuthController {

    @Autowired
    private JWTUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    UserRepo userRepo;

    @Autowired
    private UserService userService;

    @PostMapping("/auth/login")
    public ResponseEntity<Map<String, Object>> loginHandler(@RequestBody LoginCredentials credentials) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                             credentials.getUserName(),
                            credentials.getPassword()));
        } catch (Exception e) {
            throw new RuntimeException("Xác thực thất bại: " + e.getMessage());
        }

        User user = userRepo.findByUserName(credentials.getUserName())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        if (user.getIsActice() != null && !user.getIsActice()) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!");
        }

        String token = jwtUtil.generateToken(user.getUserName());

        Map<String, Object> data = Map.of(
                "token", token,
                "username", user.getUserName(),
                "role", user.getRole().name()
        );
        return new ResponseEntity<>(data, HttpStatus.OK);
    }

    @PostMapping("/auth/create-account/{profileId}")
    public ResponseEntity<UserDTO> createAccount(
            @PathVariable Long profileId,
            @RequestBody LoginCredentials credentials) {

        UserDTO newUser = userService.createAccountForProfile(
                profileId,
                credentials.getUserName(),
                credentials.getPassword());

        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    @PostMapping("/auth/generare-account/{profileId}")
    public ResponseEntity<UserDTO> generateAccount(@PathVariable Long profileId) {

        UserDTO newUser = userService.generateAccountForFile(
                profileId);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }
}
