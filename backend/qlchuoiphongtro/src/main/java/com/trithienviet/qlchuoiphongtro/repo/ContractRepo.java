package com.trithienviet.qlchuoiphongtro.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.Contract;

@Repository
public interface ContractRepo extends JpaRepository<Contract, Long> {

    boolean existsByRoom_RoomIdAndStatus(Long roomId, String status);

}
