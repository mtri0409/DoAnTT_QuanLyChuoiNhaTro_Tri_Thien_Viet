package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.UpdateRoleDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;
import com.trithienviet.qlchuoiphongtro.service.UserService;

import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Manager Room Application")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/admin/users")
    public ResponseEntity<PageResponse<UserDTO>> getAllProfiles( 
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_USERS_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<UserDTO> profileResponse = userService.getAllUsers(
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "profileId":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(profileResponse, HttpStatus.CREATED);     
    }
    
    @GetMapping("/public/users/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long userId) {
        
        UserDTO userDTO = userService.getUserById(userId);
        return new ResponseEntity<>(userDTO,HttpStatus.OK);
    }

    @GetMapping("/public/users/username/{username}") 

 
    public ResponseEntity<UserDTO> getUserUserName(@PathVariable String username) {
        
        UserDTO userDTO = userService.getUserByUsername(username);
        return new ResponseEntity<>(userDTO,HttpStatus.OK);
    }
    
    @PatchMapping("/admin/users/{userId}/role")
    public ResponseEntity<String> updateUserRole(
            @PathVariable Long userId, 
            @RequestBody UpdateRoleDTO role) {

        if (role == null) {
            return ResponseEntity.badRequest().body("Lỗi: Dữ liệu 'ROLE' không được để trống!");
        }

        try {
            String message = userService.updateUserRole(userId, role.getRole()); 
            return ResponseEntity.ok(message);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Lỗi: Role không hợp lệ. Chỉ chấp nhận: ADMIN, STAFF, TENANT");
        }
    }

    @PostMapping("/public/users/{userId}/change-password")
    public ResponseEntity<String> changePassword(
            @PathVariable Long userId, 
            @RequestParam String oldPassword, 
            @RequestParam String newPassword) {
        userService.changePassword(userId, oldPassword, newPassword);
        return ResponseEntity.ok("Đổi mật khẩu thành công!");
    }

    @PatchMapping("/admin/user/{userId}/reset-password")
    public ResponseEntity<String> resetPassword(@PathVariable Long userId){
        String message = userService.resetPassword(userId);
        return ResponseEntity.ok(message);
    }

    @PatchMapping("/admin/user/{userId}/changeStatus")
    public ResponseEntity<String> changeStatus(@PathVariable Long userId){
        String message = userService.changeStatus(userId);
        return ResponseEntity.ok(message);
    }
    
}
