package com.trithienviet.qlchuoiphongtro.repo;

import com.trithienviet.qlchuoiphongtro.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepo extends JpaRepository<Payment, Long> {
}