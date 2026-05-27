package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.RoomStatus;

@Repository
public interface RoomRepo extends JpaRepository<Room, Long> {

    // Get all rooms
    Page<Room> findAll(Pageable pageable);

    // Filter by floorId
    Page<Room> findByFloor_FloorId(Long floorId, Pageable pageable);

    // Filter by floor's branchId
    @Query("SELECT r FROM Room r WHERE r.floor.branch.branchId = :branchId")
    Page<Room> findByFloor_Branch_BranchId(@Param("branchId") Long branchId, Pageable pageable);

    // Filter by both floorId and branchId
    @Query("SELECT r FROM Room r WHERE r.floor.floorId = :floorId AND r.floor.branch.branchId = :branchId")
    Page<Room> findByFloorAndBranch(
            @Param("floorId") Long floorId,
            @Param("branchId") Long branchId,
            Pageable pageable);

    // Search by roomName
    Page<Room> findByRoomNameContainingIgnoreCase(String roomName, Pageable pageable);

    // Search by roomName + floorId
    @Query("SELECT r FROM Room r WHERE r.roomName LIKE %:search% AND r.floor.floorId = :floorId")
    Page<Room> findBySearchAndFloor(
            @Param("search") String search,
            @Param("floorId") Long floorId,
            Pageable pageable);

    // Search by roomName + branchId
    @Query("SELECT r FROM Room r WHERE r.roomName LIKE %:search% AND r.floor.branch.branchId = :branchId")
    Page<Room> findBySearchAndBranch(
            @Param("search") String search,
            @Param("branchId") Long branchId,
            Pageable pageable);

    // Search by roomName + floorId + branchId
    @Query("SELECT r FROM Room r WHERE r.roomName LIKE %:search% AND r.floor.floorId = :floorId AND r.floor.branch.branchId = :branchId")
    Page<Room> findBySearchFloorAndBranch(
            @Param("search") String search,
            @Param("floorId") Long floorId,
            @Param("branchId") Long branchId,
            Pageable pageable);

    // Lấy danh sách Room theo Status (Không phân trang)
    List<Room> findByStatus(@Param("status") RoomStatus roomStatus);

    // Lấy danh sách Room theo Status (Có phân trang)
    Page<Room> findByStatus(RoomStatus status, Pageable pageable);

    // =========================================
    // 4. COMBINED QUERIES (Search + Filter + Status)
    // =========================================

    // Search + status
    @Query("SELECT r FROM Room r WHERE LOWER(r.roomName) LIKE LOWER(CONCAT('%', :search, '%')) AND r.status = :status")
    Page<Room> findByRoomNameContainingIgnoreCaseAndStatus(
            @Param("search") String search,
            @Param("status") RoomStatus status,
            Pageable pageable);

    // Floor + status
    Page<Room> findByFloor_FloorIdAndStatus(Long floorId, RoomStatus status, Pageable pageable);

    // Branch + status
    Page<Room> findByFloor_Branch_BranchIdAndStatus(Long branchId, RoomStatus status, Pageable pageable);

    // Floor + Branch + status
    @Query("SELECT r FROM Room r WHERE r.floor.floorId = :floorId AND r.floor.branch.branchId = :branchId AND r.status = :status")
    Page<Room> findByFloorBranchAndStatus(
            @Param("floorId") Long floorId,
            @Param("branchId") Long branchId,
            @Param("status") RoomStatus status,
            Pageable pageable);

    // Search + Floor + status
    @Query("SELECT r FROM Room r WHERE LOWER(r.roomName) LIKE LOWER(CONCAT('%', :search, '%')) AND r.floor.floorId = :floorId AND r.status = :status")
    Page<Room> findBySearchFloorAndStatus(
            @Param("search") String search,
            @Param("floorId") Long floorId,
            @Param("status") RoomStatus status,
            Pageable pageable);

    // Search + Branch + status
    @Query("SELECT r FROM Room r WHERE LOWER(r.roomName) LIKE LOWER(CONCAT('%', :search, '%')) AND r.floor.branch.branchId = :branchId AND r.status = :status")
    Page<Room> findBySearchBranchAndStatus(
            @Param("search") String search,
            @Param("branchId") Long branchId,
            @Param("status") RoomStatus status,
            Pageable pageable);

    // Search + Floor + Branch + status
    @Query("SELECT r FROM Room r WHERE LOWER(r.roomName) LIKE LOWER(CONCAT('%', :search, '%')) AND r.floor.floorId = :floorId AND r.floor.branch.branchId = :branchId AND r.status = :status")
    Page<Room> findBySearchFloorBranchAndStatus(
            @Param("search") String search,
            @Param("floorId") Long floorId,
            @Param("branchId") Long branchId,
            @Param("status") RoomStatus status,
            Pageable pageable);

    // Search + Floor + Branch + Status + MaxPeople
    @Query("""
            SELECT r FROM Room r
            WHERE (:search IS NULL OR :search = '' OR LOWER(r.roomName) LIKE LOWER(CONCAT('%', :search, '%')))
            AND (:floorId IS NULL OR r.floor.floorId = :floorId)
            AND (:branchId IS NULL OR r.floor.branch.branchId = :branchId)
            AND (:status IS NULL OR r.status = :status)
            AND (:maxPeople IS NULL OR r.maxPeople <= :maxPeople)
            """)
    Page<Room> findRoomsWithFilters(
            @Param("search") String search,
            @Param("floorId") Long floorId,
            @Param("branchId") Long branchId,
            @Param("status") RoomStatus status,
            @Param("maxPeople") Integer maxPeople,
            Pageable pageable);
}