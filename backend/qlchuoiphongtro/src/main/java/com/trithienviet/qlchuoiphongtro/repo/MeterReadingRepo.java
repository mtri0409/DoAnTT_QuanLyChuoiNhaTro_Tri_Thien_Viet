package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.MeterReading;
import com.trithienviet.qlchuoiphongtro.payloads.UtilityProjection;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeterReadingRepo extends JpaRepository<MeterReading, Long> {

        Optional<MeterReading> findByRoom_RoomIdAndService_ServiceIdAndPeriodMonthAndPeriodYear(
                        Long roomId, Integer serviceId, Integer month, Integer year);

        boolean existsByRoom_RoomIdAndService_ServiceIdAndPeriodMonthAndPeriodYear(
                        Long roomId, Integer serviceId, Integer month, Integer year);

        List<MeterReading> findByRoom_RoomId(Long roomId);

        Page<MeterReading> findByRoom_RoomId(Long roomId, Pageable pageable);

        List<MeterReading> findByRoom_RoomIdAndPeriodMonthAndPeriodYear(
                        Long roomId, Integer month, Integer year);

        @Query("SELECT mr FROM MeterReading mr " +
                        "WHERE mr.room.roomId = :roomId " +
                        "AND mr.service.serviceId = :serviceId " +
                        "AND (mr.periodYear < :year OR (mr.periodYear = :year AND mr.periodMonth < :month)) " +
                        "ORDER BY mr.periodYear DESC, mr.periodMonth DESC")
        List<MeterReading> findPreviousReading(
                        @Param("roomId") Long roomId,
                        @Param("serviceId") Integer serviceId,
                        @Param("month") Integer month,
                        @Param("year") Integer year);
       @Query(value = "SELECT " +
                "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :elecName, '%') THEN m.usage_value ELSE 0 END), 0) as totalElectricUsage, " +
                "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :elecName, '%') THEN m.usage_value * s.price ELSE 0 END), 0) as totalElectricMoney, " +
                "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :waterName, '%') THEN m.usage_value ELSE 0 END), 0) as totalWaterUsage, " +
                "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :waterName, '%') THEN m.usage_value * s.price ELSE 0 END), 0) as totalWaterMoney " +
                "FROM meter_readings m " +
                "JOIN services s ON m.service_id = s.service_id " +
                "JOIN rooms r ON m.room_id = r.room_id " +
                "JOIN floors f ON r.floor_id = f.floor_id " +
                "WHERE (:branchId IS NULL OR f.branch_id = :branchId) " +
                "AND (:month IS NULL OR m.period_month = :month) " +
                "AND (:year IS NULL OR m.period_year = :year)", nativeQuery = true)
        UtilityProjection getUtilityAnalytics(
        @Param("branchId") Long branchId, 
        @Param("month") Integer month, 
        @Param("year") Integer year,
        @Param("elecName") String elecName, 
        @Param("waterName") String waterName
        );
}