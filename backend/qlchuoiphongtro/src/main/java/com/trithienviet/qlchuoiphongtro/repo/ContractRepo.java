package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;

@Repository
public interface ContractRepo extends JpaRepository<Contract, Long> {
    boolean existsByRoom_RoomIdAndStatusAndIsDeletedFalse(
            Long roomId,
            ContractStatus status);

    List<Contract> findByStatusAndIsDeletedFalse(ContractStatus status);

    List<Contract> findByStatusInAndIsDeletedFalse(
            List<ContractStatus> statuses);

    boolean existsByRoom_RoomIdAndStatusInAndIsDeletedFalse(
            Long roomId,
            List<ContractStatus> statuses);
}