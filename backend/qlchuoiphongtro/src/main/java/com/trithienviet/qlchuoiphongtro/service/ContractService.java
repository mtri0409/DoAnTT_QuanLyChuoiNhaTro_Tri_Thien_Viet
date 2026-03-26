package com.trithienviet.qlchuoiphongtro.service;

import java.util.List;

import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;

public interface ContractService {

    ContractDTO createContract(ContractDTO dto);

    List<ContractDTO> getAllContracts();

    ContractDTO getContractById(Long id);

    ContractDTO updateContract(Long id, ContractDTO dto);

    void deleteContract(Long id);
}
