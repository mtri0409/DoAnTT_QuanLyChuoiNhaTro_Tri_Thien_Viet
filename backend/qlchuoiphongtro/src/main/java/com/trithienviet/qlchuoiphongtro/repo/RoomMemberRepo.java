package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
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
}