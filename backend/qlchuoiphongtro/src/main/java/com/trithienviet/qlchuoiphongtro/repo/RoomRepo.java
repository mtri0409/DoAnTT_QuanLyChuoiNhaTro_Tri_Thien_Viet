package com.trithienviet.qlchuoiphongtro.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.trithienviet.qlchuoiphongtro.entity.Room;

@Repository
public interface RoomRepo extends JpaRepository<Room, Long> {
    
    // Get all rooms - no filter
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
            Pageable pageable
    );
    
    // Search by roomName
    Page<Room> findByRoomNameContainingIgnoreCase(String roomName, Pageable pageable);
    
    // Search by roomName and filter by floorId
    @Query("SELECT r FROM Room r WHERE r.roomName LIKE %:search% AND r.floor.floorId = :floorId")
    Page<Room> findBySearchAndFloor(
            @Param("search") String search,
            @Param("floorId") Long floorId,
            Pageable pageable
    );
    
    // Search by roomName and filter by branchId
    @Query("SELECT r FROM Room r WHERE r.roomName LIKE %:search% AND r.floor.branch.branchId = :branchId")
    Page<Room> findBySearchAndBranch(
            @Param("search") String search,
            @Param("branchId") Long branchId,
            Pageable pageable
    );
    
    // Search by roomName and filter by both floorId and branchId
    @Query("SELECT r FROM Room r WHERE r.roomName LIKE %:search% AND r.floor.floorId = :floorId AND r.floor.branch.branchId = :branchId")
    Page<Room> findBySearchFloorAndBranch(
            @Param("search") String search,
            @Param("floorId") Long floorId,
            @Param("branchId") Long branchId,
            Pageable pageable
    );
}