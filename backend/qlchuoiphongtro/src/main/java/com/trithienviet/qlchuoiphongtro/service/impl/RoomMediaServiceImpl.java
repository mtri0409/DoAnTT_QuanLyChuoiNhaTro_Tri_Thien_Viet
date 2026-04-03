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

import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;

@Service
public class RoomMediaServiceImpl implements RoomMediaService {

    @Autowired
    private RoomMediaRepo roomMediaRepo;

    @Autowired
    private RoomRepo roomRepo;

    @Autowired
    private ModelMapper modelMapper;

    // ← Thư mục lưu ảnh trên máy
    @Value("${file.upload-dir:uploads/room-images}")
    private String uploadDir;

    // ========== HELPER: Lưu file vào folder ==========
    private String saveFile(MultipartFile file) {
        try {
            // Tạo folder nếu chưa có
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Tạo tên file unique
            String originalName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileName = System.currentTimeMillis() + "_" + originalName;

            // Lưu file
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Trả về URL path
            // → http://localhost:8080/images/1718000001_photo.jpg
            return "/images/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Lỗi lưu file: " + e.getMessage());
        }
    }

    // ========== HELPER: Xóa file cũ khỏi folder ==========
    private void deleteFile(String url) {
        if (url == null || !url.startsWith("/images/")) return;
        try {
            String fileName = url.replace("/images/", "");
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Không thể xóa file: " + e.getMessage());
        }
    }

    // ========== GET ALL WITH PAGINATION (GIỮA NGUYÊN) ==========
    @Override
    public PageResponse<RoomMediaDTO> getAllRoomMedias(
            Integer pageNumber,
            Integer pageSize,
            String sortBy,
            String sortOrder) {

        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<RoomMedia> page = roomMediaRepo.findAll(pageable);

        List<RoomMediaDTO> dtos = page.getContent().stream()
                .map(media -> {
                    RoomMediaDTO dto = modelMapper.map(media, RoomMediaDTO.class);
                    if (media.getRoom() != null) {
                        dto.setRoomId(media.getRoom().getRoomId());
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        PageResponse<RoomMediaDTO> response = new PageResponse<>();
        response.setContent(dtos);
        response.setPageNumber(page.getNumber());
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLastPage(page.isLast());

        return response;
    }

    // ========== GET BY ID (GIỮA NGUYÊN) ==========
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

    // ========== GET BY ROOM ID (GIỮA NGUYÊN) ==========
    @Override
    public List<RoomMediaDTO> getMediaByRoomId(Integer roomId) {
        Room room = roomRepo.findById(roomId.longValue())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId.longValue()));

        List<RoomMedia> medias = roomMediaRepo.findByRoom_RoomId(roomId);

        return medias.stream()
                .map(media -> {
                    RoomMediaDTO dto = modelMapper.map(media, RoomMediaDTO.class);
                    dto.setRoomId(roomId.longValue());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    // ========== CREATE - SỬA ĐỂ NHẬN FILE ==========
    @Override
    @Transactional
    public RoomMediaDTO createRoomMedia(MultipartFile file, Long roomId, boolean isThumbnail) {
        // ← Lưu file vào folder, nhận lại URL
        String fileUrl = saveFile(file);

        // ← Tìm Room
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));

        // ← Tạo entity
        RoomMedia media = new RoomMedia();
        media.setUrl(fileUrl);                              // "/images/1718000001_photo.jpg"
        media.setMediaType(file.getContentType());          // "image/jpeg"
        media.setThumbnail(isThumbnail);
        media.setRoom(room);

        // ← Lưu DB
        RoomMedia saved = roomMediaRepo.save(media);

        // ← Map sang DTO trả về
        RoomMediaDTO dto = modelMapper.map(saved, RoomMediaDTO.class);
        dto.setRoomId(saved.getRoom().getRoomId());
        return dto;
    }

    // ========== UPDATE - SỬA ĐỂ NHẬN FILE MỚI ==========
    @Override
    @Transactional
    public RoomMediaDTO updateRoomMedia(Integer mediaId, MultipartFile file) {
        // ← Tìm entity cũ
        RoomMedia media = roomMediaRepo.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMedia", "mediaId", mediaId.longValue()));

        // ← Xóa file cũ khỏi folder
        deleteFile(media.getUrl());

        // ← Lưu file mới
        String newUrl = saveFile(file);
        media.setUrl(newUrl);
        media.setMediaType(file.getContentType());

        // ← Save
        RoomMedia updated = roomMediaRepo.save(media);

        RoomMediaDTO dto = modelMapper.map(updated, RoomMediaDTO.class);
        if (updated.getRoom() != null) {
            dto.setRoomId(updated.getRoom().getRoomId());
        }
        return dto;
    }

    // ========== DELETE - THÊM XÓA FILE ==========
    @Override
    @Transactional
    public String deleteRoomMedia(Integer mediaId) {
        RoomMedia media = roomMediaRepo.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMedia", "mediaId", mediaId.longValue()));

        // ← Xóa file khỏi folder
        deleteFile(media.getUrl());

        // ← Xóa record DB
        roomMediaRepo.delete(media);

        return "Xóa media phòng thành công với id: " + mediaId;
    }
}