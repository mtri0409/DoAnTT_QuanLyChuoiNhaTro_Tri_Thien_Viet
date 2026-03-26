package com.trithienviet.qlchuoiphongtro.service;

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
}
