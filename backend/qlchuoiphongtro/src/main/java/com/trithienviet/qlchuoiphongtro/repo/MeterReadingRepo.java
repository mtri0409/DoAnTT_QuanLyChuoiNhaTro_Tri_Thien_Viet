package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.MeterReading;
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
}