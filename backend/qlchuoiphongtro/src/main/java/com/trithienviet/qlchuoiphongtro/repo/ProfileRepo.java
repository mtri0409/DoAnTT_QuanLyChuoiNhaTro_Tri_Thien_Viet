package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.trithienviet.qlchuoiphongtro.entity.Profile;

public interface ProfileRepo extends JpaRepository<Profile,Long> {
    // Lấy các profile chưa được gán cho bất kỳ user nào
    @Query("SELECT p FROM Profile p WHERE p.profileId NOT IN " +
           "(SELECT u.profile.profileId FROM User u WHERE u.profile.profileId IS NOT NULL)")
    List<Profile> findAllProfilesWithoutAccount();
}
