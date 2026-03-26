package com.trithienviet.qlchuoiphongtro.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.entity.Vehicle;
import com.trithienviet.qlchuoiphongtro.exceptions.APIException;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.repo.VehicleRepo;
import com.trithienviet.qlchuoiphongtro.service.ProfileService;

@Service
public class ProfileServiceImpl implements ProfileService {

    @Autowired
    private ProfileRepo profileRepo;

    @Autowired 
    private UserRepo userRepo;

    @Autowired 
    private VehicleRepo vehicleRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public ProfileDTO createProfile(ProfileDTO profileDTO) {
        // 1. Chuyển từ DTO sang Entity để chuẩn bị lưu
        Profile profile = modelMapper.map(profileDTO, Profile.class);

        // 2. Lưu Entity vào Database thông qua Repository
        Profile savedProfile = profileRepo.save(profile);

        // 3. Chuyển Entity đã lưu ngược lại thành DTO để trả về kết quả
        return modelMapper.map(savedProfile, ProfileDTO.class);
    }
    @Override
    public PageResponse<ProfileDTO> getAllProfiles(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageDetails = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Profile> profilePage = profileRepo.findAll(pageDetails);

        List<Profile> profiles = profilePage.getContent();
        List<ProfileDTO> profileDTOs = profiles.stream()
                .map(p -> modelMapper.map(p, ProfileDTO.class))
                .collect(Collectors.toList());

        PageResponse<ProfileDTO> profileResponse = new PageResponse<>();
        profileResponse.setContent(profileDTOs);
        profileResponse.setPageNumber(profilePage.getNumber());
        profileResponse.setPageSize(profilePage.getSize());
        profileResponse.setTotalElements(profilePage.getTotalElements());
        profileResponse.setTotalPages(profilePage.getTotalPages());
        profileResponse.setLastPage(profilePage.isLast());

        return profileResponse;
    }

    @Override
    public ProfileDTO updateProfile(ProfileDTO profileDTO, Long profileId) {
        // 1. Tìm hồ sơ cũ trong DB, nếu không có văng lỗi ngay (Dùng ResourceNotFoundException nếu Tri đã tạo)
        Profile profileFromDB = profileRepo.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ với ID: " + profileId));
        profileFromDB.setFullName(profileDTO.getFullName());
        profileFromDB.setPhone(profileDTO.getPhone());
        profileFromDB.setAddress(profileDTO.getAddress());
        profileFromDB.setIdentity_number(profileDTO.getIdentityNumber());
        profileFromDB.setIdFrontImage(profileDTO.getIdFrontImageUrl());
        profileFromDB.setIdBackImage(profileDTO.getIdBackImageUrl());
        profileFromDB.setIdExpirationDate(profileDTO.getIdExpirationDate());
        profileFromDB.setIdIssueDate(profileDTO.getIdIssueDate());
        profileFromDB.setIdIssuePlace(profileDTO.getIdIssuePlace());

        Profile updatedProfile = profileRepo.save(profileFromDB);

        return modelMapper.map(updatedProfile, ProfileDTO.class);
    }
    @Override
    public String deleteProfile(Long profileId)
    {
        Profile profile = profileRepo.findById(profileId)
            .orElseThrow(()-> new ResourceNotFoundException("Profile","profileId",profileId));
        
       if (profile.getRoomMember() != null && 
            profile.getRoomMember().getContract() != null) {
            
            String contractStatus = profile.getRoomMember().getContract().getStatus();
            
            // Dùng .equals() và viết hằng số ra trước để tránh NullPointer
            if ("ACTIVE".equals(contractStatus)) {
                throw new APIException("Không thể xóa! Khách thuê đang có hợp đồng còn hiệu lực. " +
                                    "Vui lòng thanh lý hợp đồng trước.");
            }
        }
        
        User user = profile.getUser();
        if (user != null) {
            user.setIsActice(false); 
            userRepo.save(user);
        }

        List<Vehicle> vehicles = profile.getVehicles();

        if(vehicles !=null)
        {
            vehicles.forEach(vehicle-> {
                vehicle.setStatus(false);
            });
            vehicleRepo.saveAll(vehicles);
        }
       
        profile.setIsActive(false);
        profileRepo.save(profile);
        
        return "Change status user" + profileId + "successfuly !"; 
    }

    @Override
    public ProfileDTO getProfileById(Long profileId)
    {
        Optional<Profile> profileOptional = profileRepo.findById(profileId);
        if(profileOptional.isPresent()){
            Profile profile = profileOptional.get();
            return modelMapper.map(profile,ProfileDTO.class);
        }else{
            throw new ResourceNotFoundException("Profile","profileId",profileId);
        }
    }
}