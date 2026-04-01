package com.trithienviet.qlchuoiphongtro.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.RoomStatus;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;
import com.trithienviet.qlchuoiphongtro.repo.ContractRepo;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.service.ContractService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ContractServiceImpl implements ContractService {

    private final ContractRepo contractRepo;
    private final RoomRepo roomRepo;
    private final ProfileRepo profileRepo;

    @Override
    public ContractDTO createContract(ContractDTO dto) {

        // 🔹 1. Lấy room
        Room room = roomRepo.findById(dto.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        // 🔹 2. Check trạng thái phòng
        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new IllegalArgumentException("Room is not available");
        }

        // 🔹 3. Lấy người đại diện
        Profile profile = profileRepo.findById(dto.getRepresentativeId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        // 🔹 4. Validate ngày
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before or equal to end date");
        }

        if (dto.getEndDate().isBefore(dto.getStartDate().plusMonths(1))) {
            throw new IllegalArgumentException("Contract duration must be at least 1 month");
        }

        // 🔹 5. Check contract tồn tại
        boolean hasActive = contractRepo.existsByRoom_RoomIdAndStatusAndIsDeletedFalse(
                dto.getRoomId(), ContractStatus.ACTIVE);

        boolean hasPending = contractRepo.existsByRoom_RoomIdAndStatusAndIsDeletedFalse(
                dto.getRoomId(), ContractStatus.PENDING);

        if (hasActive || hasPending) {
            throw new IllegalArgumentException("Room already has a PENDING or ACTIVE contract");
        }

        // 🔹 6. Tạo contract
        Contract contract = new Contract();
        contract.setRoom(room);
        contract.setRepresentative(profile);
        contract.setRentPrice(dto.getRentPrice());
        contract.setDepositAmount(dto.getDepositAmount());
        contract.setStartDate(dto.getStartDate());
        contract.setEndDate(dto.getEndDate());
        contract.setBillingDay(dto.getBillingDay());

        // 🔹 7. Xác định trạng thái
        ContractStatus status;
        if (dto.getStartDate().isAfter(LocalDate.now())) {
            status = ContractStatus.PENDING;
        } else {
            status = ContractStatus.ACTIVE;
        }
        contract.setStatus(status);

        // 🔹 8. Save contract
        Contract saved = contractRepo.save(contract);

        // 🔥 9. Nếu ACTIVE → cập nhật room
        if (status == ContractStatus.ACTIVE) {
            updateRoomWhenActivate(saved);
        }

        // 🔹 10. Return
        return mapToDTO(saved);
    }

    @Override
    public List<ContractDTO> getAllContracts() {
        return contractRepo.findAll()
                .stream()
                .filter(c -> !Boolean.TRUE.equals(c.getIsDeleted())) // chỉ lấy hợp đồng chưa xóa mềm
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void updateStatus(Long contractId, ContractStatus newStatus) {

        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        ContractStatus current = contract.getStatus();

        // Validate transition
        if (current == ContractStatus.PENDING &&
                (newStatus == ContractStatus.ACTIVE || newStatus == ContractStatus.CANCELLED
                        || newStatus == ContractStatus.TERMINATED)) {
            ContractStatus oldStatus = contract.getStatus();

            contract.setStatus(newStatus);

            handleRoomStatusChange(contract, oldStatus, newStatus);

            contractRepo.save(contract);
        } else if (current == ContractStatus.ACTIVE &&
                (newStatus == ContractStatus.EXPIRED || newStatus == ContractStatus.TERMINATED)) {
            ContractStatus oldStatus = contract.getStatus();
            contract.setStatus(newStatus);
            handleRoomStatusChange(contract, oldStatus, newStatus);

            contractRepo.save(contract);
        } else {
            throw new IllegalArgumentException(
                    String.format("Invalid status transition from %s to %s", current, newStatus));
        }

        contractRepo.save(contract);
    }

    @Override
    public List<ContractDTO> autoUpdateStatus() {

        LocalDate today = LocalDate.now();

        List<Contract> contracts = contractRepo
                .findByStatusInAndIsDeletedFalse(
                        List.of(ContractStatus.PENDING, ContractStatus.ACTIVE));
        List<Contract> changedContracts = new ArrayList<>();

        for (Contract c : contracts) {

            if (c.getStatus() == ContractStatus.PENDING
                    && !c.getStartDate().isAfter(today)) {

                ContractStatus oldStatus = c.getStatus();

                c.setStatus(ContractStatus.ACTIVE);
                handleRoomStatusChange(c, oldStatus, ContractStatus.ACTIVE);

                changedContracts.add(c);
            } else if (c.getStatus() == ContractStatus.ACTIVE
                    && c.getEndDate().isBefore(today)) {

                ContractStatus oldStatus = c.getStatus();

                c.setStatus(ContractStatus.EXPIRED);
                handleRoomStatusChange(c, oldStatus, ContractStatus.EXPIRED);

                changedContracts.add(c);
            }
        }

        if (!changedContracts.isEmpty()) {
            contractRepo.saveAll(changedContracts);
        }

        return changedContracts.stream()
                .map(this::mapToDTO)
                .toList();
    }

    @Override
    public List<ContractDTO> getContractsByStatus(ContractStatus status) {
        return contractRepo.findByStatusAndIsDeletedFalse(status)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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

        if (contract.getStatus() != ContractStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING contracts can be updated. " +
                    "For ACTIVE contracts, please terminate first and create a new one if needed.");
        }

        // Validate dates
        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        contract.setRentPrice(dto.getRentPrice());
        contract.setDepositAmount(dto.getDepositAmount());
        contract.setStartDate(dto.getStartDate());
        contract.setEndDate(dto.getEndDate());
        contract.setBillingDay(dto.getBillingDay());

        Contract saved = contractRepo.save(contract);
        return mapToDTO(saved);
    }

    @Override
    public void deleteContract(Long id) {
        Contract contract = contractRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (contract.getStatus() == ContractStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot delete an ACTIVE contract. Please terminate it first.");
        }

        contract.setIsDeleted(true);
        contractRepo.save(contract);
    }

    // ==================== MAPPER ====================
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
                .representativeId(c.getRepresentative() != null ? c.getRepresentative().getProfileId() : null)
                .build();
    }

    private void handleRoomStatusChange(Contract contract, ContractStatus oldStatus, ContractStatus newStatus) {

        Room room = contract.getRoom();

        // 🔹 PENDING → DEPOSITED (đã cọc → giữ phòng)
        if (oldStatus == ContractStatus.PENDING && newStatus == ContractStatus.DEPOSITED) {

            if (room.getStatus() != RoomStatus.AVAILABLE) {
                throw new IllegalArgumentException("Room is not available for deposit");
            }

            room.setStatus(RoomStatus.DEPOSITED);
        }

        // 🔹 DEPOSITED → ACTIVE (vào ở)
        if (oldStatus == ContractStatus.DEPOSITED && newStatus == ContractStatus.ACTIVE) {

            if (room.getStatus() != RoomStatus.DEPOSITED) {
                throw new IllegalArgumentException("Room must be deposited before activating");
            }

            room.setStatus(RoomStatus.OCCUPIED);
        }

        // 🔹 ACTIVE → TERMINATED / EXPIRED (trả phòng)
        if (oldStatus == ContractStatus.ACTIVE &&
                (newStatus == ContractStatus.TERMINATED || newStatus == ContractStatus.EXPIRED)) {

            room.setStatus(RoomStatus.AVAILABLE);
        }

        // 🔹 DEPOSITED → CANCELLED (hủy cọc → trả phòng)
        if (oldStatus == ContractStatus.DEPOSITED && newStatus == ContractStatus.CANCELLED) {
            room.setStatus(RoomStatus.AVAILABLE);
        }

        // PENDING → CANCELLED (hủy trước khi cọc)
        if (oldStatus == ContractStatus.PENDING && newStatus == ContractStatus.CANCELLED) {
            // không cần đổi vì vẫn AVAILABLE
        }

        roomRepo.save(room);
    }

    private void updateRoomWhenActivate(Contract contract) {
        Room room = contract.getRoom();

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new IllegalArgumentException("Room is not available");
        }

        room.setStatus(RoomStatus.OCCUPIED);
        roomRepo.save(room);
    }
}