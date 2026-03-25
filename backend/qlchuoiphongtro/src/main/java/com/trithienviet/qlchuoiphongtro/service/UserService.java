package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;

public interface UserService {
    UserDTO registerUser(UserDTO userDTO);

    PageResponse<UserDTO> getAllUsers(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);
    UserDTO getUserById(Long userId);
    UserDTO updateUser(Long userId,UserDTO userDTO);
    String deleteUser(Long userId);
}
