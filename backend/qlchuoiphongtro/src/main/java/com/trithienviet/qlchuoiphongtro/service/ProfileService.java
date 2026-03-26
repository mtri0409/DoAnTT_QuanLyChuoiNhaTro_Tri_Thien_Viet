package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;

public interface ProfileService {
     UserDTO createUserForProfile(Long profileId,String userName,String password);
}
