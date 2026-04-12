package com.trithienviet.qlchuoiphongtro.repo;

import java.time.LocalDate;
import java.util.List;

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
        Pageable pageable
        );
}