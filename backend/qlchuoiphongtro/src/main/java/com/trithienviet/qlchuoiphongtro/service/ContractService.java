package com.trithienviet.qlchuoiphongtro.service;

import java.util.List;

import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ContractServiceDTO;

public interface ContractService {

    ContractDTO createContract(ContractDTO dto);

    List<ContractDTO> getAllContracts();

    ContractDTO getContractById(Long id);

    ContractDTO updateContract(Long id, ContractDTO dto);

    void deleteContract(Long id);

    void updateStatus(Long contractId, ContractStatus status);

    List<ContractDTO> autoUpdateStatus();

    List<ContractDTO> getContractsByStatus(ContractStatus status);

    void terminateContract(Long contractId);

    void addMember(Long contractId, Long profileId);

    void removeMember(Long contractId, Long profileId);

    List<Long> getMemberIds(Long contractId);

    List<ContractDTO> getContractsByRoom(Long roomId);

    List<ContractServiceDTO> getServicesByContract(Long contractId);

    void addServices(Long contractId, List<ContractServiceDTO> services);

    void updateService(Integer contractServiceId, ContractServiceDTO dto);

    void deleteService(Integer contractServiceId);
}