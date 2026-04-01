package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.trithienviet.qlchuoiphongtro.entity.Profile;

public interface ProfileRepo extends JpaRepository<Profile,Long> {
    // Lấy các profile chưa được gán cho bất kỳ user nào
    @Query("SELECT p FROM Profile p WHERE p.profileId NOT IN " +
           "(SELECT u.profile.profileId FROM User u WHERE u.profile.profileId IS NOT NULL)")
    List<Profile> findAllProfilesWithoutAccount();
    @Query("SELECT p FROM Profile p WHERE " +
        "(:keyword IS NULL OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
        "(:keyword IS NULL OR p.phone LIKE CONCAT('%', :keyword, '%')) OR " +
        "(:keyword IS NULL OR p.identityNumber LIKE CONCAT('%', :keyword, '%'))")
    Page<Profile> searchProfiles(@Param("keyword") String keyword, Pageable pageable);

    @EntityGraph(attributePaths = {
        "roomMember", 
        "roomMember.contract", 
        "roomMember.contract.room", 
        "roomMember.contract.room.floor", 
        "roomMember.contract.room.floor.branch"
    })
    @Query("SELECT p FROM Profile p " +
           "JOIN p.user u " + 
           "WHERE p.isActive = true " +
           "AND u.role = com.trithienviet.qlchuoiphongtro.entity.UserRole.TENANT")
    Page<Profile> findByIsActiveTrue(Pageable pageable);

   @EntityGraph(attributePaths = {
        "roomMember", 
        "roomMember.contract", 
        "roomMember.contract.room", 
        "roomMember.contract.room.floor", 
        "roomMember.contract.room.floor.branch"
    })
    @Query("SELECT p FROM Profile p " +
        "JOIN p.user u " + 
        "WHERE p.isActive = true " +
        "AND u.role = com.trithienviet.qlchuoiphongtro.entity.UserRole.TENANT")
    Page<Profile> findByIsActiveFalse(Pageable pageable);
    
    
}
