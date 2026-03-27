package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.entity.UserRole;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.UpdateRoleDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;

public interface UserService {
    UserDTO createAccountForProfile(Long profileId,String username, String password);
    UserDTO generateAccountForFile(Long profileId);

    PageResponse<UserDTO> getAllUsers(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);
    UserDTO getUserById(Long userId);
    String updateUserRole(Long userId, UpdateRoleDTO roleDTO);
    String changePassword(Long userId, String oldPassword, String newPassword);
    // String deleteUser(Long userId);
}
