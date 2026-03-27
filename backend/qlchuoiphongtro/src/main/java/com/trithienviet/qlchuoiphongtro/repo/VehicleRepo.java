package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
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
}