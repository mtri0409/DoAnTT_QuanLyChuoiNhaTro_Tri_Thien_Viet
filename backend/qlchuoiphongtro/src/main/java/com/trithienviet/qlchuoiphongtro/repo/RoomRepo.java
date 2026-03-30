package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepo extends JpaRepository<Room, Long> {

    @Query("""
        SELECT r FROM Room r 
        WHERE (:floorId IS NULL OR r.floor.floorId = :floorId)
          AND (:branchId IS NULL OR r.floor.branch.branchId = :branchId)
          AND (:search IS NULL OR LOWER(r.roomName) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Room> findAllWithFilter(
        @Param("floorId") Long floorId,
        @Param("branchId") Long branchId,
        @Param("search") String search,
        Pageable pageable
    );
}