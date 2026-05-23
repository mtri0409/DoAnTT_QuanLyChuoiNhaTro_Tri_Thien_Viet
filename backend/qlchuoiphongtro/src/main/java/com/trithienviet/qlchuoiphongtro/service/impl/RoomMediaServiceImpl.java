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
import com.trithienviet.qlchuoiphongtro.service.FileService;
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

    // ← THÊM: inject FileService thay vì tự xử lý file
    @Autowired
    private FileService fileService;

    // ← Thư mục lưu ảnh — dùng chung với FileService
    @Value("${path.images.room}")
    private String uploadDir;

    // ========== GET ALL WITH PAGINATION ==========
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

    // ========== CREATE ==========
    @Override
@Transactional
public RoomMediaDTO createRoomMedia(MultipartFile file, Long roomId, boolean isThumbnail) {
    try {
        System.out.println("=== START createRoomMedia ===");
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("RoomId: " + roomId);
        System.out.println("Upload dir: " + uploadDir); // ← xem path thật

        String fileName = fileService.uploadImage(uploadDir, file);
        System.out.println("File saved: " + fileName); // ← nếu không in ra đây thì lỗi ở FileService

        String fileUrl = "/images/" + fileName;
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));
        System.out.println("Room found: " + room.getRoomId()); // ← nếu không in ra đây thì lỗi ở DB

        RoomMedia media = new RoomMedia();
        media.setUrl(fileUrl);
        media.setMediaType(file.getContentType());
        media.setThumbnail(isThumbnail);
        media.setRoom(room);

        RoomMedia saved = roomMediaRepo.save(media);
        System.out.println("=== DONE, mediaId: " + saved.getMediaId() + " ===");

        RoomMediaDTO dto = modelMapper.map(saved, RoomMediaDTO.class);
        dto.setRoomId(saved.getRoom().getRoomId());
        return dto;

    } catch (IOException e) {
        System.out.println("IOException: " + e.getMessage());
        throw new RuntimeException("Lỗi khi upload file: " + e.getMessage());
    } catch (Exception e) {
        System.out.println("Exception: " + e.getClass().getName() + " - " + e.getMessage());
        throw e;
    }
}

    // ========== UPDATE ==========
    @Override
    @Transactional
    public RoomMediaDTO updateRoomMedia(Integer mediaId, MultipartFile file) {
        try {
            // ← Tìm entity cũ
            RoomMedia media = roomMediaRepo.findById(mediaId)
                    .orElseThrow(() -> new ResourceNotFoundException("RoomMedia", "mediaId", mediaId.longValue()));

            // ← Xóa file cũ khỏi folder (tách fileName từ URL)
            deleteOldFile(media.getUrl());

            // ← Dùng FileService lưu file mới
            String fileName = fileService.uploadImage(uploadDir, file);
            String newUrl = "/images/" + fileName;

            media.setUrl(newUrl);
            media.setMediaType(file.getContentType());

            RoomMedia updated = roomMediaRepo.save(media);

            RoomMediaDTO dto = modelMapper.map(updated, RoomMediaDTO.class);
            if (updated.getRoom() != null) {
                dto.setRoomId(updated.getRoom().getRoomId());
            }
            return dto;

        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi upload file mới: " + e.getMessage());
        }
    }

    // ========== DELETE ==========
    @Override
    @Transactional
    public String deleteRoomMedia(Integer mediaId) {
        RoomMedia media = roomMediaRepo.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("RoomMedia", "mediaId", mediaId.longValue()));

        // ← Xóa file khỏi folder
        deleteOldFile(media.getUrl());

        // ← Xóa record DB
        roomMediaRepo.delete(media);

        return "Xóa media phòng thành công với id: " + mediaId;
    }

    // ========== HELPER: Xóa file cũ ==========
    // FileService không có method xóa nên vẫn tự xử lý
    // nhưng tách ra helper để gọn
    private void deleteOldFile(String url) {
        if (url == null || !url.startsWith("/images/")) return;
        try {
            String fileName = url.replace("/images/", "");
            Path filePath = Paths.get(uploadDir).resolve(fileName);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Không thể xóa file cũ: " + e.getMessage());
        }
    }
}