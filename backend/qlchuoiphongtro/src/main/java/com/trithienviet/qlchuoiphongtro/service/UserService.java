package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.PasswordResetRequest;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;

public interface UserService {
    UserDTO createAccountForProfile(Long profileId,String username, String password);
    UserDTO generateAccountForFile(Long profileId);

    PageResponse<UserDTO> getAllUsers(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);
    PageResponse<UserDTO> searchUsers(String keyword, Integer pageNumber, Integer pageSize,String sortBy,String sortOrder);
    PageResponse<UserDTO> getAllUsersIsDelete(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);

    UserDTO getUserById(Long id);
    UserDTO getUserByUsername(String username);
    String updateUserRole(Long userId, String role);
    // String changeUserPassword(String username, String oldPassword, String newPassword);
    String resetPassword(Long userId);
    String changeStatus(Long userId);

    String verifyEmailUser(String email,PasswordResetRequest request);
    String verifyOtpByUserId(Long userId, String code);
    String changePassword(Long userId, String oldPassword, String newPassword);
    
}
