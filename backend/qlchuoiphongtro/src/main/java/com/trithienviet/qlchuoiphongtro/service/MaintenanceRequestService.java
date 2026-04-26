package com.trithienviet.qlchuoiphongtro.service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.payloads.MaintenanceRequestDTO;
import com.trithienviet.qlchuoiphongtro.payloads.MaintenanceRequestImageDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;

public interface MaintenanceRequestService {

    // ========== TENANT ==========

    MaintenanceRequestDTO createRequest(Long roomId, Integer assetId, String description, String username);

    List<MaintenanceRequestImageDTO> uploadImages(Integer requestId, List<MultipartFile> images, String username)
            throws IOException;

    PageResponse<MaintenanceRequestDTO> getMyRequests(
            String username, Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder);

    MaintenanceRequestDTO cancelRequest(Integer requestId, String username);

    // ========== ADMIN ==========

    PageResponse<MaintenanceRequestDTO> getAllRequests(
            String status, Integer branchId, Long floorId,
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder);

    PageResponse<MaintenanceRequestDTO> getRequestsByRoom(
            Long roomId, String status,
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder);

    MaintenanceRequestDTO getRequestById(Integer requestId);

    MaintenanceRequestDTO updateStatus(Integer requestId, String status);

    String deleteRequest(Integer requestId);

    // ========== ẢNH ==========

    InputStream getImage(String fileName) throws IOException;
}