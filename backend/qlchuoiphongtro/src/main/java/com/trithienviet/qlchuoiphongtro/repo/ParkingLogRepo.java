package com.trithienviet.qlchuoiphongtro.repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.ParkingLog;

@Repository
public interface ParkingLogRepo extends JpaRepository<ParkingLog, Long> {
    
    // ===== BASIC QUERIES =====
    Page<ParkingLog> findByLicensePlate(String licensePlate, Pageable pageable);
    Page<ParkingLog> findByVehicle_VehicleId(Long vehicleId, Pageable pageable);
    List<ParkingLog> findByIsVerifiedFalse();
    
    // ===== STATS QUERIES =====
    Long countByIsVerifiedFalseAndDetectedAtBetween(LocalDateTime start, LocalDateTime end);
    Long countByIsNotifiedTrueAndNotifiedAtBetween(LocalDateTime start, LocalDateTime end);
    Long countByIsVerifiedFalse();
    
    // ===== DELETE QUERIES =====
    @Modifying
    @Query("DELETE FROM ParkingLog p WHERE p.detectedAt < :cutoff")
    Integer deleteByDetectedAtBefore(@Param("cutoff") LocalDateTime cutoff);
    
    @Modifying
    @Query("DELETE FROM ParkingLog p WHERE p.licensePlate = :licensePlate")
    Integer deleteByLicensePlate(@Param("licensePlate") String licensePlate);
    
    // ===== FILTER QUERIES =====
    @Query("SELECT p FROM ParkingLog p WHERE " +
           "(:licensePlate IS NULL OR p.licensePlate LIKE %:licensePlate%) AND " +
           "(:direction IS NULL OR p.direction = :direction) AND " +
           "(:isVerified IS NULL OR p.isVerified = :isVerified) AND " +
           "(:fromDate IS NULL OR p.detectedAt >= :fromDate) AND " +
           "(:toDate IS NULL OR p.detectedAt <= :toDate)")
    Page<ParkingLog> findAllWithFilters(
        @Param("licensePlate") String licensePlate,
        @Param("direction") String direction,
        @Param("isVerified") Boolean isVerified,
        @Param("fromDate") LocalDateTime fromDate,
        @Param("toDate") LocalDateTime toDate,
        Pageable pageable);
    
    // ===== CURRENT VEHICLES INSIDE =====
    @Query("SELECT p FROM ParkingLog p WHERE p.direction = 'IN' " +
           "AND NOT EXISTS (SELECT p2 FROM ParkingLog p2 WHERE p2.licensePlate = p.licensePlate " +
           "AND p2.direction = 'OUT' AND p2.detectedAt > p.detectedAt)")
    List<ParkingLog> findCurrentVehiclesInside();

     List<ParkingLog> findTopByLicensePlateOrderByDetectedAtDesc(String licensePlate);

     // Tìm kiếm lịch sử và phân trang theo khoảng thời gian
    Page<ParkingLog> findByDetectedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
    
    // Đếm tổng số lượt xe đi VÀO (IN) trong khoảng thời gian
    long countByDirectionAndDetectedAtBetween(String direction, LocalDateTime start, LocalDateTime end);

    // Đếm số lượt OCR thất bại trong khoảng thời gian
    long countByStatusAndDetectedAtBetween(String status, LocalDateTime start, LocalDateTime end);

    // Đếm số lượt xe lạ (vãng lai - không có liên kết xe)
    long countByVehicleIsNullAndDetectedAtBetween(LocalDateTime start, LocalDateTime end);

}