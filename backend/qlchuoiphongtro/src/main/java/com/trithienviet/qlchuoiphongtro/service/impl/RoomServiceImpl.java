package com.trithienviet.qlchuoiphongtro.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trithienviet.qlchuoiphongtro.entity.Amenity;
import com.trithienviet.qlchuoiphongtro.entity.Deposit;
import com.trithienviet.qlchuoiphongtro.entity.Floor;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.RoomMedia;
import com.trithienviet.qlchuoiphongtro.entity.RoomStatus;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.AmenityDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomDTO;
import com.trithienviet.qlchuoiphongtro.payloads.RoomMediaDTO;
import com.trithienviet.qlchuoiphongtro.repo.AmenityRepo;
import com.trithienviet.qlchuoiphongtro.repo.DepositRepo;
import com.trithienviet.qlchuoiphongtro.repo.FloorRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.service.RoomService;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    private RoomRepo roomRepo;
    @Autowired
    private FloorRepo floorRepo;
    @Autowired
    private AmenityRepo amenityRepo;
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private DepositRepo depositRepo;

    @Override
    public PageResponse<RoomDTO> getAllRooms(
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder,
            Long floorId, Long branchId, String search,
            String status, Integer maxPeople) {

        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        RoomStatus statusFilter = null;
        if (status != null && !status.isBlank()) {
            try {
                statusFilter = RoomStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }

        Page<Room> page = roomRepo.findRoomsWithFilters(
                search,
                floorId,
                branchId,
                statusFilter,
                maxPeople,
                pageable);

        List<RoomDTO> roomDTOs = page.getContent().stream()
                .map(this::mapRoomToDTO)
                .collect(Collectors.toList());

        PageResponse<RoomDTO> response = new PageResponse<>();
        response.setContent(roomDTOs);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLastPage(page.isLast());
        return response;
    }

    // ========== GET BY ID ==========
    @Override
    public RoomDTO getRoomById(Long roomId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));
        return mapRoomToDTO(room);
    }

    // ========== CREATE ==========
    @Override
    @Transactional
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = new Room();
        room.setRoomName(roomDTO.getRoomName());
        room.setPrice(roomDTO.getPrice());
        room.setCurrentPeople(0);
        room.setMaxPeople(roomDTO.getMaxPeople());
        room.setDescription(roomDTO.getDescription());
        room.setStatus(RoomStatus.valueOf(
                roomDTO.getStatus() != null ? roomDTO.getStatus() : "AVAILABLE"));

        if (roomDTO.getFloorId() != null) {
            Floor floor = floorRepo.findById(roomDTO.getFloorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", roomDTO.getFloorId()));
            room.setFloor(floor);
        }

        if (roomDTO.getAmenities() != null && !roomDTO.getAmenities().isEmpty()) {
            Set<Amenity> amenities = roomDTO.getAmenities().stream()
                    .map(dto -> amenityRepo.findById(dto.getAmenityId())
                            .orElseThrow(() -> new ResourceNotFoundException("Amenity", "amenityId",
                                    dto.getAmenityId().longValue())))
                    .collect(Collectors.toSet());
            room.setAmenities(amenities);
        }

        Room saved = roomRepo.save(room);

        if (roomDTO.getDepositAmount() != null
                && roomDTO.getDepositAmount().compareTo(BigDecimal.ZERO) > 0) {
            Deposit deposit = new Deposit();
            deposit.setRoom(saved);
            deposit.setAmount(roomDTO.getDepositAmount());
            deposit.setStatus("PENDING");
            depositRepo.save(deposit);
        }

        return mapRoomToDTO(saved);
    }

    // ========== UPDATE ==========
    @Override
    @Transactional
    public RoomDTO updateRoom(Long roomId, RoomDTO roomDTO) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));

        room.setRoomName(roomDTO.getRoomName());
        room.setPrice(roomDTO.getPrice());
        room.setMaxPeople(roomDTO.getMaxPeople());
        room.setDescription(roomDTO.getDescription());
        room.setStatus(RoomStatus.valueOf(roomDTO.getStatus()));

        if (roomDTO.getFloorId() != null) {
            Floor floor = floorRepo.findById(roomDTO.getFloorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", roomDTO.getFloorId()));
            room.setFloor(floor);
        }

        if (roomDTO.getAmenities() != null) {
            Set<Amenity> amenities = roomDTO.getAmenities().stream()
                    .map(dto -> amenityRepo.findById(dto.getAmenityId())
                            .orElseThrow(() -> new ResourceNotFoundException("Amenity", "amenityId",
                                    dto.getAmenityId().longValue())))
                    .collect(Collectors.toSet());
            room.setAmenities(amenities);
        }

        Room updated = roomRepo.save(room);

        if (roomDTO.getDepositAmount() != null) {
            Deposit deposit = depositRepo.findByRoom_RoomId(roomId).orElseGet(() -> {
                Deposit d = new Deposit();
                d.setRoom(updated);
                d.setStatus("BOOKED");
                return d;
            });
            deposit.setAmount(roomDTO.getDepositAmount());
            depositRepo.save(deposit);
        }

        return mapRoomToDTO(updated);
    }

    // ========== DELETE ==========
    @Override
    @Transactional
    public String deleteRoom(Long roomId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));
        depositRepo.findByRoom_RoomId(roomId).ifPresent(depositRepo::delete);
        roomRepo.delete(room);
        return "Xóa phòng thành công với id: " + roomId;
    }

    // ========== HELPER ==========
    private RoomDTO mapRoomToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setRoomId(room.getRoomId());
        dto.setRoomName(room.getRoomName());
        dto.setPrice(room.getPrice());
        dto.setCurrentPeople(room.getCurrentPeople());
        dto.setMaxPeople(room.getMaxPeople());
        dto.setDescription(room.getDescription());
        dto.setStatus(room.getStatus() != null ? room.getStatus().toString() : null);

        if (room.getFloor() != null)
            dto.setFloorId(room.getFloor().getFloorId().longValue());

        if (room.getRoomMedia() != null && !room.getRoomMedia().isEmpty()) {
            List<RoomMediaDTO> mediaDTOs = room.getRoomMedia().stream()
                    .map(media -> {
                        RoomMediaDTO mediaDTO = modelMapper.map(media, RoomMediaDTO.class);
                        if (media.getRoom() != null)
                            mediaDTO.setRoomId(media.getRoom().getRoomId().longValue());
                        return mediaDTO;
                    }).collect(Collectors.toList());
            dto.setRoomMedia(mediaDTOs);
        }

        if (room.getAmenities() != null && !room.getAmenities().isEmpty()) {
            List<AmenityDTO> amenityDTOs = room.getAmenities().stream()
                    .map(a -> modelMapper.map(a, AmenityDTO.class))
                    .collect(Collectors.toList());
            dto.setAmenities(amenityDTOs);
        }

        depositRepo.findByRoom_RoomId(room.getRoomId()).ifPresent(deposit -> {
            dto.setDepositAmount(deposit.getAmount());
            dto.setDepositStatus(deposit.getStatus());
        });

        return dto;
    }
}