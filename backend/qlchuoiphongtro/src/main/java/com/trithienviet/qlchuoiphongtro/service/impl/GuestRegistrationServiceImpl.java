package com.trithienviet.qlchuoiphongtro.service.impl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.RegistrationStatus;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.RoomMember;
import com.trithienviet.qlchuoiphongtro.entity.RoomMemberType;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.entity.Vehicle;
import com.trithienviet.qlchuoiphongtro.exceptions.APIException;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.GuestRegistrationRequestDTO;
import com.trithienviet.qlchuoiphongtro.payloads.GuestRegistrationResponseDTO;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleDTO;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleRegisterDTO;
import com.trithienviet.qlchuoiphongtro.repo.ContractRepo;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomMemberRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.repo.VehicleRepo;
import com.trithienviet.qlchuoiphongtro.service.FileService;
import com.trithienviet.qlchuoiphongtro.service.GuestRegistrationService;
import com.trithienviet.qlchuoiphongtro.service.NotificationService;

import jakarta.transaction.Transactional;

@Service
public class GuestRegistrationServiceImpl implements GuestRegistrationService {

    @Autowired
    private RoomMemberRepo roomMemberRepo;

    @Autowired
    private ProfileRepo profileRepo;

    @Autowired
    private VehicleRepo vehicleRepo;

    @Autowired
    private ContractRepo contractRepo;

    @Autowired
    private RoomRepo roomRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Autowired
    private FileService fileService;

    @Autowired
    private NotificationService notificationService;

    @Value("${path.images.identification}")
    private String identificationPath;

    @Override
    @Transactional
    public GuestRegistrationResponseDTO registerGuest(GuestRegistrationRequestDTO request, Long userId)
            throws IOException {

        // 1. Lấy user và kiểm tra là TENANT
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        if (!"TENANT".equals(user.getRole().name())) {
            throw new APIException("Chỉ khách thuê mới có thể đăng ký người thân");
        }
        Long roomId = roomMemberRepo.findActiveRoomIdByProfileId(user.getProfile().getProfileId())
                .orElseThrow(() -> new APIException("Bạn chưa có phòng nào đang ở"));
        // 2. Lấy phòng và kiểm tra tồn tại
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));

        // 3. Lấy contract ACTIVE của user ở phòng này  
        List<Contract> contracts = contractRepo.findByRoom_RoomIdAndIsDeletedFalse(roomId);
        Contract activeContract = contracts.stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE
                        && c.getRepresentative().getProfileId().equals(user.getProfile().getProfileId()))
                .findFirst()
                .orElseThrow(() -> new APIException("Bạn không có hợp đồng ACTIVE ở phòng này"));

        // 4. Tạo hoặc lấy Profile cho người thân
        Profile guestProfile;
        if (request.getProfileId() != null) {
            guestProfile = profileRepo.findById(request.getProfileId())
                    .orElseThrow(() -> new ResourceNotFoundException("Profile", "profileId", request.getProfileId()));
        } else {
            guestProfile = new Profile();
            guestProfile.setFullName(request.getFullName());
            guestProfile.setPhone(request.getPhone());
            guestProfile.setEmail(request.getEmail());
            guestProfile.setIdentityNumber(request.getIdentityNumber());
            guestProfile.setAddress(request.getAddress());
            guestProfile.setIdIssueDate(request.getIdIssueDate());
            guestProfile.setIdExpirationDate(request.getIdExpirationDate());
            guestProfile.setIdIssuePlace(request.getIdIssuePlace());
            guestProfile.setRelationship(request.getRelationship());
            guestProfile.setIsActive(true);
            guestProfile = profileRepo.save(guestProfile);
        }

        // 5. Kiểm tra không đăng ký 2 lần
        if (roomMemberRepo.existsActiveRegistration(guestProfile.getProfileId(), roomId)) {
            throw new APIException("Người thân này đã đăng ký ở phòng này rồi");
        }

        // 6. Tạo RoomMember (đơn đăng ký)
        RoomMember roomMember = new RoomMember();
        roomMember.setProfile(guestProfile);
        roomMember.setContract(activeContract);
        roomMember.setType(RoomMemberType.valueOf(request.getMemberType()));
        roomMember.setRelationshipType(request.getRelationship());
        roomMember.setRegistrationDate(LocalDateTime.now());
        roomMember.setRegistrationStatus(RegistrationStatus.PENDING);
        roomMember.setIsStaying(RoomMemberType.VISITING.toString().equals(request.getMemberType()) ? false : true);
        roomMember = roomMemberRepo.save(roomMember);

        // 7. Đăng ký xe (nếu có)
        if (request.getVehicles() != null && !request.getVehicles().isEmpty()) {
            for (VehicleRegisterDTO vehicleDto : request.getVehicles()) {
                // Kiểm tra biển số không trùng
                if (vehicleRepo.existsByLicensePlateIgnoreCase(vehicleDto.getLicensePlate())) {
                    throw new APIException("Biển số xe " + vehicleDto.getLicensePlate() + " đã tồn tại");
                }

                Vehicle vehicle = new Vehicle();
                vehicle.setLicensePlate(vehicleDto.getLicensePlate().toUpperCase());
                vehicle.setBrand(vehicleDto.getBrand());
                vehicle.setColor(vehicleDto.getColor());
                vehicle.setRoom(room);
                vehicle.setOwner(guestProfile);
                vehicle.setRegisteredByMember(roomMember);
                vehicle.setMemberRelation(request.getRelationship());
                vehicle.setStatus(true); // Active luôn khi đăng ký
                vehicle.setRegisteredAt(LocalDateTime.now());
                vehicleRepo.save(vehicle);
            }
        }

        // 8. Gửi thông báo cho admin/quản lý
        notificationService.notifyAdminGuestRegistration(
                activeContract.getRoom().getRoomName(),
                guestProfile.getFullName(),
                user.getProfile().getFullName()
        );

        return mapToResponseDTO(roomMember);
    }

    @Override
    @Transactional
    public GuestRegistrationResponseDTO uploadGuestIdFrontImage(Integer memberId, MultipartFile image)
            throws IOException {

        RoomMember roomMember = roomMemberRepo.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMember", "memberId", memberId));

        Profile profile = roomMember.getProfile();
        String fileName = fileService.uploadImage(identificationPath, image);
        profile.setIdFrontImage(fileName);
        profileRepo.save(profile);

        return mapToResponseDTO(roomMember);
    }

    @Override
    @Transactional
    public GuestRegistrationResponseDTO uploadGuestIdBackImage(Integer memberId, MultipartFile image)
            throws IOException {

        RoomMember roomMember = roomMemberRepo.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMember", "memberId", memberId));

        Profile profile = roomMember.getProfile();
        String fileName = fileService.uploadImage(identificationPath, image);
        profile.setIdBackImage(fileName);
        profileRepo.save(profile);

        return mapToResponseDTO(roomMember);
    }

    @Override
    @Transactional
    public GuestRegistrationResponseDTO approveRegistration(Integer memberId, Long adminId) {

        RoomMember roomMember = roomMemberRepo.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMember", "memberId", memberId));

        Profile admin = profileRepo.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "profileId", adminId));

        // Cập nhật trạng thái
        roomMember.setRegistrationStatus(RegistrationStatus.APPROVED);
        roomMember.setApprovedBy(admin);
        roomMember.setApprovedAt(LocalDateTime.now());
        roomMember = roomMemberRepo.save(roomMember);

        // Kích hoạt các xe đã đăng ký
        List<Vehicle> vehicles = vehicleRepo.findByRegisteredByMember(memberId);
        for (Vehicle vehicle : vehicles) {
            vehicle.setStatus(true);
            vehicleRepo.save(vehicle);
        }

        // Gửi thông báo cho tenant
        notificationService.notifyGuestApproved(
                roomMember.getProfile().getFullName(),
                roomMember.getContract().getRoom().getRoomName()
        );

        return mapToResponseDTO(roomMember);
    }

    @Override
    @Transactional
    public GuestRegistrationResponseDTO rejectRegistration(Integer memberId, String rejectionReason, Long adminId) {

        RoomMember roomMember = roomMemberRepo.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMember", "memberId", memberId));

        Profile admin = profileRepo.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "profileId", adminId));

        // Cập nhật trạng thái
        roomMember.setRegistrationStatus(RegistrationStatus.REJECTED);
        roomMember.setApprovedBy(admin);
        roomMember.setApprovedAt(LocalDateTime.now());
        roomMember.setRejectionReason(rejectionReason);
        roomMember = roomMemberRepo.save(roomMember);

        // Xóa các xe đã đăng ký
        List<Vehicle> vehicles = vehicleRepo.findByRegisteredByMember(memberId);
        for (Vehicle vehicle : vehicles) {
            vehicle.setStatus(false);
            vehicleRepo.save(vehicle);
        }

        // Gửi thông báo cho tenant
        notificationService.notifyGuestRejected(
                roomMember.getProfile().getFullName(),
                roomMember.getContract().getRoom().getRoomName(),
                rejectionReason
        );

        return mapToResponseDTO(roomMember);
    }

    @Override
    public Page<GuestRegistrationResponseDTO> getPendingRegistrations(Pageable pageable) {

        Page<RoomMember> pendingMembers = roomMemberRepo.findPendingRegistrations(pageable);

        return pendingMembers.map(this::mapToResponseDTO);
    }

    @Override
    public List<GuestRegistrationResponseDTO> getGuestsByRoom(Long roomId) {

        List<RoomMember> guests = roomMemberRepo.findGuestsByRoomId(roomId);

        return guests.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GuestRegistrationResponseDTO> getApprovedGuestsByRoom(Long roomId) {

        List<RoomMember> guests = roomMemberRepo.findByRoomIdAndRegistrationStatus(
                roomId,
                RegistrationStatus.APPROVED
        );

        return guests.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GuestRegistrationResponseDTO getRegistrationDetail(Integer memberId) {

        RoomMember roomMember = roomMemberRepo.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMember", "memberId", memberId));

        return mapToResponseDTO(roomMember);
    }

    @Override
    @Transactional
    public GuestRegistrationResponseDTO cancelRegistration(Integer memberId, Long userId) {

        RoomMember roomMember = roomMemberRepo.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMember", "memberId", memberId));

        // Kiểm tra có quyền hủy không
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        boolean isOwner = roomMember.getContract().getRepresentative().getProfileId()
                .equals(user.getProfile().getProfileId());
        boolean isAdmin = "ADMIN".equals(user.getRole().name()) || "MANAGER".equals(user.getRole().name());

        if (!isOwner && !isAdmin) {
            throw new APIException("Bạn không có quyền hủy đơn này");
        }

        // Cập nhật trạng thái
        roomMember.setRegistrationStatus(RegistrationStatus.CANCELLED);
        roomMember = roomMemberRepo.save(roomMember);

        // Xóa các xe
        List<Vehicle> vehicles = vehicleRepo.findByRegisteredByMember(memberId);
        for (Vehicle vehicle : vehicles) {
            vehicleRepo.delete(vehicle);
        }

        return mapToResponseDTO(roomMember);
    }

    // Helper method
    private GuestRegistrationResponseDTO mapToResponseDTO(RoomMember roomMember) {
        Profile profile = roomMember.getProfile();
        List<Vehicle> vehicles = vehicleRepo.findByRegisteredByMember(roomMember.getMemberId());

        List<VehicleDTO> vehicleDTOs = vehicles.stream()
                .map(v -> VehicleDTO.builder()
                        .brand(v.getBrand())
                        .licensePlate(v.getLicensePlate())
                        .build())
                .collect(Collectors.toList());

        String approvedByName = roomMember.getApprovedBy() != null
                ? roomMember.getApprovedBy().getFullName()
                : null;

        String roomName = null;
        String branchName = null;
        if (roomMember.getContract() != null && roomMember.getContract().getRoom() != null) {
            roomName = roomMember.getContract().getRoom().getRoomName();
            if (roomMember.getContract().getRoom().getFloor() != null &&
                roomMember.getContract().getRoom().getFloor().getBranch() != null) {
                branchName = roomMember.getContract().getRoom().getFloor().getBranch().getBranchName();
            }
        }

        String idFrontImage = profile != null ? profile.getIdFrontImage() : null;
        String idBackImage = profile != null ? profile.getIdBackImage() : null;

        return GuestRegistrationResponseDTO.builder()
                .memberId(roomMember.getMemberId())
                .profileId(profile.getProfileId())
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .email(profile.getEmail())
                .identityNumber(profile.getIdentityNumber())
                .address(profile.getAddress())
                .memberType(roomMember.getType().name())
                .relationship(roomMember.getRelationshipType())
                .status(roomMember.getRegistrationStatus().name())
                .createdAt(roomMember.getRegistrationDate())
                .approvedAt(roomMember.getApprovedAt())
                .approvedByName(approvedByName)
                .rejectionReason(roomMember.getRejectionReason())
                .vehicles(vehicleDTOs)
                .roomName(roomName)
                .branchName(branchName)
                .idFrontImage(idFrontImage)
                .idBackImage(idBackImage)
                .build();
    }
}
