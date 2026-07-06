package com.trithienviet.qlchuoiphongtro.repo;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;

@Repository
public interface ContractRepo extends JpaRepository<Contract, Long> {

        boolean existsByRoom_RoomIdAndStatusAndIsDeletedFalse(
                        Long roomId, ContractStatus status);

        Page<Contract> findByIsDeletedFalse(Pageable pageable);

        Page<Contract> findByStatusAndIsDeletedFalse(ContractStatus status, Pageable pageable);

        List<Contract> findByStatusAndIsDeletedFalse(ContractStatus status);

        List<Contract> findByStatusInAndIsDeletedFalse(List<ContractStatus> statuses);

        boolean existsByRoom_RoomIdAndStatusInAndIsDeletedFalse(
                        Long roomId, List<ContractStatus> statuses);

        List<Contract> findByRoom_RoomIdAndIsDeletedFalse(Long roomId);

        List<Contract> findByRepresentative_ProfileIdAndIsDeletedFalse(Long profileId);

        @Query("SELECT c FROM Contract c WHERE c.isDeleted = false AND (" +
                        "LOWER(c.representative.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(c.room.roomName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(c.representative.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(c.representative.identityNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "CAST(c.contractId AS char) LIKE CONCAT('%', :rawId, '%'))")
        Page<Contract> searchByKeyword(
                        @Param("keyword") String keyword,
                        @Param("rawId") String rawId,
                        Pageable pageable);

        @Query("SELECT c FROM Contract c " +
                        "WHERE c.status = 'ACTIVE' " +
                        "AND c.endDate <= :limitDate " +
                        "AND (:branchId IS NULL OR c.room.floor.branch.branchId = :branchId) " +
                        "ORDER BY c.endDate ASC")
        List<Contract> findTopExpiringContracts(
                        @Param("limitDate") LocalDate limitDate,
                        @Param("branchId") Long branchId,
                        Pageable pageable);

        @Query("SELECT c FROM Contract c WHERE c.isDeleted = false " +
                        "AND (:status IS NULL OR c.status = :status) " +
                        "AND (:branchId IS NULL OR c.room.floor.branch.branchId = :branchId)")
        Page<Contract> filterContracts(@Param("status") ContractStatus status,
                        @Param("branchId") Long branchId,
                        Pageable pageable);

        /**
         * Danh sách hợp đồng đã hết hạn (end_date < CURRENT_DATE).
         * Trả về: tenant_name, tenant_phone, branch_name, room_name,
         *         start_date, end_date, status
         */
        @Query(value = """
            SELECT
                p.full_name AS tenant_name,
                p.phone AS tenant_phone,
                b.branch_name AS branch_name,
                r.room_name AS room_name,
                c.start_date AS start_date,
                c.end_date AS end_date,
                c.status AS status
            FROM
                contracts c
            JOIN
                profiles p ON c.representative_id = p.profile_id
            JOIN
                rooms r ON c.room_id = r.room_id
            JOIN
                floors f ON r.floor_id = f.floor_id
            JOIN
                branches b ON f.branch_id = b.branch_id
            WHERE
                c.is_deleted = false
                AND c.end_date < CURRENT_DATE
                AND (:branchName IS NULL OR LOWER(b.branch_name) LIKE LOWER(CONCAT('%', :branchName, '%')))
            ORDER BY
                c.end_date DESC, b.branch_name ASC, r.room_name ASC
            """, nativeQuery = true)
        List<Map<String, Object>> findExpiredContracts(
                        @Param("branchName") String branchName);

        /**
         * Danh sách hợp đồng theo trạng thái cụ thể (PENDING, ACTIVE, EXPIRED, TERMINATED, CANCELLED, DEPOSITED).
         * Trả về: tenant_name, tenant_phone, branch_name, room_name,
         *         start_date, end_date, status
         */
        @Query(value = """
            SELECT
                p.full_name AS tenant_name,
                p.phone AS tenant_phone,
                b.branch_name AS branch_name,
                r.room_name AS room_name,
                c.start_date AS start_date,
                c.end_date AS end_date,
                c.status AS status
            FROM
                contracts c
            JOIN
                profiles p ON c.representative_id = p.profile_id
            JOIN
                rooms r ON c.room_id = r.room_id
            JOIN
                floors f ON r.floor_id = f.floor_id
            JOIN
                branches b ON f.branch_id = b.branch_id
            WHERE
                c.is_deleted = false
                AND (:status IS NULL OR c.status = :status)
                AND (:branchName IS NULL OR LOWER(b.branch_name) LIKE LOWER(CONCAT('%', :branchName, '%')))
            ORDER BY
                c.end_date DESC, b.branch_name ASC, r.room_name ASC
            """, nativeQuery = true)
        List<Map<String, Object>> findContractsByStatus(
                        @Param("status") String status,
                        @Param("branchName") String branchName);

        /**
         * Danh sách hợp đồng sắp hết hạn trong một tháng cụ thể.
         * Trả về: tenant_name, tenant_phone, branch_name, room_name,
         *         start_date, end_date, status
         */
        @Query(value = """
            SELECT
                p.full_name AS tenant_name,
                p.phone AS tenant_phone,
                b.branch_name AS branch_name,
                r.room_name AS room_name,
                c.start_date AS start_date,
                c.end_date AS end_date,
                c.status AS status
            FROM
                contracts c
            JOIN
                profiles p ON c.representative_id = p.profile_id
            JOIN
                rooms r ON c.room_id = r.room_id
            JOIN
                floors f ON r.floor_id = f.floor_id
            JOIN
                branches b ON f.branch_id = b.branch_id
            WHERE
                c.is_deleted = false
                AND c.status = 'ACTIVE'
                AND c.end_date >= :startDate
                AND c.end_date <= :endDate
                AND (:branchName IS NULL OR LOWER(b.branch_name) LIKE LOWER(CONCAT('%', :branchName, '%')))
            ORDER BY
                c.end_date ASC, b.branch_name ASC, r.room_name ASC
            """, nativeQuery = true)
        List<Map<String, Object>> findContractsExpiringInMonth(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("branchName") String branchName);

}