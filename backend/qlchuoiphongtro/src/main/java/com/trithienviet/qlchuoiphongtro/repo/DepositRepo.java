package com.trithienviet.qlchuoiphongtro.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.Deposit;

@Repository
public interface DepositRepo extends JpaRepository<Deposit, Long> {

    Optional<Deposit> findByRoom_RoomId(Long roomId);
}