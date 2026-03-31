package com.trithienviet.qlchuoiphongtro.repo;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.User;

@Repository
public interface UserRepo extends JpaRepository<User,Long> {
  
    Optional<User> findByUserName(String user);
    boolean existsByProfile(Profile profile);
    boolean existsByUserName(String userName);

    @Query("SELECT u.profile.email FROM User u WHERE u.profile.id = :profileId")
    Optional<String> findEmailByProfileId(@Param("profileId") Long profileId);
    Optional<User> findByProfileId(Long profileId);
}
