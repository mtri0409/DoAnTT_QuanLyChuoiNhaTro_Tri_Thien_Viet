package com.trithienviet.qlchuoiphongtro.repo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.ContractService;

@Repository
public interface ContractServiceRepo extends JpaRepository<ContractService, Integer> {
    List<ContractService> findByContract_ContractId(Long contractId);

    boolean existsByContract_ContractIdAndService_ServiceId(Long contractId, Integer serviceId);
}