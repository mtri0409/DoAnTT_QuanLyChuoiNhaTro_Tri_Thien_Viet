package com.trithienviet.qlchuoiphongtro.controller;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.*;
import org.springframework.security.core.userdetails.UserDetails;
import com.trithienviet.qlchuoiphongtro.service.MaintenanceRequestService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Manager Room Application")
public class MaintenanceRequestController {

    @Autowired
    private MaintenanceRequestService maintenanceRequestService;

    // ================================================================
    // TENANT APIs
    // ================================================================

    /**
     * Tenant tạo yêu cầu sửa chữa mới.
     * POST /api/tenant/maintenance?roomId=1&description=...&assetId=2
     */
    @PostMapping("/tenant/maintenance")
    public ResponseEntity<MaintenanceRequestDTO> createRequest(
            @RequestParam Long roomId,
            @RequestParam(required = false) Integer assetId,
            @RequestParam String description,
            @AuthenticationPrincipal UserDetails userDetails) {

        return new ResponseEntity<>(
                maintenanceRequestService.createRequest(roomId, assetId, description, userDetails.getUsername()),
                HttpStatus.CREATED);
    }

    /**
     * Tenant upload ảnh cho yêu cầu (tối đa 5 ảnh).
     * POST /api/tenant/maintenance/{requestId}/images
     */
    @PostMapping("/tenant/maintenance/{requestId}/images")
    public ResponseEntity<List<MaintenanceRequestImageDTO>> uploadImages(
            @PathVariable Integer requestId,
            @RequestParam("images") List<MultipartFile> images,
            @AuthenticationPrincipal UserDetails userDetails) throws IOException {

        return ResponseEntity.ok(
                maintenanceRequestService.uploadImages(requestId, images, userDetails.getUsername()));
    }

    /**
     * Tenant xem danh sách yêu cầu của mình.
     * GET /api/tenant/maintenance
     */
    @GetMapping("/tenant/maintenance")
    public ResponseEntity<PageResponse<MaintenanceRequestDTO>> getMyRequests(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = "desc", required = false) String sortOrder,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(maintenanceRequestService.getMyRequests(
                userDetails.getUsername(),
                Math.max(0, pageNumber - 1),
                pageSize, sortBy, sortOrder));
    }

    /**
     * Xem chi tiết 1 yêu cầu (tenant + admin đều dùng).
     * GET /api/public/maintenance/{requestId}
     */
    @GetMapping("/public/maintenance/{requestId}")
    public ResponseEntity<MaintenanceRequestDTO> getRequestById(@PathVariable Integer requestId) {
        return ResponseEntity.ok(maintenanceRequestService.getRequestById(requestId));
    }

    /**
     * Tenant hủy yêu cầu của mình (chỉ khi PENDING).
     * PATCH /api/tenant/maintenance/{requestId}/cancel
     */
    @PatchMapping("/tenant/maintenance/{requestId}/cancel")
    public ResponseEntity<MaintenanceRequestDTO> cancelRequest(
            @PathVariable Integer requestId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return ResponseEntity.ok(
                maintenanceRequestService.cancelRequest(requestId, userDetails.getUsername()));
    }

    // ================================================================
    // ADMIN APIs
    // ================================================================

    /**
     * Admin xem tất cả yêu cầu, lọc theo status / branchId.
     * GET /api/admin/maintenance
     */
    @GetMapping("/admin/maintenance")
    public ResponseEntity<PageResponse<MaintenanceRequestDTO>> getAllRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) Long floorId,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = "desc", required = false) String sortOrder) {

        return ResponseEntity.ok(maintenanceRequestService.getAllRequests(
                status, branchId, floorId,
                Math.max(0, pageNumber - 1),
                pageSize, sortBy, sortOrder));
    }

    /**
     * Admin xem yêu cầu theo phòng.
     * GET /api/admin/maintenance/room/{roomId}
     */
    @GetMapping("/admin/maintenance/room/{roomId}")
    public ResponseEntity<PageResponse<MaintenanceRequestDTO>> getRequestsByRoom(
            @PathVariable Long roomId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = "desc", required = false) String sortOrder) {

        return ResponseEntity.ok(maintenanceRequestService.getRequestsByRoom(
                roomId, status,
                Math.max(0, pageNumber - 1),
                pageSize, sortBy, sortOrder));
    }

    /**
     * Admin cập nhật trạng thái yêu cầu.
     * PATCH /api/admin/maintenance/{requestId}/status?status=PROCESSING
     */
    @PatchMapping("/admin/maintenance/{requestId}/status")
    public ResponseEntity<MaintenanceRequestDTO> updateStatus(
            @PathVariable Integer requestId,
            @RequestParam String status) {

        return ResponseEntity.ok(maintenanceRequestService.updateStatus(requestId, status));
    }

    /**
     * Admin xóa yêu cầu.
     * DELETE /api/admin/maintenance/{requestId}
     */
    @DeleteMapping("/admin/maintenance/{requestId}")
    public ResponseEntity<String> deleteRequest(@PathVariable Integer requestId) {
        return ResponseEntity.ok(maintenanceRequestService.deleteRequest(requestId));
    }

    // ================================================================
    // ẢNH
    // ================================================================

    /**
     * Trả về file ảnh theo tên.
     * GET /api/maintenance/images/{fileName}
     */
    @GetMapping("/maintenance/images/{fileName}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String fileName) throws IOException {

        InputStream stream = maintenanceRequestService.getImage(fileName);

        MediaType mediaType = MediaType.IMAGE_JPEG;
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".png"))
            mediaType = MediaType.IMAGE_PNG;
        else if (lower.endsWith(".webp"))
            mediaType = MediaType.parseMediaType("image/webp");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDisposition(ContentDisposition.inline().filename(fileName).build());

        return ResponseEntity.ok().headers(headers).body(new InputStreamResource(stream));
    }
}