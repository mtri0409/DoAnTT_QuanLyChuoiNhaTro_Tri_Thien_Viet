package com.trithienviet.qlchuoiphongtro.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;
import com.trithienviet.qlchuoiphongtro.repo.ContractRepo;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.service.ContractService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContractServiceImpl implements ContractService {

    private final ContractRepo contractRepo;
    private final RoomRepo roomRepo;
    private final ProfileRepo profileRepo;

    @Override
    public ContractDTO createContract(ContractDTO dto) {

        Room room = roomRepo.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        Profile profile = profileRepo.findById(dto.getRepresentativeId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        // Check phòng đã có hợp đồng ACTIVE chưa
        boolean exists = contractRepo.existsByRoom_RoomIdAndStatus(dto.getRoomId(), "ACTIVE");
        if (exists) {
            throw new RuntimeException("Room already has active contract");
        }

        Contract contract = new Contract();
        contract.setRoom(room);
        contract.setRepresentative(profile);
        contract.setRentPrice(dto.getRentPrice());
        contract.setDepositAmount(dto.getDepositAmount());
        contract.setStartDate(dto.getStartDate());
        contract.setEndDate(dto.getEndDate());
        contract.setBillingDay(dto.getBillingDay());
        contract.setStatus("ACTIVE");

        Contract saved = contractRepo.save(contract);

        return mapToDTO(saved);
    }

    @Override
    public List<ContractDTO> getAllContracts() {
        return contractRepo.findAll()
                .stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public ContractDTO getContractById(Long id) {
        Contract contract = contractRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        return mapToDTO(contract);
    }

    @Override
    public ContractDTO updateContract(Long id, ContractDTO dto) {
        Contract contract = contractRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        contract.setRentPrice(dto.getRentPrice());
        contract.setDepositAmount(dto.getDepositAmount());
        contract.setStartDate(dto.getStartDate());
        contract.setEndDate(dto.getEndDate());
        contract.setBillingDay(dto.getBillingDay());
        contract.setStatus(dto.getStatus());

        return mapToDTO(contractRepo.save(contract));
    }

    @Override
    public void deleteContract(Long id) {
        contractRepo.deleteById(id);
    }

    // mapper
    private ContractDTO mapToDTO(Contract c) {
        return ContractDTO.builder()
                .contractId(c.getContractId())
                .roomId(c.getRoom().getRoomId())
                .rentPrice(c.getRentPrice())
                .depositAmount(c.getDepositAmount())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .status(c.getStatus())
                .billingDay(c.getBillingDay())
                .build();
    }
}
