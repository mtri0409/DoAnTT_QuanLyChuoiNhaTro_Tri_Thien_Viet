package com.trithienviet.qlchuoiphongtro.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Floor;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.RoomStatus;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomDTO;
import com.trithienviet.qlchuoiphongtro.repo.FloorRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.service.RoomService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import jakarta.transaction.Transactional;

@Service
public class RoomServiceImpl implements RoomService {

    @Autowired
    private RoomRepo roomRepo;

    @Autowired
    private FloorRepo floorRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public RoomDTO createRoom(RoomDTO roomDTO) {
        Room room = modelMapper.map(roomDTO, Room.class);

        // set floor
        Floor floor = floorRepo.findById((long) roomDTO.getFloorId().intValue())
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", roomDTO.getFloorId()));
        room.setFloor(floor);

        // set status enum
        room.setStatus(RoomStatus.valueOf(roomDTO.getStatus()));

        Room saved = roomRepo.save(room);
        RoomDTO resultDTO = modelMapper.map(saved, RoomDTO.class);
        resultDTO.setFloorId(saved.getFloor().getFloorId().longValue());
        resultDTO.setStatus(saved.getStatus().name());

        return resultDTO;
    }

    @Override
    public RoomDTO updateRoom(Long roomId, RoomDTO roomDTO) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));

        room.setRoomName(roomDTO.getRoomName());
        room.setPrice(roomDTO.getPrice());
        room.setDescription(roomDTO.getDescription());
        room.setCurrentPeople(roomDTO.getCurrentPeople());
        room.setMaxPeople(roomDTO.getMaxPeople());
        room.setStatus(RoomStatus.valueOf(roomDTO.getStatus()));

        // update floor if changed
        if (roomDTO.getFloorId() != null && 
            !roomDTO.getFloorId().equals(room.getFloor().getFloorId().longValue())) {

            Floor floor = floorRepo.findById((long) roomDTO.getFloorId().intValue())
                    .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", roomDTO.getFloorId()));
            room.setFloor(floor);
        }

        Room updated = roomRepo.save(room);
        RoomDTO resultDTO = modelMapper.map(updated, RoomDTO.class);
        resultDTO.setFloorId(updated.getFloor().getFloorId().longValue());
        resultDTO.setStatus(updated.getStatus().name());

        return resultDTO;
    }

    @Override
    public RoomDTO getRoomById(Long roomId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));

        RoomDTO dto = modelMapper.map(room, RoomDTO.class);
        dto.setFloorId(room.getFloor().getFloorId().longValue());
        dto.setStatus(room.getStatus().name());
        return dto;
    }

    @Override
public PageResponse<RoomDTO> getAllRooms(
        Integer pageNumber,
        Integer pageSize,
        String sortBy,
        String sortOrder,
        Long floorId,
        Long branchId,
        String search
) {
    Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
    Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

    // repo phải viết custom query hoặc dùng Specification / QueryDSL để filter
    Page<Room> roomsPage = roomRepo.findAllWithFilter(floorId, branchId, search, pageable);

    List<RoomDTO> roomDTOs = roomsPage.getContent().stream().map(room -> {
        RoomDTO dto = modelMapper.map(room, RoomDTO.class);
        dto.setFloorId(room.getFloor().getFloorId().longValue());
        dto.setStatus(room.getStatus().name());
        return dto;
    }).collect(Collectors.toList());

    PageResponse<RoomDTO> response = new PageResponse<>();
    response.setContent(roomDTOs);
    response.setPageNumber(roomsPage.getNumber());
    response.setPageSize(roomsPage.getSize());
    response.setTotalElements(roomsPage.getTotalElements());
    response.setTotalPages(roomsPage.getTotalPages());
    response.setLastPage(roomsPage.isLast());

    return response;
}

    @Transactional
    @Override
    public String deleteRoom(Long roomId) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));
        roomRepo.delete(room);
        return "Xóa phòng thành công: " + roomId;
    }
}