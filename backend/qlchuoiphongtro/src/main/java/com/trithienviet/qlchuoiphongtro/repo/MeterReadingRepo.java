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
import java.util.Map;
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

        // Query cũ — giữ lại để tương thích, nhưng KHÔNG dùng cho saveReading nữa
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

        /**
         * Tìm bản ghi kỳ trước — KỂ CẢ bản isInitial=true.
         * Dùng thay thế findPreviousReading trong saveReading và getPreviousReading
         * để tránh oldValue = 0 khi phòng mới có người thuê đầu tiên vào cùng tháng
         * thêm phòng (bản isInitial cùng tháng không được findPreviousReading tìm
         * thấy).
         *
         * Logic: lấy bản ghi mới nhất có kỳ TRƯỚC kỳ hiện tại, kể cả isInitial.
         * Nếu bản isInitial được lưu cùng tháng thì dùng cột LIMIT 1 theo readingDate.
         */
        @Query("SELECT mr FROM MeterReading mr " +
                        "WHERE mr.room.roomId = :roomId " +
                        "AND mr.service.serviceId = :serviceId " +
                        "AND (mr.periodYear < :year OR (mr.periodYear = :year AND mr.periodMonth < :month)) " +
                        "ORDER BY mr.periodYear DESC, mr.periodMonth DESC, mr.readingDate DESC")
        List<MeterReading> findPreviousReadingIncludingInitial(
                        @Param("roomId") Long roomId,
                        @Param("serviceId") Integer serviceId,
                        @Param("month") Integer month,
                        @Param("year") Integer year);

        /**
         * Tìm bản isInitial của phòng cho một service cụ thể.
         * Dùng khi phòng có hợp đồng nhưng chưa có bản ghi kỳ trước nào
         * (người thuê đầu tiên vào cùng tháng thêm phòng).
         * Dùng native query để tránh phụ thuộc vào field isInitial trong entity
         * (entity có thể dùng tên khác hoặc chưa có field này).
         */
        @Query("SELECT mr FROM MeterReading mr " +
                        "WHERE mr.room.roomId = :roomId " +
                        "AND mr.service.serviceId = :serviceId " +
                        "AND mr.isInitial = true " +
                        "ORDER BY mr.readingDate DESC")
        List<MeterReading> findInitialReading(
                        @Param("roomId") Long roomId,
                        @Param("serviceId") Integer serviceId);

        /**
         * Tìm bản isInitial trong CÙNG THÁNG — dùng khi thêm phòng và người thuê
         * vào cùng tháng. findPreviousReadingIncludingInitial tìm period < tháng hiện
         * tại nên bỏ sót bản isInitial cùng tháng → phải tìm riêng bằng query này.
         */
        @Query("SELECT mr FROM MeterReading mr " +
                        "WHERE mr.room.roomId = :roomId " +
                        "AND mr.service.serviceId = :serviceId " +
                        "AND mr.periodMonth = :month " +
                        "AND mr.periodYear = :year " +
                        "AND mr.isInitial = true " +
                        "ORDER BY mr.readingDate DESC")
        List<MeterReading> findInitialReadingSameMonth(
                        @Param("roomId") Long roomId,
                        @Param("serviceId") Integer serviceId,
                        @Param("month") Integer month,
                        @Param("year") Integer year);

        @Query(value = "SELECT " +
                        "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :elecName, '%') THEN m.usage_value ELSE 0 END), 0) as totalElectricUsage, "
                        +
                        "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :elecName, '%') THEN m.usage_value * s.price ELSE 0 END), 0) as totalElectricMoney, "
                        +
                        "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :waterName, '%') THEN m.usage_value ELSE 0 END), 0) as totalWaterUsage, "
                        +
                        "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :waterName, '%') THEN m.usage_value * s.price ELSE 0 END), 0) as totalWaterMoney "
                        +
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
                        @Param("waterName") String waterName);

        @Query(value = "SELECT " +
                        "m.period_month as period_month, " +
                        "m.period_year as period_year, " +
                        "b.branch_name as branch_name, " +
                        "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :elecName, '%') THEN m.usage_value ELSE 0 END), 0) as total_electric_usage, " +
                        "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :elecName, '%') THEN m.usage_value * s.price ELSE 0 END), 0) as total_electric_money, " +
                        "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :waterName, '%') THEN m.usage_value ELSE 0 END), 0) as total_water_usage, " +
                        "COALESCE(SUM(CASE WHEN s.service_name LIKE CONCAT('%', :waterName, '%') THEN m.usage_value * s.price ELSE 0 END), 0) as total_water_money " +
                        "FROM meter_readings m " +
                        "JOIN services s ON m.service_id = s.service_id " +
                        "JOIN rooms r ON m.room_id = r.room_id " +
                        "JOIN floors f ON r.floor_id = f.floor_id " +
                        "JOIN branches b ON f.branch_id = b.branch_id " +
                        "WHERE (:branchName IS NULL OR LOWER(b.branch_name) LIKE LOWER(CONCAT('%', :branchName, '%'))) " +
                        "AND (:month IS NULL OR m.period_month = :month) " +
                        "AND (:year IS NULL OR m.period_year = :year) " +
                        "GROUP BY b.branch_name, m.period_year, m.period_month " +
                        "ORDER BY m.period_year DESC, m.period_month DESC, b.branch_name ASC", nativeQuery = true)
        List<Map<String, Object>> findUtilityStats(
                        @Param("branchName") String branchName,
                        @Param("month") Integer month,
                        @Param("year") Integer year,
                        @Param("elecName") String elecName,
                        @Param("waterName") String waterName);
}