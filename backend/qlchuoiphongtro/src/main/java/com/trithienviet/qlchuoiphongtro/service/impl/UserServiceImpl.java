package com.trithienviet.qlchuoiphongtro.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.config.EmailTemplate;
import com.trithienviet.qlchuoiphongtro.entity.OtpToken;
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.entity.UserRole;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.PasswordResetRequest;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UpdateRoleDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;
import com.trithienviet.qlchuoiphongtro.repo.OtpTokenRepo;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.service.EmailService;
import com.trithienviet.qlchuoiphongtro.service.UserService;
import com.trithienviet.qlchuoiphongtro.utils.OtpUtils;
import com.trithienviet.qlchuoiphongtro.utils.PasswordGenerator;

import org.springframework.data.domain.Pageable; 

import jakarta.transaction.Transactional;
import jakarta.validation.constraints.Email;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
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
    private OtpTokenRepo otpTokenRepo;
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private EmailService emailService;

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
        String template = EmailTemplate.getNewAccountCreated(profile.getFullName(), userName, password);
        emailService.sendHtmlEmail(profile.getEmail(), "TÀI KHOẢN QUẢN LÝ", template);
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
        newUser.setUserName(profile.getEmail());
        newUser.setPassword(passwordEncoder.encode(profile.getPhone()));
        newUser.setRole(UserRole.TENANT); 
        newUser.setProfile(profile);

        User savedUser = userRepo.save(newUser);
        String template = EmailTemplate.getNewAccountCreated(profile.getFullName(), profile.getEmail(), profile.getPhone());
        emailService.sendHtmlEmail(profile.getEmail(), "TÀI KHOẢN QUẢN LÝ", template);
        return modelMapper.map(savedUser, UserDTO.class); 
    }

    public PageResponse<UserDTO> getAllUsers(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder){

         Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<User> userpage = userRepo.findByIsActiceTrue(pageDetails);

        List<User> users = userpage.getContent();
        List<UserDTO> userDTOs = users.stream()
                .map(p -> modelMapper.map(p, UserDTO.class))
                .collect(Collectors.toList());

        PageResponse<UserDTO> userResponse = new PageResponse<>();
        userResponse.setContent(userDTOs);
        userResponse.setPageNumber(userpage.getNumber());
        userResponse.setPageSize(userpage.getSize());
        userResponse.setTotalElements(userpage.getTotalElements());
        userResponse.setTotalPages(userpage.getTotalPages());
        userResponse.setLastPage(userpage.isLast());

        return userResponse;
    }

      public PageResponse<UserDTO> getAllUsersIsDelete(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder){

         Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<User> userpage = userRepo.findByIsActiceFalse(pageDetails);

        List<User> users = userpage.getContent();
        List<UserDTO> userDTOs = users.stream()
                .map(p -> modelMapper.map(p, UserDTO.class))
                .collect(Collectors.toList());

        PageResponse<UserDTO> userResponse = new PageResponse<>();
        userResponse.setContent(userDTOs);
        userResponse.setPageNumber(userpage.getNumber());
        userResponse.setPageSize(userpage.getSize());
        userResponse.setTotalElements(userpage.getTotalElements());
        userResponse.setTotalPages(userpage.getTotalPages());
        userResponse.setLastPage(userpage.isLast());

        return userResponse;
    }

    @Override
    public PageResponse<UserDTO> searchUsers(String keyword, Integer pageNumber, Integer pageSize,String sortBy,String sortOrder)
    {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize,sortByAndOrder);
        Page<User> userPages = userRepo.searchUsers(keyword,pageable);
        List<User> users = userPages.getContent();
        List<UserDTO> profileDTOs = users.stream()
                .map(p -> modelMapper.map(p, UserDTO.class))
                .collect(Collectors.toList());
        PageResponse<UserDTO> useResponse = new PageResponse<>();
        useResponse.setContent(profileDTOs);
        useResponse.setPageNumber(userPages.getNumber());
        useResponse.setPageSize(userPages.getSize());
        useResponse.setTotalElements(userPages.getTotalElements());
        useResponse.setLastPage(useResponse.isLastPage());
        return useResponse;
    }


    @Override
    public UserDTO getUserById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản với ID: " + userId));
        
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

            if (user.getProfile() != null) {
                userDTO.setFullName(user.getProfile().getFullName());
            }

            return userDTO;
    }
  @Override
    public UserDTO getUserByUsername(String username) {
        User user = userRepo.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản: " + username));

        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        if (user.getProfile() != null) {
            userDTO.setFullName(user.getProfile().getFullName());
        }

        return userDTO;
    }

    @Transactional
    @Override
    public String updateUserRole(Long userId, String roleName) { 
        // 1. Tìm User
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        try {
            // 2. Chuyển String nhận từ Controller sang Enum UserRole
            // Dùng toUpperCase() và trim() để tránh lỗi thừa dấu cách hoặc viết thường
            UserRole enumRole = UserRole.valueOf(roleName.toUpperCase().trim());
            
            // 3. Set vào entity
            user.setRole(enumRole);
            
            // Vì có @Transactional nên không nhất thiết phải gọi userRepo.save(user)
            // Nhưng viết vào cũng không sao để tường minh
            userRepo.save(user);
            
        } catch (IllegalArgumentException e) {
            // Lỗi này xảy ra khi roleName không khớp với bất kỳ giá trị nào trong Enum
            throw new RuntimeException("Role '" + roleName + "' không tồn tại trong hệ thống!");
        }

        return "Thay đổi quyền thành công cho user: " + user.getUserName();
    }


    @Override
    @Transactional
    public String resetPassword(Long userId){
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        String rawPassword = PasswordGenerator.generateRandomPassword(10);
        // Profile profile = profileRepo.findById(user.getProfile().getProfileId()).orElseThrow(()-> new RuntimeException("Không tìm thấy profile với id"+user.getProfile().getId));
        user.setPassword((passwordEncoder.encode(rawPassword)));
        userRepo.save(user);
        String temple = EmailTemplate.getNewAccountCreated(user.getProfile().getFullName(), user.getProfile().getFullName(), rawPassword);
        emailService.sendHtmlEmail(user.getProfile().getEmail(), "Đặt lại mật khẩu", temple);
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
    
   @Override
    public String verifyEmailUser(String email, PasswordResetRequest request) {
        // 1. Lấy email từ DB để so khớp
        String emailFromDB = userRepo.findEmailByProfileId(request.getProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("Email", "profileId", request.getProfileId()));

        if (!emailFromDB.equals(email)) {
            throw new RuntimeException("Email không trùng khớp với email đã đăng ký!");
        }

        // 2. Lấy đối tượng User để liên kết với OtpToken
        User user = userRepo.findByProfileProfileId(request.getProfileId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "profileId", request.getProfileId()));

        // 3. Tạo mới OtpToken (Đây là bước nhóm đang thiếu)
        OtpToken otpToken = new OtpToken();
        otpToken.setOtpCode("123456"); 
        otpToken.setUser(user); // Gán user vào để biết OTP này của ai
        otpToken.setExpiryDate(LocalDateTime.now().plusMinutes(10)); 
        otpToken.setUsed(false);

        // 4. Lưu vào Database
        otpTokenRepo.save(otpToken);

        return "Đã gửi OTP đến email: " + email + " (Mã test: 123456, ID: " + otpToken.getId() + ")";
    }
    public String verifyOtpByUserId(Long userId, String code) {
        // Tìm cái mới nhất của ông này
        OtpToken token = otpTokenRepo.findLatestTokenByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("OTP", "userId", userId));

        if (!token.getOtpCode().equals(code)) return "Mã OTP không đúng !";
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) return "Mã OTP đã hết hạn !";
        
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "profileId", userId));

        String tokenRest = OtpUtils.generateRandomToken(10);
        user.setResetToken(tokenRest);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10));
        return "Xác thực thành công";
    }

        @Transactional
    @Override
    public String changePassword(Long userId, String oldPassword, String newPassword) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        // if(user.getResetToken())
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
    
}
    

