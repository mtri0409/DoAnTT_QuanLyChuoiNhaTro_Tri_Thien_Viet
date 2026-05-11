package com.trithienviet.qlchuoiphongtro.service;

import java.util.List;

import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ContractServiceDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;

public interface ContractService {

        ContractDTO createContract(ContractDTO dto);

        PageResponse<ContractDTO> getAllContracts(int pageNumber, int pageSize, String sortBy, String sortOrder);

        PageResponse<ContractDTO> searchContracts(String keyword, int pageNumber, int pageSize, String sortBy,
                        String sortOrder);

        ContractDTO getContractById(Long id);

        ContractDTO updateContract(Long id, ContractDTO dto);

        void deleteContract(Long id);

        void updateStatus(Long contractId, ContractStatus status);

        List<ContractDTO> autoUpdateStatus();

        PageResponse<ContractDTO> getContractsByStatus(ContractStatus status, int pageNumber, int pageSize,
                        String sortBy,
                        String sortOrder);

        // [FIX] Method mới: lọc theo status + branchId phía backend (thay thế lọc
        // client-side)
        PageResponse<ContractDTO> filterContracts(ContractStatus status, Long branchId, int pageNumber, int pageSize,
                        String sortBy, String sortOrder);

        void terminateContract(Long contractId, String reason);

        void addMember(Long contractId, Long profileId);

        void removeMember(Long contractId, Long profileId);

        List<Long> getMemberIds(Long contractId);

        List<ContractDTO> getContractsByRoom(Long roomId);

        List<ContractServiceDTO> getServicesByContract(Long contractId);

        void addServices(Long contractId, List<ContractServiceDTO> services);

        void updateService(Integer contractServiceId, ContractServiceDTO dto);

        void deleteService(Integer contractServiceId);
}