package com.trithienviet.qlchuoiphongtro.repo;

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

        @Query("SELECT c FROM Contract c WHERE c.isDeleted = false AND (" +
                        "LOWER(c.representative.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
                        "LOWER(c.room.roomName) LIKE LOWER(CONCAT('%', :keyword, '%')))")
        Page<Contract> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
}