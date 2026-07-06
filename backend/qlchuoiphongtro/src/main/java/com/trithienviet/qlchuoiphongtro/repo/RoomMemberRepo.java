package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.entity.RegistrationStatus;
import com.trithienviet.qlchuoiphongtro.entity.RoomMember;

@Repository
public interface RoomMemberRepo extends JpaRepository<RoomMember, Integer> {

        // Dùng trong createContract và addMember: check profile đã có ACTIVE/PENDING
        // chưa
        boolean existsByProfile_ProfileIdAndContract_StatusIn(
                        Long profileId, List<ContractStatus> statuses);

        // Dùng trong addMember: check profile đã là member của contract này chưa
        boolean existsByProfile_ProfileIdAndContract_ContractId(
                        Long profileId, Long contractId);

        // Dùng trong removeMember: tìm RoomMember cụ thể để xóa
        Optional<RoomMember> findByProfile_ProfileIdAndContract_ContractId(
                        Long profileId, Long contractId);

        // Dùng trong removeMember: đếm số member của contract
        long countByContract_ContractId(Long contractId);

        // Dùng trong getMemberIds: lấy danh sách member của contract
        List<RoomMember> findByContract_ContractId(Long contractId);

        // Method cũ — giữ lại nếu đang dùng ở chỗ khác
        boolean existsByProfile_ProfileIdAndContract_Status(
                        Long profileId, ContractStatus status);

        @Query("""
                        SELECT m.contract.room.roomId FROM RoomMember m
                        WHERE m.profile.profileId = :profileId
                          AND m.isStaying = :isStaying
                        """)
        List<Long> findRoomIdsByProfileIdAndIsStaying(
                        @Param("profileId") Long profileId,
                        @Param("isStaying") boolean isStaying);

        // Mới thêm cho chức năng đăng ký người thân

        // Lấy danh sách người thân chưa duyệt
        @Query("""
                        SELECT m FROM RoomMember m
                        WHERE m.registrationStatus = :status
                          AND m.contract.room.roomId = :roomId
                        """)
        List<RoomMember> findByRoomIdAndRegistrationStatus(
                        @Param("roomId") Long roomId,
                        @Param("status") RegistrationStatus status);

        // Lấy danh sách người thân của phòng
        @Query("""
                        SELECT m FROM RoomMember m
                        WHERE m.contract.room.roomId = :roomId
                          AND m.registrationStatus IS NOT NULL
                        """)
        List<RoomMember> findGuestsByRoomId(@Param("roomId") Long roomId);

        // Lấy danh sách đơn chờ duyệt toàn hệ thống
        @Query("""
                        SELECT m FROM RoomMember m
                        WHERE m.registrationStatus = 'PENDING'
                        ORDER BY m.registrationDate ASC
                        """)
        Page<RoomMember> findPendingRegistrations(Pageable pageable);

        // Kiểm tra người này đã đăng ký ở phòng chưa
        @Query("""
                        SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END
                        FROM RoomMember m
                        WHERE m.profile.profileId = :profileId
                          AND m.contract.room.roomId = :roomId
                          AND m.registrationStatus IN ('PENDING', 'APPROVED')
                        """)
        boolean existsActiveRegistration(@Param("profileId") Long profileId,
                        @Param("roomId") Long roomId);

        // Lấy roomId của người dùng từ profileId (phòng đang ở)
        @Query("""
                        SELECT m.contract.room.roomId FROM RoomMember m
                        WHERE m.profile.profileId = :profileId
                          AND m.contract.status = 'ACTIVE'
                          AND (m.type = 'MAIN_TENANT' OR m.type IS NULL)
                        ORDER BY m.registrationDate DESC
                        LIMIT 1
                        """)
        Optional<Long> findActiveRoomIdByProfileId(@Param("profileId") Long profileId);
}
