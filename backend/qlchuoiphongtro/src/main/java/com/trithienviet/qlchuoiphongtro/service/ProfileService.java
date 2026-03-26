package com.trithienviet.qlchuoiphongtro.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;

public interface ProfileService {
     // UserDTO createUserForProfile(Long profileId,String userName,String password);
     ProfileDTO createProfile(ProfileDTO Profile);
     ProfileDTO updateProfile(ProfileDTO profile,Long profileId);
     PageResponse<ProfileDTO> getAllProfiles(Integer pageNumber,Integer pageSize,String sortBy,String sortOrder);
     ProfileDTO getProfileById (Long profileId);
     String deleteProfile(Long profileId);

     ProfileDTO updateIdFrontImage(Long profileId,MultipartFile image) throws IOException;
     ProfileDTO updateIdBackImage(Long profileId,MultipartFile image) throws IOException;
     InputStream getIdentificationImage(String fileName) throws FileNotFoundException ;

}
