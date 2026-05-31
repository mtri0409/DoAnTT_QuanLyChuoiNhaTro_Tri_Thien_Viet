package com.trithienviet.qlchuoiphongtro.service.impl;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.entity.*;
import com.trithienviet.qlchuoiphongtro.exceptions.APIException;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.*;
import com.trithienviet.qlchuoiphongtro.repo.*;
import com.trithienviet.qlchuoiphongtro.service.MaintenanceRequestService;

@Service
public class MaintenanceRequestServiceImpl implements MaintenanceRequestService {

    @Value("${app.maintenance.image-dir:uploads/maintenance}")
    private String imageDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final int MAX_IMAGES = 5;
    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp");
    private static final List<String> VALID_STATUSES = List.of("PENDING", "PROCESSING", "COMPLETED", "CANCELLED");

    @Autowired
    private MaintenanceRequestRepo requestRepo;

    @Autowired
    private MaintenanceRequestImageRepo imageRepo;

    @Autowired
    private RoomRepo roomRepo;

    @Autowired
    private UserRepo userRepo;

    // @Autowired
    // private AssetRepo assetRepo;

    // =========================================================
    // TENANT
    // =========================================================

    @Override
    public MaintenanceRequestDTO createRequest(Long roomId, Integer assetId, String description, String username) {

        if (description == null || description.trim().length() < 10) {
            throw new APIException("Mô tả phải có ít nhất 10 ký tự");
        }

        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));

        User creator = userRepo.findByUserName(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userName", username));

        MaintenanceRequest request = new MaintenanceRequest();
        request.setRoom(room);
        request.setCreator(creator);
        request.setDescription(description.trim());
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());

        if (assetId != null) {
            // Asset asset = assetRepo.findById(assetId)
            // .orElseThrow(() -> new ResourceNotFoundException("Asset", "assetId",
            // assetId));
            // request.setAsset(asset);
        }

        return toDTO(requestRepo.save(request));
    }

    @Override
    public List<MaintenanceRequestImageDTO> uploadImages(Integer requestId, List<MultipartFile> images,
            String username) throws IOException {

        MaintenanceRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "requestId", requestId));

        if (!request.getCreator().getUserName().equals(username)) {
            throw new APIException("Bạn không có quyền upload ảnh cho yêu cầu này");
        }

        long currentCount = imageRepo.countByMaintenanceRequest_RequestId(requestId);
        if (currentCount + images.size() > MAX_IMAGES) {
            throw new APIException("Mỗi yêu cầu chỉ được phép tối đa " + MAX_IMAGES + " ảnh. "
                    + "Hiện tại đã có " + currentCount + " ảnh.");
        }

        Path dirPath = Paths.get(imageDir);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        List<MaintenanceRequestImage> newImages = new ArrayList<>();

        for (MultipartFile file : images) {
            String contentType = file.getContentType();
            if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
                throw new APIException("Chỉ chấp nhận ảnh định dạng JPEG, PNG hoặc WebP");
            }

            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID().toString() + extension;

            Files.copy(file.getInputStream(), dirPath.resolve(fileName));

            MaintenanceRequestImage img = new MaintenanceRequestImage();
            img.setMaintenanceRequest(request);
            img.setImageName(fileName);
            newImages.add(img);
        }

        imageRepo.saveAll(newImages);
        return toImageDTOList(imageRepo.findByMaintenanceRequest_RequestId(requestId));
    }

    @Override
    public PageResponse<MaintenanceRequestDTO> getMyRequests(
            String username, Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {

        Sort sort = "desc".equalsIgnoreCase(sortOrder)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<MaintenanceRequest> page = requestRepo.findByCreator_UserName(
                username, PageRequest.of(pageNumber, pageSize, sort));
        return toPageResponse(page);
    }

    @Override
    public MaintenanceRequestDTO cancelRequest(Integer requestId, String username) {

        MaintenanceRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "requestId", requestId));

        if (!request.getCreator().getUserName().equals(username)) {
            throw new APIException("Bạn không có quyền hủy yêu cầu này");
        }
        if (!"PENDING".equals(request.getStatus())) {
            throw new APIException("Chỉ có thể hủy yêu cầu ở trạng thái PENDING");
        }

        request.setStatus("CANCELLED");
        request.setUpdatedAt(LocalDateTime.now());
        return toDTO(requestRepo.save(request));
    }

    // =========================================================
    // ADMIN
    // =========================================================

    @Override
    public PageResponse<MaintenanceRequestDTO> getAllRequests(
            String status, Integer branchId, Long floorId,
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {

        Sort sort = "desc".equalsIgnoreCase(sortOrder)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<MaintenanceRequest> page;
        if (floorId != null && status != null) {
            page = requestRepo.findByFloorIdAndStatus(floorId, status, pageable);
        } else if (floorId != null) {
            page = requestRepo.findByFloorId(floorId, pageable);
        } else if (branchId != null && status != null) {
            page = requestRepo.findByBranchIdAndStatus(branchId, status, pageable);
        } else if (branchId != null) {
            page = requestRepo.findByBranchId(branchId, pageable);
        } else if (status != null) {
            page = requestRepo.findByStatus(status, pageable);
        } else {
            page = requestRepo.findAll(pageable);
        }

        return toPageResponse(page);
    }

    @Override
    public PageResponse<MaintenanceRequestDTO> getRequestsByRoom(
            Long roomId, String status,
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {

        Sort sort = "desc".equalsIgnoreCase(sortOrder)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<MaintenanceRequest> page = (status != null)
                ? requestRepo.findByRoom_RoomIdAndStatus(roomId, status, pageable)
                : requestRepo.findByRoom_RoomId(roomId, pageable);

        return toPageResponse(page);
    }

    @Override
    public MaintenanceRequestDTO getRequestById(Integer requestId) {
        return toDTO(requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "requestId", requestId)));
    }

    @Override
    public MaintenanceRequestDTO updateStatus(Integer requestId, String status) {

        if (!VALID_STATUSES.contains(status)) {
            throw new APIException("Trạng thái phải là PENDING, PROCESSING, COMPLETED hoặc CANCELLED");
        }

        MaintenanceRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "requestId", requestId));

        if ("COMPLETED".equals(request.getStatus()) || "CANCELLED".equals(request.getStatus())) {
            throw new APIException("Không thể cập nhật yêu cầu đã " + request.getStatus());
        }

        request.setStatus(status);
        request.setUpdatedAt(LocalDateTime.now());
        return toDTO(requestRepo.save(request));
    }

    @Override
    public String deleteRequest(Integer requestId) {
        MaintenanceRequest request = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "requestId", requestId));

        imageRepo.findByMaintenanceRequest_RequestId(requestId).forEach(img -> {
            try {
                Files.deleteIfExists(Paths.get(imageDir, img.getImageName()));
            } catch (IOException ignored) {
            }
        });

        requestRepo.delete(request);
        return "Xóa yêu cầu sửa chữa #" + requestId + " thành công";
    }

    // =========================================================
    // ẢNH
    // =========================================================

    @Override
    public InputStream getImage(String fileName) throws IOException {
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
            throw new APIException("Tên file không hợp lệ");
        }
        File file = Paths.get(imageDir, fileName).toFile();
        if (!file.exists()) {
            throw new ResourceNotFoundException("Image", "fileName", fileName);
        }
        return new FileInputStream(file);
    }

    // =========================================================
    // HELPER
    // =========================================================

    private MaintenanceRequestDTO toDTO(MaintenanceRequest r) {
        Branch branch = r.getRoom() != null
                ? r.getRoom().getFloor().getBranch()
                : null;
        return MaintenanceRequestDTO.builder()
                .requestId(r.getRequestId())
                .roomId(r.getRoom() != null ? r.getRoom().getRoomId() : null)
                .roomName(r.getRoom() != null ? r.getRoom().getRoomName() : null)
                .branchId(branch != null ? branch.getBranchId().longValue() : null)
                .branchName(branch != null ? branch.getBranchName() : null)
                .assetId(r.getAsset() != null ? r.getAsset().getAssetId() : null)
                .assetName(r.getAsset() != null ? r.getAsset().getAssetName() : null)
                .createdBy(r.getCreator() != null ? r.getCreator().getUserId().longValue() : null)
                .creatorName(r.getCreator() != null ? r.getCreator().getUserName() : null)
                .description(r.getDescription())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .images(toImageDTOList(imageRepo.findByMaintenanceRequest_RequestId(r.getRequestId())))
                .build();
    }

    private List<MaintenanceRequestImageDTO> toImageDTOList(List<MaintenanceRequestImage> images) {
        return images.stream()
                .map(img -> MaintenanceRequestImageDTO.builder()
                        .imageId(img.getImageId())
                        .imageName(img.getImageName())
                        .imageUrl(baseUrl + "/api/v1/maintenance/images/" + img.getImageName())
                        .build())
                .collect(Collectors.toList());
    }

    private PageResponse<MaintenanceRequestDTO> toPageResponse(Page<MaintenanceRequest> page) {
        List<MaintenanceRequestDTO> content = page.getContent()
                .stream().map(this::toDTO).collect(Collectors.toList());

        PageResponse<MaintenanceRequestDTO> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(page.getNumber() + 1);
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLastPage(page.isLast());
        return response;
    }
}