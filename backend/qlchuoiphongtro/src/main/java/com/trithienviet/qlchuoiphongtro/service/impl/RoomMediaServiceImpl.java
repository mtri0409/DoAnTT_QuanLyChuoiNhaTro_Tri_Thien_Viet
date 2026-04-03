package com.trithienviet.qlchuoiphongtro.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.RoomMedia;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomMediaDTO;
import com.trithienviet.qlchuoiphongtro.repo.RoomMediaRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.service.RoomMediaService;

@Service
public class RoomMediaServiceImpl implements RoomMediaService {

    @Autowired
    private RoomMediaRepo roomMediaRepo;

    @Autowired
    private RoomRepo roomRepo;

    @Autowired
    private ModelMapper modelMapper;

    // ========== GET ALL WITH PAGINATION ==========
    
    @Override
    public PageResponse<RoomMediaDTO> getAllRoomMedias(
            Integer pageNumber,
            Integer pageSize,
            String sortBy,
            String sortOrder) {

        // ← Tạo Sort
        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        // ← Tạo Pageable (0-indexed)
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        // ← Query database
        Page<RoomMedia> page = roomMediaRepo.findAll(pageable);

        // ← Map sang DTO
        List<RoomMediaDTO> dtos = page.getContent().stream()
                .map(media -> {
                    RoomMediaDTO dto = modelMapper.map(media, RoomMediaDTO.class);
                    if (media.getRoom() != null) {
                        dto.setRoomId(media.getRoom().getRoomId());
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        // ← Build response
        PageResponse<RoomMediaDTO> response = new PageResponse<>();
        response.setContent(dtos);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLastPage(page.isLast());

        return response;
    }

    // ========== GET BY ID ==========
    @Override
    public RoomMediaDTO getRoomMediaById(Integer mediaId) {
        RoomMedia media = roomMediaRepo.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMedia", "mediaId", mediaId.longValue()));

        RoomMediaDTO dto = modelMapper.map(media, RoomMediaDTO.class);
        if (media.getRoom() != null) {
            dto.setRoomId(media.getRoom().getRoomId());
        }
        return dto;
    }

    // ========== GET BY ROOM ID ==========
    @Override
    public List<RoomMediaDTO> getMediaByRoomId(Integer roomId) {
        // Verify room exists
        Room room = roomRepo.findById(roomId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId.longValue()));

        // Get all media for this room
        List<RoomMedia> medias = roomMediaRepo.findByRoom_RoomId(roomId);

        return medias.stream()
                .map(media -> {
                    RoomMediaDTO dto = modelMapper.map(media, RoomMediaDTO.class);
                    dto.setRoomId(roomId.longValue());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ========== CREATE ==========
    @Override
    @Transactional
    public RoomMediaDTO createRoomMedia(RoomMediaDTO roomMediaDTO) {
        // ← Map DTO → Entity
        RoomMedia media = modelMapper.map(roomMediaDTO, RoomMedia.class);

        // ← Set Room from roomId
        if (roomMediaDTO.getRoomId() != null) {
            Room room = roomRepo.findById(roomMediaDTO.getRoomId().longValue())
                    .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomMediaDTO.getRoomId()));
            media.setRoom(room);
        }

        // ← Save
        RoomMedia saved = roomMediaRepo.save(media);

        // ← Map lại Entity → DTO để return
        RoomMediaDTO dto = modelMapper.map(saved, RoomMediaDTO.class);
        if (saved.getRoom() != null) {
            dto.setRoomId(saved.getRoom().getRoomId());
        }
        return dto;
    }

    // ========== UPDATE ==========
    @Override
    @Transactional
    public RoomMediaDTO updateRoomMedia(Integer mediaId, RoomMediaDTO roomMediaDTO) {
        // ← Find entity
        RoomMedia media = roomMediaRepo.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMedia", "mediaId", mediaId.longValue()));

        // ← Update fields
        media.setUrl(roomMediaDTO.getUrl());
        media.setMediaType(roomMediaDTO.getMediaType());

        // ← Save
        RoomMedia updated = roomMediaRepo.save(media);

        // ← Return DTO
        RoomMediaDTO dto = modelMapper.map(updated, RoomMediaDTO.class);
        if (updated.getRoom() != null) {
            dto.setRoomId(updated.getRoom().getRoomId());
        }
        return dto;
    }

    // ========== DELETE ==========
    @Override
    @Transactional
    public String deleteRoomMedia(Integer mediaId) {
        // ← Find entity
        RoomMedia media = roomMediaRepo.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMedia", "mediaId", mediaId.longValue()));

        // ← Delete
        roomMediaRepo.delete(media);

        // ← Return message
        return "Xóa media phòng thành công với id: " + mediaId;
    }
}