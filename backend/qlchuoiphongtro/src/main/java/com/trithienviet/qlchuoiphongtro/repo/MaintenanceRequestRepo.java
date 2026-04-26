package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.MaintenanceRequest;

@Repository
public interface MaintenanceRequestRepo extends JpaRepository<MaintenanceRequest, Integer> {

    // Lấy tất cả yêu cầu theo phòng (cho admin hoặc tenant xem lịch sử phòng)
    Page<MaintenanceRequest> findByRoom_RoomId(Long roomId, Pageable pageable);

    // Lấy tất cả yêu cầu của một tenant (theo creator username)
    Page<MaintenanceRequest> findByCreator_UserName(String username, Pageable pageable);

    // Lọc theo trạng thái (cho admin)
    Page<MaintenanceRequest> findByStatus(String status, Pageable pageable);

    // Lọc theo phòng + trạng thái
    Page<MaintenanceRequest> findByRoom_RoomIdAndStatus(Long roomId, String status, Pageable pageable);

    // Đếm yêu cầu đang chờ xử lý (PENDING) – dùng cho dashboard admin
    long countByStatus(String status);

    // Tìm tất cả yêu cầu theo branchId để admin chi nhánh quản lý
    @Query("SELECT mr FROM MaintenanceRequest mr " +
            "JOIN mr.room r JOIN r.floor f JOIN f.branch b " +
            "WHERE b.branchId = :branchId")
    Page<MaintenanceRequest> findByBranchId(@Param("branchId") Integer branchId, Pageable pageable);

    @Query("SELECT mr FROM MaintenanceRequest mr " +
            "JOIN mr.room r JOIN r.floor f JOIN f.branch b " +
            "WHERE b.branchId = :branchId AND mr.status = :status")
    Page<MaintenanceRequest> findByBranchIdAndStatus(
            @Param("branchId") Integer branchId,
            @Param("status") String status,
            Pageable pageable);

    @Query("SELECT mr FROM MaintenanceRequest mr " +
            "JOIN mr.room r JOIN r.floor f " +
            "WHERE f.floorId = :floorId")
    Page<MaintenanceRequest> findByFloorId(@Param("floorId") Long floorId, Pageable pageable);

    @Query("SELECT mr FROM MaintenanceRequest mr " +
            "JOIN mr.room r JOIN r.floor f " +
            "WHERE f.floorId = :floorId AND mr.status = :status")
    Page<MaintenanceRequest> findByFloorIdAndStatus(
            @Param("floorId") Long floorId,
            @Param("status") String status,
            Pageable pageable);
}