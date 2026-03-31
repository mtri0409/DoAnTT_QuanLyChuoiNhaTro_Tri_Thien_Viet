package com.trithienviet.qlchuoiphongtro.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDetailDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileImageDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileRequestDTO;

public interface ProfileService {
     // UserDTO createUserForProfile(Long profileId,String userName,String password);
     ProfileRequestDTO createProfile(ProfileRequestDTO Profile);
     ProfileRequestDTO updateProfile(ProfileRequestDTO profile,Long profileId);

     PageResponse<ProfileDTO> getAllProfiles(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);
     PageResponse<ProfileDTO> searchProfiles(String keyword, Integer pageNumber, Integer pageSize,String sortBy,String sortOrder);
     ProfileDetailDTO getProfileById (Long profileId);
     String deleteProfile(Long profileId);

     ProfileImageDTO updateIdFrontImage(Long profileId,MultipartFile image) throws IOException;
     ProfileImageDTO updateIdBackImage(Long profileId,MultipartFile image) throws IOException;
     
     InputStream getIdentificationImage(String fileName) throws FileNotFoundException ;

     List<ProfileDTO> getProfilesWithoutAccount();
}
