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
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    // 4. Kiểm tra biển số chưa xóa
    boolean existsByLicensePlateAndStatusFalse(String licensePlate);

    @Query("SELECT v FROM Vehicle v " +
       "JOIN v.owner p " + 
       "LEFT JOIN p.roomMember rm " +
       "LEFT JOIN rm.contract c " +
       "LEFT JOIN c.room r " +
       "LEFT JOIN r.floor f " +
       "WHERE v.status = :status " + // Lưu ý: dùng isActive hay status tùy thuộc Entity của bạn
       "AND (:branchId IS NULL OR f.branch.branchId = :branchId) " +
       "AND (:keyword IS NULL OR (" +
          "LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
          "LOWER(p.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
          "LOWER(r.roomName) LIKE LOWER(CONCAT('%', :keyword, '%'))" +
       "))")
    Page<Vehicle> searchVehicles(  @Param("keyword") String keyword,
                                    Pageable pageable,
                                    @Param("branchId") Integer branchId,
                                    @Param("status") Boolean status
                               );

    @Query ("SELECT v FROM Vehicle v " + 
            "LEFT JOIN v.owner u " + 
            "LEFT JOIN v.room r " +
            "WHERE v.status = :status" )
    Page<Vehicle> findVehicles(Pageable pageable,@Param("status") Boolean status);

    @Query("SELECT v FROM Vehicle v " +
           "JOIN v.owner p " +
           "JOIN p.roomMember rm " +
           "JOIN rm.contract c " +
           "JOIN c.room r " +
           "JOIN r.floor f " +
           "WHERE v.status = :status " +
           "AND (:branchId IS NULL OR f.branch.branchId = :branchId)")
    Page<Vehicle> findVehiclesByBranch(
        @Param("branchId") Integer branchId,
        @Param("status") Boolean status,
        Pageable pageable
    );

    // Mới thêm cho chức năng đăng ký xe của người thân

    // Lấy danh sách xe của người thân
    @Query("""
            SELECT v FROM Vehicle v
            WHERE v.registeredByMember.memberId = :memberId
            """)
    List<Vehicle> findByRegisteredByMember(@Param("memberId") Integer memberId);

    // Kiểm tra biển số xe đã tồn tại (kể cả đã xóa)
    @Query("""
            SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END
            FROM Vehicle v
            WHERE LOWER(v.licensePlate) = LOWER(:licensePlate)
            """)
    boolean existsByLicensePlateIgnoreCase(@Param("licensePlate") String licensePlate);

    // Lấy xe theo biển số (bất kể status)
    @Query("""
            SELECT v FROM Vehicle v
            WHERE LOWER(v.licensePlate) = LOWER(:licensePlate)
            """)
    Optional<Vehicle> findByLicensePlateIgnoreCase(@Param("licensePlate") String licensePlate);

}