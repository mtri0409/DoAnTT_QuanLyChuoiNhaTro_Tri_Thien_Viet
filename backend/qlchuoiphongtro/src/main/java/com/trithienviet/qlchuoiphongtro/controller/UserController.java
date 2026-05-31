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
import com.trithienviet.qlchuoiphongtro.payloads.PasswordUpdateDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UpdateRoleDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ApiResponse;
import com.trithienviet.qlchuoiphongtro.service.UserService;

import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
public class UserController {
    @Autowired
    private UserService userService;

    @GetMapping("/admin/users")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getAllProfiles( 
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_USERS_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<UserDTO> profileResponse = userService.getAllUsers(
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "profileId":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(ApiResponse.success(profileResponse), HttpStatus.OK);     
    }

    @GetMapping("/admin/users/search")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> searchUsers( 
        @RequestParam String keyword,
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_USERS_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<UserDTO> profileResponse = userService.searchUsers(keyword,
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "profileId":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(ApiResponse.success(profileResponse), HttpStatus.OK);     
    }
    
    @GetMapping("/admin/users/history")
    public ResponseEntity<ApiResponse<PageResponse<UserDTO>>> getAllUsersIsDelete( 
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_USERS_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<UserDTO> profileResponse = userService.getAllUsersIsDelete(
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "profileId":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(ApiResponse.success(profileResponse), HttpStatus.OK);     
    }

    @GetMapping("/public/users/{userId}")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable Long userId) {
        
        UserDTO userDTO = userService.getUserById(userId);
        return new ResponseEntity<>(ApiResponse.success(userDTO),HttpStatus.OK);
    }

    @GetMapping("/public/users/username/{username}") 
    public ResponseEntity<ApiResponse<UserDTO>> getUserUserName(@PathVariable String username) {
        
        UserDTO userDTO = userService.getUserByUsername(username);
        return new ResponseEntity<>(ApiResponse.success(userDTO),HttpStatus.OK);
    }
    
    @PatchMapping("/admin/users/{userId}/role")
    public ResponseEntity<ApiResponse<String>> updateUserRole(
            @PathVariable Long userId, 
            @RequestBody UpdateRoleDTO role) {

        if (role == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BAD_REQUEST", "Lỗi: Dữ liệu 'ROLE' không được để trống!", 400));
        }

        try {
            String message = userService.updateUserRole(userId, role.getRole()); 
            return ResponseEntity.ok(ApiResponse.success(message));
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_ROLE", "Lỗi: Role không hợp lệ. Chỉ chấp nhận: ADMIN, STAFF, TENANT", 400));
        }
    }

    @PostMapping("/public/users/{userId}/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @PathVariable Long userId, 
            @RequestBody PasswordUpdateDTO request) { // Dùng DTO đã tạo
        
        // Truyền dữ liệu từ DTO vào Service
        userService.changePassword(userId, request.getOldPassword(), request.getNewPassword());
        
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công!"));
    }

    @PatchMapping("/admin/user/{userId}/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@PathVariable Long userId){
        String message = userService.resetPassword(userId);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @PatchMapping("/admin/user/{userId}/changeStatus")
    public ResponseEntity<ApiResponse<String>> changeStatus(@PathVariable Long userId){
        String message = userService.changeStatus(userId);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
    
}
