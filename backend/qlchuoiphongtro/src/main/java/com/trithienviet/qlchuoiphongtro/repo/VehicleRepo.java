package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.trithienviet.qlchuoiphongtro.entity.Vehicle;

public interface VehicleRepo extends JpaRepository<Vehicle, Long> {

    // 1. Kiểm tra biển số (Dùng đúng tên biến licensePlate trong Entity)
    boolean existsByLicensePlate(String licensePlate);

    // 2. Tìm xe theo ID của xe và status (Dùng vehicleId khớp với @Id trong Vehicle)
    Optional<Vehicle> findByVehicleIdAndStatusFalse(Long vehicleId);

    // 3. QUAN TRỌNG: Tìm theo ID của Profile 
    // Tên biến trong Vehicle là 'owner', tên biến ID trong Profile là 'profileId'
    // Kết hợp lại thành: Owner + ProfileId
    List<Vehicle> findByOwnerProfileIdAndStatusFalse(Long profileId);

    // 4. Kiểm tra biển số chưa xóa
        boolean existsByLicensePlateAndStatusFalse(String licensePlate);
    @Query("SELECT v FROM Vehicle v " +
        "LEFT JOIN v.owner u " +
        "LEFT JOIN v.room r " +
        "WHERE v.status = true AND " + // Thêm điều kiện status ở đây
        "(:keyword IS NULL OR " +
        "LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
        "LOWER(r.roomName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Vehicle> searchVehicles(@Param("keyword") String keyword, Pageable pageable);
    Page<Vehicle> findByStatusTrue(Pageable pageable);
    Page<Vehicle> findByStatusFalse(Pageable pageable);

}