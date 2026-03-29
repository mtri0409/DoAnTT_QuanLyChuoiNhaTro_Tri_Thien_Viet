package com.trithienviet.qlchuoiphongtro.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.entity.UserRole;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UpdateRoleDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.service.UserService;
import com.trithienviet.qlchuoiphongtro.utils.PasswordGenerator;

import org.springframework.data.domain.Pageable; 

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;


import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

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

        if (userRepo.existsByProfile(profile)) {
        throw new RuntimeException("Profile này đã được liên kết với một tài khoản khác!");
        }
    
        if (userRepo.existsByUserName(userName)) {
            throw new RuntimeException("Tên đăng nhập đã tồn tại!");
        }
        // 2. Tạo User Entity
        User newUser = new User();
        newUser.setUserName(userName);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole(UserRole.TENANT); 
        newUser.setProfile(profile);

        User savedUser = userRepo.save(newUser);

        return modelMapper.map(savedUser, UserDTO.class); 
    }

    @Transactional
    @Override
    public UserDTO generateAccountForFile(Long profileId) {
        // 1. Tìm Profile
        Profile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Not found profile with id : " + profileId));

        if (userRepo.existsByProfile(profile)) {
            throw new RuntimeException("Profile này đã được liên kết với một tài khoản khác!");
        }        
        User newUser = new User();
        newUser.setUserName(profile.getPhone());
        newUser.setPassword(passwordEncoder.encode(profile.getPhone()));
        newUser.setRole(UserRole.TENANT); 
        newUser.setProfile(profile);

        User savedUser = userRepo.save(newUser);

        return modelMapper.map(savedUser, UserDTO.class); 
    }

    public PageResponse<UserDTO> getAllUsers(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder){

         Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<User> userpage = userRepo.findAll(pageDetails);

        List<User> profiles = userpage.getContent();
        List<UserDTO> profileDTOs = profiles.stream()
                .map(p -> modelMapper.map(p, UserDTO.class))
                .collect(Collectors.toList());

        PageResponse<UserDTO> userResponse = new PageResponse<>();
        userResponse.setContent(profileDTOs);
        userResponse.setPageNumber(userpage.getNumber());
        userResponse.setPageSize(userpage.getSize());
        userResponse.setTotalElements(userpage.getTotalElements());
        userResponse.setTotalPages(userpage.getTotalPages());
        userResponse.setLastPage(userpage.isLast());

        return userResponse;
    }

    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + userId));
        
        return modelMapper.map(user, UserDTO.class);
    }

    @Transactional
    @Override
    public String updateUserRole(Long userId, UpdateRoleDTO roleDTO) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        try {
            // Chuyển từ String sang Enum, dùng valueOf để khớp với định nghĩa Enum
            // UserRole role = UserRole.valueOf(roleDTO.getUserRole().toUpperCase());
            user.setRole(roleDTO.getUserRole());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new RuntimeException("Role không hợp lệ! Vui lòng nhập: ADMIN, TENANT..." + roleDTO.getUserRole());
        }

        userRepo.save(user);
        return "Thay đổi quyền thành công cho user: " + user.getUserName();
    }
    @Transactional
    @Override
    public String changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        // 1. Kiểm tra mật khẩu cũ có đúng không
        // passwordEncoder.matches(mật_khẩu_thô, mật_khẩu_đã_mã_hóa_trong_db)
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không chính xác!");
        }

        // 2. Kiểm tra mật khẩu mới không được trùng mật khẩu cũ (tùy chọn)
        if (oldPassword.equals(newPassword)) {
            throw new RuntimeException("Mật khẩu mới phải khác mật khẩu cũ!");
        }

        // 3. Mã hóa và lưu mật khẩu mới
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepo.save(user);
        return "Đổi mật khẩu thành công !";
    }
    @Override
    @Transactional
    public String resetPassword(Long userId){
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        String rawPassword = PasswordGenerator.generateRandomPassword(10);
        user.setPassword((passwordEncoder.encode(rawPassword)));
        userRepo.save(user);
        return "Đã reset mật khẩu thành công";
    }

    @Override
    @Transactional 
    public String changeStatus(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        user.setIsActice(!user.getIsActice());
        userRepo.save(user);
        
        return user.getIsActice() ? "Đã kích hoạt" : "Đã khóa";
    }
}
    

