package com.trithienviet.qlchuoiphongtro.service.impl;

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

    // ========== GET ALL WITH FILTERS & PAGINATION ==========
    @Override
    public PageResponse<RoomDTO> getAllRooms(
            Integer pageNumber,
            Integer pageSize,
            String sortBy,
            String sortOrder,
            Long floorId,
            Long branchId,
            String search) {

        // Create Sort
        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        // Create Pageable
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        // Query based on filters
        Page<Room> page;

        if (search != null && !search.isEmpty()) {
            // Search with filters
            if (floorId != null && branchId != null) {
                page = roomRepo.findBySearchFloorAndBranch(search, floorId, branchId, pageable);
            } else if (floorId != null) {
                page = roomRepo.findBySearchAndFloor(search, floorId, pageable);
            } else if (branchId != null) {
                page = roomRepo.findBySearchAndBranch(search, branchId, pageable);
            } else {
                page = roomRepo.findByRoomNameContainingIgnoreCase(search, pageable);
            }
        } else {
            // No search, just filters
            if (floorId != null && branchId != null) {
                page = roomRepo.findByFloorAndBranch(floorId, branchId, pageable);
            } else if (floorId != null) {
                page = roomRepo.findByFloor_FloorId(floorId, pageable);
            } else if (branchId != null) {
                page = roomRepo.findByFloor_Branch_BranchId(branchId, pageable);
            } else {
                page = roomRepo.findAll(pageable);
            }
        }

        // Map entities to DTOs
        List<RoomDTO> roomDTOs = page.getContent().stream()
                .map(this::mapRoomToDTO)
                .collect(Collectors.toList());

        // Build response
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
        // Create new room entity
        Room room = new Room();
        room.setRoomName(roomDTO.getRoomName());
        room.setPrice(roomDTO.getPrice());
        room.setCurrentPeople(roomDTO.getCurrentPeople() != null ? roomDTO.getCurrentPeople() : 0);
        room.setMaxPeople(roomDTO.getMaxPeople());
        room.setDescription(roomDTO.getDescription());
        room.setStatus(RoomStatus.valueOf(roomDTO.getStatus()));

        // Set floor
        if (roomDTO.getFloorId() != null) {
            Floor floor = floorRepo.findById(roomDTO.getFloorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", roomDTO.getFloorId()));
            room.setFloor(floor);
        }

        // Set amenities if provided
        if (roomDTO.getAmenities() != null && !roomDTO.getAmenities().isEmpty()) {
            Set<Amenity> amenities = roomDTO.getAmenities().stream()
                    .map(dto -> amenityRepo.findById(dto.getAmenityId())
                            .orElseThrow(() -> new ResourceNotFoundException("Amenity", "amenityId", dto.getAmenityId().longValue())))
                    .collect(Collectors.toSet());
            room.setAmenities(amenities);
        }

        // Save room
        Room saved = roomRepo.save(room);

        return mapRoomToDTO(saved);
    }

    // ========== UPDATE ==========
    @Override
    @Transactional
    public RoomDTO updateRoom(Long roomId, RoomDTO roomDTO) {
        // Find room
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));

        // Update fields
        room.setRoomName(roomDTO.getRoomName());
        room.setPrice(roomDTO.getPrice());
        room.setCurrentPeople(roomDTO.getCurrentPeople());
        room.setMaxPeople(roomDTO.getMaxPeople());
        room.setDescription(roomDTO.getDescription());
        room.setStatus(RoomStatus.valueOf(roomDTO.getStatus()));

        // Update floor
        if (roomDTO.getFloorId() != null) {
            Floor floor = floorRepo.findById(roomDTO.getFloorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", roomDTO.getFloorId()));
            room.setFloor(floor);
        }

        // Update amenities
        if (roomDTO.getAmenities() != null) {
            Set<Amenity> amenities = roomDTO.getAmenities().stream()
                    .map(dto -> amenityRepo.findById(dto.getAmenityId())
                            .orElseThrow(() -> new ResourceNotFoundException("Amenity", "amenityId", dto.getAmenityId().longValue())))
                    .collect(Collectors.toSet());
            room.setAmenities(amenities);
        }

        // Save
        Room updated = roomRepo.save(room);

        return mapRoomToDTO(updated);
    }

    // ========== DELETE ==========
    @Override
    @Transactional
    public String deleteRoom(Long roomId) {
        // Find room
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));

        // Delete
        roomRepo.delete(room);

        return "Xóa phòng thành công với id: " + roomId;
    }

    // ========== HELPER: Map Room Entity to RoomDTO ==========
    private RoomDTO mapRoomToDTO(Room room) {
        RoomDTO dto = new RoomDTO();
        dto.setRoomId(room.getRoomId());
        dto.setRoomName(room.getRoomName());
        dto.setPrice(room.getPrice());
        dto.setCurrentPeople(room.getCurrentPeople());
        dto.setMaxPeople(room.getMaxPeople());
        dto.setDescription(room.getDescription());
        dto.setStatus(room.getStatus() != null ? room.getStatus().toString() : null);

        // Set floorId
        if (room.getFloor() != null) {
            dto.setFloorId(room.getFloor().getFloorId().longValue());
        }

        // Map roomMedia
        if (room.getRoomMedia() != null && !room.getRoomMedia().isEmpty()) {
            List<RoomMediaDTO> mediaDTOs = room.getRoomMedia().stream()
                    .map(media -> {
                        RoomMediaDTO mediaDTO = modelMapper.map(media, RoomMediaDTO.class);
                        if (media.getRoom() != null) {
                            mediaDTO.setRoomId(media.getRoom().getRoomId().longValue());
                        }
                        return mediaDTO;
                    })
                    .collect(Collectors.toList());
            dto.setRoomMedia(mediaDTOs);
        }

        // Map amenities
        if (room.getAmenities() != null && !room.getAmenities().isEmpty()) {
            List<AmenityDTO> amenityDTOs = room.getAmenities().stream()
                    .map(amenity -> modelMapper.map(amenity, AmenityDTO.class))
                    .collect(Collectors.toList());
            dto.setAmenities(amenityDTOs);
        }

        //delete // Map assets

        return dto;
    }
}