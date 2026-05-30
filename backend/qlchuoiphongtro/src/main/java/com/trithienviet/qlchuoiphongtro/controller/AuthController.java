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
@RequestMapping("/api")
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

    @PostMapping("auth/login")
    public Map<String, Object> loginHandler(@RequestBody LoginCredentials credentials) {
        try {
            // Authenticate
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            credentials.getUserName(),
                            credentials.getPassword()));
        } catch (Exception e) {
            // Nếu bị IllegalAccessException hoặc BadCredentialsException sẽ rơi vào đây
            throw new RuntimeException("Xác thực thất bại: " + e.getMessage());
        }

        // Lấy User để trả về data
        User user = userRepo.findByUserName(credentials.getUserName())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));

        if (user.getActive() != null && !user.getActive()) {
            throw new RuntimeException("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên!");
        }
        // Generate JWT
        String token = jwtUtil.generateToken(user.getUserName());

        // Trả data cho Frontend (React)
        return Map.of(
                "token", token,
                "username", user.getUserName(),
                "role", user.getRole().name() // Nên trả thêm Role để React phân quyền UI
        );
    }

    // @PreAuthorize("hasRole('ADMIN')")
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
