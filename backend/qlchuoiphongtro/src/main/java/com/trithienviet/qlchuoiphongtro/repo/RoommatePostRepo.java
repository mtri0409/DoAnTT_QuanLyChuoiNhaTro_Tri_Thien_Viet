package com.trithienviet.qlchuoiphongtro.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.trithienviet.qlchuoiphongtro.entity.PostStatus;
import com.trithienviet.qlchuoiphongtro.entity.RoommatePost;

@Repository
public interface RoommatePostRepo extends JpaRepository<RoommatePost, Integer> {

  // FIX #1: Đổi authorId từ Integer → Long để khớp với Profile.profileId
  @Query("""
      SELECT COUNT(p) FROM RoommatePost p
      WHERE p.profile.profileId = :authorId
        AND p.createdAt >= :startOfDay
        AND p.createdAt <= :endOfDay
      """)
  long countPostsByAuthorAndDate(
      @Param("authorId") Long authorId,
      @Param("startOfDay") LocalDateTime startOfDay,
      @Param("endOfDay") LocalDateTime endOfDay);

  // FIX #2: Tách countQuery riêng để tránh lỗi JOIN FETCH trong count query tự
  // sinh.
  // Bỏ ORDER BY trong JPQL, để Pageable xử lý sorting.
  @Query(value = """
      SELECT p FROM RoommatePost p
      JOIN FETCH p.profile pr
      JOIN FETCH p.room r
      JOIN FETCH r.floor f
      JOIN FETCH f.branch b
      WHERE p.status = com.trithienviet.qlchuoiphongtro.entity.PostStatus.ACTIVE
        AND (:roomId IS NULL OR r.roomId = :roomId)
        AND (:branchId IS NULL OR b.branchId = :branchId)
      """, countQuery = """
      SELECT COUNT(p) FROM RoommatePost p
      JOIN p.room r
      JOIN r.floor f
      JOIN f.branch b
      WHERE p.status = com.trithienviet.qlchuoiphongtro.entity.PostStatus.ACTIVE
        AND (:roomId IS NULL OR r.roomId = :roomId)
        AND (:branchId IS NULL OR b.branchId = :branchId)
      """)
  Page<RoommatePost> findActivePostsFiltered(
      @Param("roomId") Long roomId,
      @Param("branchId") Long branchId,
      Pageable pageable);

  // FIX #3: Thêm JOIN FETCH branch để tránh LazyInitializationException khi map
  // branchName
  @Query(value = """
      SELECT p FROM RoommatePost p
      JOIN FETCH p.room r
      JOIN FETCH r.floor f
      JOIN FETCH f.branch b
      WHERE p.profile.profileId = :authorId
      """, countQuery = """
      SELECT COUNT(p) FROM RoommatePost p
      WHERE p.profile.profileId = :authorId
      """)
  Page<RoommatePost> findByAuthor(
      @Param("authorId") Long authorId,
      Pageable pageable);

  @Modifying
  @Transactional
  @Query("""
      UPDATE RoommatePost p
      SET p.status = com.trithienviet.qlchuoiphongtro.entity.PostStatus.EXPIRED,
          p.updatedAt = :now
      WHERE p.status = com.trithienviet.qlchuoiphongtro.entity.PostStatus.ACTIVE
        AND p.expiresAt < :now
      """)
  int expireOldPosts(@Param("now") LocalDateTime now);

  @Query("""
      SELECT COUNT(p) FROM RoommatePost p
      WHERE p.room.roomId = :roomId
        AND p.status = com.trithienviet.qlchuoiphongtro.entity.PostStatus.ACTIVE
      """)
  long countActivePostsByRoom(@Param("roomId") Long roomId);

  @Query("""
      SELECT COUNT(m) FROM RoomMember m
      WHERE m.profile.profileId = :profileId
        AND m.contract.room.roomId = :roomId
        AND m.isStaying = true
      """)
  long countActiveRoomMember(
      @Param("profileId") Long profileId,
      @Param("roomId") Long roomId);

  List<RoommatePost> findByStatusAndExpiresAtBefore(PostStatus status, LocalDateTime dateTime);

  @Query("SELECT u.profile.profileId FROM User u WHERE u.userName = :username")
  Optional<Long> findProfileIdByUsername(@Param("username") String username);
}