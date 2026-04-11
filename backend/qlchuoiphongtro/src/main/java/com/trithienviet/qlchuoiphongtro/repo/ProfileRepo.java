package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.trithienviet.qlchuoiphongtro.entity.Profile;

public interface ProfileRepo extends JpaRepository<Profile, Long> {

    // 1. Lấy hồ sơ chưa có tài khoản (Để Admin biết ai cần cấp acc)
    @Query("SELECT p FROM Profile p WHERE p.profileId NOT IN " +
           "(SELECT u.profile.profileId FROM User u WHERE u.profile.profileId IS NOT NULL)")
    List<Profile> findAllByHasNoAccount();

    // 2. Tìm kiếm linh hoạt (Tên, CCCD, SĐT)
    @Query("SELECT p FROM Profile p WHERE " +
           "(:keyword IS NULL OR LOWER(p.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) OR " +
           "(:keyword IS NULL OR p.phone LIKE CONCAT('%', :keyword, '%')) OR " +
           "(:keyword IS NULL OR p.identityNumber LIKE CONCAT('%', :keyword, '%'))")
    Page<Profile> searchAllProfiles(@Param("keyword") String keyword, Pageable pageable);

    @Query("SELECT p FROM Profile p " +
       "JOIN p.user u " +
       "LEFT JOIN p.roomMember rm LEFT JOIN rm.contract c LEFT JOIN c.room r LEFT JOIN r.floor f " +
       "WHERE u.role = com.trithienviet.qlchuoiphongtro.entity.UserRole.TENANT " +
       "AND p.isActive = :status " +
       "AND (:branchId IS NULL OR f.branch.branchId = :branchId) " + // Lọc theo chi nhánh nếu có
       "AND (LOWER(p.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "OR p.phone LIKE CONCAT('%', :keyword, '%') " +
       "OR p.identityNumber LIKE CONCAT('%', :keyword, '%'))")
    Page<Profile> searchTenants(@Param("keyword") String keyword, 
                            @Param("branchId") Integer branchId, 
                            @Param("status") Boolean status,
                            Pageable pageable);

    @EntityGraph(attributePaths = {
        "roomMember.contract.room.floor.branch"
    })
    @Query("SELECT p FROM Profile p JOIN p.user u " + 
           "WHERE p.isActive = :status AND u.role = com.trithienviet.qlchuoiphongtro.entity.UserRole.TENANT")
    Page<Profile> findAllTenants(Pageable pageable,  @Param("status") Boolean status);

    // 5. Lọc Khách thuê theo Chi nhánh cụ thể
    @EntityGraph(attributePaths = {
        "roomMember.contract.room.floor.branch"
    })
    @Query("SELECT p FROM Profile p " +
           "JOIN p.user u " +
           "JOIN p.roomMember rm JOIN rm.contract c JOIN c.room r JOIN r.floor f " +
           "WHERE u.role = com.trithienviet.qlchuoiphongtro.entity.UserRole.TENANT " +
           "AND p.isActive = :status AND f.branch.branchId = :branchId")
    Page<Profile> findTenantsByBranch(  @Param("branchId") Integer branchId,
                                        Pageable pageable,
                                        @Param("status") Boolean status);
           @EntityGraph(attributePaths = {
              "roomMember.contract.room.floor.branch"
              })      
    @Query("SELECT p FROM Profile p JOIN p.user u " + 
           "WHERE p.isActive = :status AND u.role != com.trithienviet.qlchuoiphongtro.entity.UserRole.TENANT")
    Page<Profile> getInternalProfiles(Pageable pageable,  @Param("status") Boolean status);

    @Query("SELECT p FROM Profile p JOIN p.user u " +
       "WHERE u.role != com.trithienviet.qlchuoiphongtro.entity.UserRole.TENANT " +
       "AND p.isActive = :status " +
       "AND (LOWER(p.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
       "OR p.phone LIKE CONCAT('%', :keyword, '%') " +
       "OR p.identityNumber LIKE CONCAT('%', :keyword, '%'))")
       Page<Profile> searchInternalProfiles(@Param("keyword") String keyword, @Param("status") Boolean status, Pageable page);
   @Query("SELECT p FROM Profile p WHERE " +
           "p.phone IS NULL OR p.phone = '' OR " +
           "p.email IS NULL OR p.email = '' OR " +
           "p.identityNumber IS NULL OR p.identityNumber = '' OR " +
           "p.address IS NULL OR p.address = '' OR " +
           "p.idFrontImage IS NULL OR p.idBackImage IS NULL OR " +
           "p.idIssueDate IS NULL OR p.idExpirationDate IS NULL")
    List<Profile> findIncompleteProfiles();
    
    // Nếu bạn muốn đếm số lượng để hiển thị cảnh báo trên Dashboard
    @Query("SELECT COUNT(p) FROM Profile p WHERE p.phone IS NULL OR p.identityNumber IS NULL")
    long countIncompleteProfiles();
}