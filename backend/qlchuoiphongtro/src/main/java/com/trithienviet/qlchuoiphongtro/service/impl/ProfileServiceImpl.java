package com.trithienviet.qlchuoiphongtro.service.impl;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Pageable;

import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.entity.Vehicle;
import com.trithienviet.qlchuoiphongtro.exceptions.APIException;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDetailDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileImageDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileRequestDTO;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.repo.VehicleRepo;
import com.trithienviet.qlchuoiphongtro.service.FileService;
import com.trithienviet.qlchuoiphongtro.service.ProfileService;

import jakarta.transaction.Transactional;

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

    @Autowired
    private FileService fileService;

    @Value("${path.images.identification}")
    private String path;
    @Override
    public ProfileRequestDTO createProfile(ProfileRequestDTO profileDTO) {
        Profile profile = modelMapper.map(profileDTO, Profile.class);
        Profile savedProfile = profileRepo.save(profile);

        return modelMapper.map(savedProfile, ProfileRequestDTO.class);
    }
    

    @Override
    public ProfileRequestDTO updateProfile(ProfileRequestDTO profileDTO, Long profileId) {

        Profile profileFromDB = profileRepo.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy hồ sơ với ID: " + profileId));
        profileFromDB.setFullName(profileDTO.getFullName());
        profileFromDB.setPhone(profileDTO.getPhone());
        profileFromDB.setEmail(profileDTO.getEmail());
        profileFromDB.setAddress(profileDTO.getAddress());
        profileFromDB.setIdentityNumber(profileDTO.getIdentityNumber());
        profileFromDB.setIdExpirationDate(profileDTO.getIdExpirationDate());
        profileFromDB.setIdIssueDate(profileDTO.getIdIssueDate());
        profileFromDB.setIdIssuePlace(profileDTO.getIdIssuePlace());

        Profile updatedProfile = profileRepo.save(profileFromDB);

        return modelMapper.map(updatedProfile, ProfileRequestDTO.class);
    }

    @Transactional
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
        
        return "Xóa thành công " + profileId + "!"; 
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
    public PageResponse<ProfileDTO> searchProfiles(String keyword, Integer pageNumber, Integer pageSize,String sortBy,String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize,sortByAndOrder);

        Page<Profile> profilePage = profileRepo.searchProfiles(keyword, pageable);

        List<ProfileDTO> profileDTOs = profilePage.stream()
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
    public ProfileDetailDTO getProfileById(Long profileId) {
        Profile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "profileId", profileId));

        ProfileDetailDTO profileDTO = modelMapper.map(profile, ProfileDetailDTO.class);

        if (profile.getRoomMember() != null && profile.getRoomMember().getContract() != null) {
            Contract contract = profile.getRoomMember().getContract();
            
            profileDTO.setActiveContractId(contract.getContractId());
            profileDTO.setContractEndDate(contract.getEndDate());
            
            if (contract.getRoom() != null) {
                profileDTO.setRoomName(contract.getRoom().getRoomName());
            }
        }

        return profileDTO;
    }

    @Override
    public ProfileImageDTO updateIdFrontImage(Long profileId,MultipartFile image) throws IOException{
        Profile profileFromDB = profileRepo.findById(profileId).orElseThrow(()-> 
            new ResourceNotFoundException("Profile","profileId",profileId));
        if(profileFromDB == null){
            throw new APIException("Không tìm thấy thông tin người dùng " +profileId);
        }
        String fileName = fileService.uploadImage(path,image);
        profileFromDB.setIdFrontImage(fileName);
        Profile updateIdFrontImage = profileRepo.save(profileFromDB);
        
        return modelMapper.map(updateIdFrontImage, ProfileImageDTO.class);
    }

    @Override
    public ProfileImageDTO updateIdBackImage(Long profileId,MultipartFile image) throws IOException{
        Profile profileFromDB = profileRepo.findById(profileId).orElseThrow(()-> 
            new ResourceNotFoundException("Profile","profileId",profileId));
        if(profileFromDB == null){
            throw new APIException("Không tìm thấy thông tin người dùng " +profileId);
        }
        String fileName = fileService.uploadImage(path,image);
        profileFromDB.setIdBackImage(fileName);
        Profile updateIdFrontImage = profileRepo.save(profileFromDB);
        
        return modelMapper.map(updateIdFrontImage, ProfileImageDTO.class);
    }

    @Override
    public InputStream getIdentificationImage(String fileName) throws FileNotFoundException {
        return fileService.getResource(path, fileName);
    }

    @Override
    public List<ProfileDTO> getProfilesWithoutAccount() {
        List<Profile> profiles = profileRepo.findAllProfilesWithoutAccount();
        // Chuyển đổi sang DTO và return
        return profiles.stream()
                .map(p -> modelMapper.map(p, ProfileDTO.class))
                .collect(Collectors.toList());
    }
}