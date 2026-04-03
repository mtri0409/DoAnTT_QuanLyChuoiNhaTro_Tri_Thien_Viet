package com.trithienviet.qlchuoiphongtro.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.entity.Deposit;
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.RoomMember;
import com.trithienviet.qlchuoiphongtro.entity.RoomStatus;
import com.trithienviet.qlchuoiphongtro.entity.ServiceItem;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ContractServiceDTO;
import com.trithienviet.qlchuoiphongtro.repo.ContractRepo;
import com.trithienviet.qlchuoiphongtro.repo.ContractServiceRepo;
import com.trithienviet.qlchuoiphongtro.repo.DepositRepo;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomMemberRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.repo.ServiceItemRepo;
import com.trithienviet.qlchuoiphongtro.service.ContractService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ContractServiceImpl implements ContractService {

    private final ContractRepo contractRepo;
    private final RoomRepo roomRepo;
    private final ProfileRepo profileRepo;
    private final RoomMemberRepo roomMemberRepo;
    private final ContractServiceRepo contractServiceRepo;
    private final ServiceItemRepo serviceItemRepo;
    private final DepositRepo depositRepo;

    // ==================== terminateContract ====================
    @Override
    public void terminateContract(Long contractId) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    // ==================== getAllContracts (phân trang) ====================
    @Override
    public Page<ContractDTO> getAllContracts(Pageable pageable) {
        return contractRepo.findByIsDeletedFalse(pageable)
                .map(this::mapToDTO);
    }

    // ==================== searchContracts (phân trang) ====================
    @Override
    public Page<ContractDTO> searchContracts(String keyword, Pageable pageable) {
        String normalizedKeyword = keyword;
        if (keyword != null) {
            // Strip prefix "HD-" nếu có
            normalizedKeyword = keyword.replaceAll("(?i)^HD-0*", "").replaceAll("^0+", "");
            if (normalizedKeyword.isEmpty())
                normalizedKeyword = keyword; // fallback
        }
        return contractRepo.searchByKeyword(normalizedKeyword, pageable)
                .map(this::mapToDTO);
    }

    // ==================== getContractsByStatus (phân trang) ====================
    @Override
    public Page<ContractDTO> getContractsByStatus(ContractStatus status, Pageable pageable) {
        return contractRepo.findByStatusAndIsDeletedFalse(status, pageable)
                .map(this::mapToDTO);
    }

    // ==================== getContractById ====================
    @Override
    public ContractDTO getContractById(Long contractId) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));
        return mapToDTO(contract);
    }

    // ==================== getContractsByRoom ====================
    @Override
    public List<ContractDTO> getContractsByRoom(Long roomId) {
        if (!roomRepo.existsById(roomId)) {
            throw new RuntimeException("Room not found: " + roomId);
        }
        return contractRepo.findByRoom_RoomIdAndIsDeletedFalse(roomId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // ==================== createContract ====================
    @Override
    public ContractDTO createContract(ContractDTO contractRequest) {

        // 1. Validate danh sách thành viên
        if (contractRequest.getMemberIds() == null || contractRequest.getMemberIds().isEmpty()) {
            throw new IllegalArgumentException("Member list cannot be empty");
        }

        if (!contractRequest.getMemberIds().contains(contractRequest.getRepresentativeId())) {
            throw new IllegalArgumentException("Representative must be in member list");
        }

        long distinctMemberCount = contractRequest.getMemberIds().stream().distinct().count();
        if (distinctMemberCount != contractRequest.getMemberIds().size()) {
            throw new IllegalArgumentException("Duplicate member IDs in list");
        }

        // 2. Kiểm tra phòng
        Room room = roomRepo.findById(contractRequest.getRoomId())
                .orElseThrow(() -> new RuntimeException("Room not found"));

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new IllegalArgumentException("Room is not available");
        }

        // 3. Lấy người đại diện
        Profile representative = profileRepo.findById(contractRequest.getRepresentativeId())
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        // 4. Validate ngày hợp đồng
        if (contractRequest.getStartDate().isAfter(contractRequest.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        if (contractRequest.getEndDate().isBefore(contractRequest.getStartDate().plusMonths(1))) {
            throw new IllegalArgumentException("Contract must be at least 1 month");
        }

        // 5. Kiểm tra phòng đã có hợp đồng chưa
        boolean roomHasActiveContract = contractRepo.existsByRoom_RoomIdAndStatusAndIsDeletedFalse(
                contractRequest.getRoomId(), ContractStatus.ACTIVE);
        boolean roomHasPendingContract = contractRepo.existsByRoom_RoomIdAndStatusAndIsDeletedFalse(
                contractRequest.getRoomId(), ContractStatus.PENDING);

        if (roomHasActiveContract || roomHasPendingContract) {
            throw new IllegalArgumentException("Room already has ACTIVE or PENDING contract");
        }

        // 6. Lấy thông tin tiền cọc từ bảng deposit
        Deposit roomDeposit = depositRepo.findByRoom_RoomId(contractRequest.getRoomId())
                .orElseThrow(() -> new RuntimeException("No deposit found for room: " + contractRequest.getRoomId()));

        // 7. Tạo hợp đồng
        Contract newContract = new Contract();
        newContract.setRoom(room);
        newContract.setRepresentative(representative);
        newContract.setRentPrice(room.getPrice());
        newContract.setDepositAmount(roomDeposit.getAmount());
        newContract.setStartDate(contractRequest.getStartDate());
        newContract.setEndDate(contractRequest.getEndDate());
        newContract.setBillingDay(contractRequest.getBillingDay());

        // 8. Xác định trạng thái hợp đồng
        ContractStatus initialStatus = contractRequest.getStartDate().isAfter(LocalDate.now())
                ? ContractStatus.PENDING
                : ContractStatus.ACTIVE;
        newContract.setStatus(initialStatus);

        // 9. Tạo danh sách thành viên phòng
        List<RoomMember> roomMemberList = new ArrayList<>();
        for (Long memberId : contractRequest.getMemberIds()) {
            Profile memberProfile = profileRepo.findById(memberId)
                    .orElseThrow(() -> new RuntimeException("Profile not found: " + memberId));

            boolean memberAlreadyHasActiveContract = roomMemberRepo
                    .existsByProfile_ProfileIdAndContract_StatusIn(
                            memberId, List.of(ContractStatus.ACTIVE, ContractStatus.PENDING));
            if (memberAlreadyHasActiveContract) {
                throw new IllegalArgumentException(
                        "Profile already has ACTIVE or PENDING contract: " + memberId);
            }

            RoomMember roomMember = new RoomMember();
            roomMember.setProfile(memberProfile);
            roomMember.setIsStaying(true);
            roomMember.setContract(newContract);
            roomMemberList.add(roomMember);
        }
        newContract.setRoomMembers(roomMemberList);

        // 10. Lưu hợp đồng
        Contract savedContract = contractRepo.save(newContract);

        // 11. Gắn hợp đồng vào deposit và cập nhật trạng thái deposit
        roomDeposit.setContract(savedContract);
        roomDeposit.setStatus("ACTIVE");
        depositRepo.save(roomDeposit);

        // 12. Tạo danh sách dịch vụ hợp đồng
        if (contractRequest.getContractServices() != null && !contractRequest.getContractServices().isEmpty()) {
            for (ContractServiceDTO serviceRequest : contractRequest.getContractServices()) {
                ServiceItem serviceItem = serviceItemRepo.findById(serviceRequest.getServiceId())
                        .orElseThrow(() -> new RuntimeException("Service not found: " + serviceRequest.getServiceId()));

                com.trithienviet.qlchuoiphongtro.entity.ContractService contractService = new com.trithienviet.qlchuoiphongtro.entity.ContractService();
                contractService.setContract(savedContract);
                contractService.setService(serviceItem);
                contractService.setPriceAtSigning(serviceItem.getPrice());
                contractService.setUnitAtSigning(serviceItem.getUnit());
                contractServiceRepo.save(contractService);
            }
        }

        // 13. Cập nhật trạng thái phòng nếu hợp đồng ACTIVE ngay
        if (initialStatus == ContractStatus.ACTIVE) {
            updateRoomStatusToOccupied(savedContract);
        }

        // 14. Lấy danh sách dịch vụ đã lưu để trả về response đầy đủ
        List<ContractServiceDTO> savedContractServices = contractServiceRepo
                .findByContract_ContractId(savedContract.getContractId())
                .stream()
                .map(this::mapToServiceDTO)
                .collect(Collectors.toList());

        ContractDTO response = mapToDTO(savedContract);
        response.setContractServices(savedContractServices);
        return response;
    }

    // ==================== updateContract ====================
    @Override
    public ContractDTO updateContract(Long contractId, ContractDTO updateRequest) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (contract.getStatus() != ContractStatus.PENDING) {
            throw new IllegalArgumentException("Only PENDING contracts can be updated. " +
                    "For ACTIVE contracts, please terminate first and create a new one if needed.");
        }

        if (updateRequest.getStartDate().isAfter(updateRequest.getEndDate())) {
            throw new IllegalArgumentException("Start date must be before end date");
        }

        // rentPrice và depositAmount không cho phép cập nhật thủ công
        contract.setStartDate(updateRequest.getStartDate());
        contract.setEndDate(updateRequest.getEndDate());
        contract.setBillingDay(updateRequest.getBillingDay());

        return mapToDTO(contractRepo.save(contract));
    }

    // ==================== deleteContract ====================
    @Override
    public void deleteContract(Long contractId) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        if (contract.getStatus() == ContractStatus.ACTIVE) {
            throw new IllegalArgumentException("Cannot delete an ACTIVE contract. Please terminate it first.");
        }

        contract.setIsDeleted(true);
        contractRepo.save(contract);
    }

    // ==================== updateStatus ====================
    @Override
    public void updateStatus(Long contractId, ContractStatus newStatus) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found"));

        ContractStatus currentStatus = contract.getStatus();

        if (currentStatus == ContractStatus.PENDING &&
                (newStatus == ContractStatus.ACTIVE || newStatus == ContractStatus.CANCELLED
                        || newStatus == ContractStatus.TERMINATED)) {
            contract.setStatus(newStatus);
            handleRoomStatusChange(contract, currentStatus, newStatus);
            contractRepo.save(contract);

        } else if (currentStatus == ContractStatus.ACTIVE &&
                (newStatus == ContractStatus.EXPIRED || newStatus == ContractStatus.TERMINATED)) {
            contract.setStatus(newStatus);
            handleRoomStatusChange(contract, currentStatus, newStatus);
            contractRepo.save(contract);

        } else {
            throw new IllegalArgumentException(
                    String.format("Invalid status transition from %s to %s", currentStatus, newStatus));
        }
    }

    // ==================== autoUpdateStatus ====================
    @Override
    public List<ContractDTO> autoUpdateStatus() {
        LocalDate today = LocalDate.now();

        List<Contract> activeAndPendingContracts = contractRepo
                .findByStatusInAndIsDeletedFalse(
                        List.of(ContractStatus.PENDING, ContractStatus.ACTIVE));
        List<Contract> updatedContracts = new ArrayList<>();

        for (Contract contract : activeAndPendingContracts) {
            if (contract.getStatus() == ContractStatus.PENDING
                    && !contract.getStartDate().isAfter(today)) {
                ContractStatus previousStatus = contract.getStatus();
                contract.setStatus(ContractStatus.ACTIVE);
                handleRoomStatusChange(contract, previousStatus, ContractStatus.ACTIVE);
                updatedContracts.add(contract);

            } else if (contract.getStatus() == ContractStatus.ACTIVE
                    && contract.getEndDate().isBefore(today)) {
                ContractStatus previousStatus = contract.getStatus();
                contract.setStatus(ContractStatus.EXPIRED);
                handleRoomStatusChange(contract, previousStatus, ContractStatus.EXPIRED);
                updatedContracts.add(contract);
            }
        }

        if (!updatedContracts.isEmpty()) {
            contractRepo.saveAll(updatedContracts);
        }

        return updatedContracts.stream().map(this::mapToDTO).toList();
    }

    // ==================== addMember ====================
    @Override
    public void addMember(Long contractId, Long profileId) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        if (contract.getStatus() != ContractStatus.ACTIVE
                && contract.getStatus() != ContractStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Cannot add member to a contract with status: " + contract.getStatus());
        }

        Profile newMemberProfile = profileRepo.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Profile not found: " + profileId));

        boolean alreadyMemberOfThisContract = roomMemberRepo
                .existsByProfile_ProfileIdAndContract_ContractId(profileId, contractId);
        if (alreadyMemberOfThisContract) {
            throw new IllegalArgumentException(
                    "Profile " + profileId + " is already a member of this contract");
        }

        boolean hasActiveOrPendingContract = roomMemberRepo
                .existsByProfile_ProfileIdAndContract_StatusIn(
                        profileId, List.of(ContractStatus.ACTIVE, ContractStatus.PENDING));
        if (hasActiveOrPendingContract) {
            throw new IllegalArgumentException(
                    "Profile " + profileId + " already has an ACTIVE or PENDING contract");
        }

        RoomMember newRoomMember = new RoomMember();
        newRoomMember.setProfile(newMemberProfile);
        newRoomMember.setContract(contract);
        newRoomMember.setIsStaying(true);
        roomMemberRepo.save(newRoomMember);
    }

    // ==================== removeMember ====================
    @Override
    public void removeMember(Long contractId, Long profileId) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        if (contract.getStatus() != ContractStatus.ACTIVE
                && contract.getStatus() != ContractStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Cannot remove member from a contract with status: " + contract.getStatus());
        }

        boolean isRepresentative = contract.getRepresentative() != null
                && contract.getRepresentative().getProfileId().equals(profileId);
        if (isRepresentative) {
            throw new IllegalArgumentException(
                    "Cannot remove the representative from contract. Please change representative first.");
        }

        RoomMember memberToRemove = roomMemberRepo
                .findByProfile_ProfileIdAndContract_ContractId(profileId, contractId)
                .orElseThrow(() -> new RuntimeException(
                        "Member with profileId " + profileId + " not found in contract " + contractId));

        long currentMemberCount = roomMemberRepo.countByContract_ContractId(contractId);
        if (currentMemberCount <= 1) {
            throw new IllegalArgumentException(
                    "Cannot remove the last member. Contract must have at least one member.");
        }

        roomMemberRepo.delete(memberToRemove);
    }

    // ==================== getMemberIds ====================
    @Override
    public List<Long> getMemberIds(Long contractId) {
        if (!contractRepo.existsById(contractId)) {
            throw new RuntimeException("Contract not found: " + contractId);
        }
        return roomMemberRepo.findByContract_ContractId(contractId)
                .stream()
                .map(roomMember -> roomMember.getProfile().getProfileId())
                .collect(Collectors.toList());
    }

    // ==================== getServicesByContract ====================
    @Override
    public List<ContractServiceDTO> getServicesByContract(Long contractId) {
        if (!contractRepo.existsById(contractId)) {
            throw new RuntimeException("Contract not found: " + contractId);
        }
        return contractServiceRepo.findByContract_ContractId(contractId)
                .stream()
                .map(this::mapToServiceDTO)
                .collect(Collectors.toList());
    }

    // ==================== addServices ====================
    @Override
    public void addServices(Long contractId, List<ContractServiceDTO> serviceRequests) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        if (contract.getStatus() != ContractStatus.ACTIVE
                && contract.getStatus() != ContractStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Cannot add services to contract with status: " + contract.getStatus());
        }

        if (serviceRequests == null || serviceRequests.isEmpty()) {
            throw new IllegalArgumentException("Service list cannot be empty");
        }

        for (ContractServiceDTO serviceRequest : serviceRequests) {
            boolean serviceAlreadyExists = contractServiceRepo
                    .existsByContract_ContractIdAndService_ServiceId(contractId, serviceRequest.getServiceId());
            if (serviceAlreadyExists) {
                continue;
            }

            ServiceItem serviceItem = serviceItemRepo.findById(serviceRequest.getServiceId())
                    .orElseThrow(() -> new RuntimeException("Service not found: " + serviceRequest.getServiceId()));

            com.trithienviet.qlchuoiphongtro.entity.ContractService contractService = new com.trithienviet.qlchuoiphongtro.entity.ContractService();
            contractService.setContract(contract);
            contractService.setService(serviceItem);
            contractService.setPriceAtSigning(serviceItem.getPrice());
            contractService.setUnitAtSigning(serviceItem.getUnit());
            contractServiceRepo.save(contractService);
        }
    }

    // ==================== updateService ====================
    @Override
    public void updateService(Integer contractServiceId, ContractServiceDTO updateRequest) {
        com.trithienviet.qlchuoiphongtro.entity.ContractService contractService = contractServiceRepo
                .findById(contractServiceId)
                .orElseThrow(() -> new RuntimeException("Contract service not found: " + contractServiceId));

        ContractStatus contractStatus = contractService.getContract().getStatus();
        if (contractStatus != ContractStatus.ACTIVE && contractStatus != ContractStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Cannot update service of contract with status: " + contractStatus);
        }

        if (updateRequest.getPriceAtSigning() != null) {
            contractService.setPriceAtSigning(updateRequest.getPriceAtSigning());
        }
        if (updateRequest.getUnitAtSigning() != null) {
            contractService.setUnitAtSigning(updateRequest.getUnitAtSigning());
        }

        contractServiceRepo.save(contractService);
    }

    // ==================== deleteService ====================
    @Override
    public void deleteService(Integer contractServiceId) {
        com.trithienviet.qlchuoiphongtro.entity.ContractService contractService = contractServiceRepo
                .findById(contractServiceId)
                .orElseThrow(() -> new RuntimeException("Contract service not found: " + contractServiceId));

        ContractStatus contractStatus = contractService.getContract().getStatus();
        if (contractStatus != ContractStatus.ACTIVE && contractStatus != ContractStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Cannot delete service of contract with status: " + contractStatus);
        }

        contractServiceRepo.delete(contractService);
    }

    // ==================== MAPPERS ====================
    private ContractDTO mapToDTO(Contract contract) {
        List<Long> memberIds = contract.getRoomMembers() == null ? List.of()
                : contract.getRoomMembers().stream()
                        .map(roomMember -> roomMember.getProfile().getProfileId())
                        .collect(Collectors.toList());

        List<ContractServiceDTO> contractServices = contract.getContractServices() == null ? List.of()
                : contract.getContractServices().stream()
                        .map(this::mapToServiceDTO)
                        .collect(Collectors.toList());

        return ContractDTO.builder()
                .contractId(contract.getContractId())
                .roomId(contract.getRoom().getRoomId())
                .roomName(contract.getRoom().getRoomName())
                .rentPrice(contract.getRentPrice())
                .depositAmount(contract.getDepositAmount())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .status(contract.getStatus())
                .billingDay(contract.getBillingDay())
                .representativeId(contract.getRepresentative() != null
                        ? contract.getRepresentative().getProfileId()
                        : null)
                .memberIds(memberIds)
                .contractServices(contractServices)
                .build();
    }

    private ContractServiceDTO mapToServiceDTO(
            com.trithienviet.qlchuoiphongtro.entity.ContractService contractService) {
        return ContractServiceDTO.builder()
                .contractServiceId(contractService.getContractServiceId())
                .contractId(contractService.getContract().getContractId())
                .serviceId(contractService.getService().getServiceId())
                .serviceName(contractService.getService().getServiceName())
                .priceAtSigning(contractService.getPriceAtSigning())
                .unitAtSigning(contractService.getUnitAtSigning())
                .build();
    }

    // ==================== HELPERS ====================
    private void handleRoomStatusChange(Contract contract, ContractStatus oldStatus, ContractStatus newStatus) {
        Room room = contract.getRoom();

        if (oldStatus == ContractStatus.PENDING && newStatus == ContractStatus.ACTIVE) {
            room.setStatus(RoomStatus.OCCUPIED);
        }

        if (oldStatus == ContractStatus.ACTIVE &&
                (newStatus == ContractStatus.TERMINATED || newStatus == ContractStatus.EXPIRED)) {
            room.setStatus(RoomStatus.AVAILABLE);
        }

        roomRepo.save(room);
    }

    private void updateRoomStatusToOccupied(Contract contract) {
        Room room = contract.getRoom();

        if (room.getStatus() != RoomStatus.AVAILABLE) {
            throw new IllegalArgumentException("Room is not available");
        }

        room.setStatus(RoomStatus.OCCUPIED);
        roomRepo.save(room);
    }
}