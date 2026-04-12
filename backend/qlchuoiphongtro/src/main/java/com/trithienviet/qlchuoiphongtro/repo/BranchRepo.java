package com.trithienviet.qlchuoiphongtro.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.trithienviet.qlchuoiphongtro.entity.Branch;
import com.trithienviet.qlchuoiphongtro.payloads.BranchDashboardStatsDTO;


public interface BranchRepo extends JpaRepository<Branch, Long> {
    
    @Query("SELECT new com.trithienviet.qlchuoiphongtro.payloads.BranchDashboardStatsDTO(" +
        "COUNT(DISTINCT f.floorId), " + 
        "COUNT(DISTINCT r.roomId), " + 
        "COUNT(DISTINCT CASE WHEN r.status = 'EMPTY' THEN r.roomId END), " + 
        "COUNT(DISTINCT CASE WHEN r.status = 'OCCUPIED' THEN r.roomId END), " + 
        "COUNT(DISTINCT CASE WHEN r.status = 'MAINTENANCE' THEN r.roomId END), " + 
        "COUNT(DISTINCT rm.memberId)) " + // Đếm member dựa trên memberId của RoomMember
        "FROM Room r " +
        "JOIN r.floor f " + 
        "JOIN f.branch b " + 
        "LEFT JOIN r.contracts c " +      // Bây giờ đã có field 'contracts' trong Room
        "LEFT JOIN c.roomMembers rm " +   // JOIN sang RoomMember từ Contract
        "WHERE b.branchId = :branchId")
    BranchDashboardStatsDTO getCombinedStatsByBranchId(@Param("branchId") Long branchId);

        @Query("SELECT new com.trithienviet.qlchuoiphongtro.payloads.BranchDashboardStatsDTO(" +
        "COUNT(DISTINCT f.floorId), " + 
        "COUNT(DISTINCT r.roomId), " + 
        "COUNT(DISTINCT CASE WHEN r.status = 'EMPTY' THEN r.roomId END), " + 
        "COUNT(DISTINCT CASE WHEN r.status = 'OCCUPIED' THEN r.roomId END), " + 
        "COUNT(DISTINCT CASE WHEN r.status = 'MAINTENANCE' THEN r.roomId END), " + 
        "COUNT(DISTINCT rm.memberId)) " + 
        "FROM Room r " +
        "JOIN r.floor f " + 
        "JOIN f.branch b " + 
        "LEFT JOIN r.contracts c " +      
        "LEFT JOIN c.roomMembers rm ")
     // Giả sử bạn có trường isDeleted để lọc phòng rác
    BranchDashboardStatsDTO getTotalSystemStats();
}