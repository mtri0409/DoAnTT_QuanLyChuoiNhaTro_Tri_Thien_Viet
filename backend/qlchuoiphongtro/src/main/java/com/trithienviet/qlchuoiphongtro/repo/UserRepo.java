package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.entity.Vehicle;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {

    Optional<User> findByUserName(String user);

    boolean existsByProfile(Profile profile);

    boolean existsByUserName(String userName);

    @Query("SELECT u.profile.email FROM User u WHERE u.profile.id = :profileId")
    Optional<String> findEmailByProfileId(@Param("profileId") Long profileId);

    @Query("SELECT u.profile.profileId FROM User u WHERE u.userName = :username")
    Optional<Long> findProfileIdByUsername(@Param("username") String username);

    Optional<User> findByProfileProfileId(Long profileId);

    @Query("SELECT u from User u WHERE u.profile.id = :profileId")
    Optional<User> findByProfileId(@Param("profileId") Long profileId);

    Optional<String> findByResetToken(String resetToken);

    @Query("SELECT u FROM User u WHERE " +
            "(:keyword IS NULL OR LOWER(u.userName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<User> searchUsers(@Param("keyword") String keyword, Pageable pageable);

    Page<User> findByIsActiceTrue(Pageable pageable);

    Page<User> findByIsActiceFalse(Pageable pageable);

    @Query("SELECT u FROM User u " +
            "JOIN u.profile p " +
            "JOIN p.roomMember rm " +
            "JOIN rm.contract c " +
            "JOIN c.room r " +
            "JOIN r.floor f " +
            "WHERE f.branch.branchId = :branchId " +
            "AND u.isActice = true ") // Chỉ lấy những user đang hoạt động
    List<User> findAllByBranchId(@Param("branchId") Integer BranchId);
}
