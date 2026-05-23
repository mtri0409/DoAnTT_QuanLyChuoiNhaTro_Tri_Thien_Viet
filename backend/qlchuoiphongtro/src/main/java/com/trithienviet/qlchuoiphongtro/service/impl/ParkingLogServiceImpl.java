package com.trithienviet.qlchuoiphongtro.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trithienviet.qlchuoiphongtro.entity.ParkingLog;
import com.trithienviet.qlchuoiphongtro.entity.Vehicle;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ParkingLogDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PlatePayload;
import com.trithienviet.qlchuoiphongtro.repo.ParkingLogRepo;
import com.trithienviet.qlchuoiphongtro.repo.VehicleRepo;
import com.trithienviet.qlchuoiphongtro.service.ParkingLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;

@Service
@RequiredArgsConstructor
@Slf4j
public class ParkingLogServiceImpl implements ParkingLogService {

    @Autowired
    private ParkingLogRepo parkingLogRepo;
    
    @Autowired
    private VehicleRepo vehicleRepo;

    // ==================== CREATE ====================
    
    @Override
    public ParkingLogDTO createParking(PlatePayload payload) {
        System.out.println("\n=== TẠO PARKING LOG ===");
        System.out.println("Track ID: " + payload.getTrackId());
        System.out.println("Best plate: " + payload.getBestPlate());
        
        if (payload.getBestPlate() == null || payload.getBestPlate().isEmpty()) {
            System.out.println("❌ Không có biển số hợp lệ, bỏ qua");
            return null;
        }
        
        String detectedPlate = cleanString(payload.getBestPlate());
        System.out.println("Cleaned plate: " + detectedPlate);
        
        Vehicle foundVehicle = findVehicleByPlate(detectedPlate);
        
        String direction = determineDirection(detectedPlate);
        System.out.println("Direction: " + direction);
        
        String savedImagePath = savePlateImage(payload.getPlateImageBase64(), detectedPlate, payload.getTrackId());
        
        LocalDateTime detectedAt = parseTimestamp(payload.getTimestamp());
        
        ParkingLog parkingLog = ParkingLog.builder()
                .vehicle(foundVehicle)
                .licensePlate(detectedPlate)
                .direction(direction)
                .detectedAt(detectedAt)
                .entryTime("IN".equals(direction) ? detectedAt : null)
                .exitTime("OUT".equals(direction) ? detectedAt : null)
                .imagePath(savedImagePath)
                .confidence(calculateConfidence(payload.getConfidenceVotes()))
                .isVerified(foundVehicle != null)
                .status("PENDING")
                .notes(buildNotes(payload))
                .build();
        
        ParkingLog savedLog = parkingLogRepo.save(parkingLog);
        System.out.println("✅ Đã lưu ParkingLog với ID: " + savedLog.getLogId());
        
        return convertToDTO(savedLog);
    }

    // ==================== GET ====================
    
    @Override
    public PageResponse<ParkingLogDTO> getAllParkingLogs(
            Integer pageNumber, 
            Integer pageSize, 
            String sortBy, 
            String sortOrder) {
        
        // Xử lý sort
        Sort sort = sortOrder != null && sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Lấy tất cả parking logs
        Page<ParkingLog> logPage = parkingLogRepo.findAll(pageable);
        
        // Chuyển đổi sang DTO
        List<ParkingLogDTO> dtos = logPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        // Tạo response
        PageResponse<ParkingLogDTO> response = new PageResponse<>();
        response.setContent(dtos);
        response.setPageNumber(logPage.getNumber());
        response.setPageSize(logPage.getSize());
        response.setTotalElements(logPage.getTotalElements());
        response.setTotalPages(logPage.getTotalPages());
        response.setLastPage(logPage.isLast());
        
        return response;
    }
    
    @Override
    public ParkingLogDTO getParkingLogById(Long logId) {
        ParkingLog log = parkingLogRepo.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("ParkingLog", "logId", logId));
        return convertToDTO(log);
    }

    // ==================== DELETE ====================
    
    @Override
    @Transactional
    public String deleteParkingLog(Long logId) {
        parkingLogRepo.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("ParkingLog", "logId", logId));
        
        parkingLogRepo.deleteById(logId);
        return "Xóa thành công parking log với ID: " + logId;
    }

    // ==================== CÁC HÀM HỖ TRỢ ====================

    private Vehicle findVehicleByPlate(String licensePlate) {
        List<Vehicle> vehicles = vehicleRepo.findAll();
        for (Vehicle vehicle : vehicles) {
            if (cleanString(vehicle.getLicensePlate()).equals(cleanString(licensePlate))) {
                System.out.println("✅ Tìm thấy xe trong DB: " + vehicle.getLicensePlate());
                return vehicle;
            }
        }
        System.out.println("⚠️ Không tìm thấy xe trong DB");
        return null;
    }

    private String determineDirection(String licensePlate) {
        List<ParkingLog> recentLogs = parkingLogRepo.findTopByLicensePlateOrderByDetectedAtDesc(licensePlate);
        
        if (recentLogs == null || recentLogs.isEmpty()) {
            return "IN";
        }
        
        ParkingLog lastLog = recentLogs.get(0);
        return "IN".equals(lastLog.getDirection()) ? "OUT" : "IN";
    }

    private LocalDateTime parseTimestamp(String timestamp) {
        if (timestamp == null || timestamp.isEmpty()) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(timestamp);
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi parse timestamp: " + e.getMessage());
            return LocalDateTime.now();
        }
    }

    private String cleanString(String input) {
        if (input == null) return "";
        return input.replaceAll("[^A-Za-z0-9]", "").toUpperCase().trim();
    }

    private String savePlateImage(String base64Image, String licensePlate, Integer trackId) {
        if (base64Image == null || base64Image.isEmpty()) {
            return null;
        }
        
        try {
            String uploadDir = "uploads/plates/";
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            
            String fileName = String.format("plate_%s_%d_%d.jpg", 
                licensePlate, trackId, System.currentTimeMillis());
            String filePath = uploadDir + fileName;
            
            byte[] imageBytes = Base64.getDecoder().decode(base64Image);
            Files.write(Paths.get(filePath), imageBytes);
            
            System.out.println("📸 Đã lưu ảnh: " + filePath);
            return filePath;
            
        } catch (Exception e) {
            System.err.println("❌ Lỗi lưu ảnh: " + e.getMessage());
            return null;
        }
    }

    private Double calculateConfidence(String confidenceVotes) {
        if (confidenceVotes == null || confidenceVotes.isEmpty()) {
            return 0.5;
        }
        
        try {
            String[] parts = confidenceVotes.split("/");
            if (parts.length == 2) {
                double success = Double.parseDouble(parts[0]);
                double total = Double.parseDouble(parts[1]);
                return success / total;
            }
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi parse confidence: " + e.getMessage());
        }
        return 0.5;
    }

    private String buildNotes(PlatePayload payload) {
        StringBuilder notes = new StringBuilder();
        notes.append("Raw reads: ").append(String.join(", ", payload.getRaw5Reads()));
        
        if (payload.getUniqueValidPlates() != null && !payload.getUniqueValidPlates().isEmpty()) {
            notes.append(" | Unique plates: ").append(String.join(", ", payload.getUniqueValidPlates()));
        }
        
        return notes.toString();
    }

    private ParkingLogDTO convertToDTO(ParkingLog parkingLog) {
        ParkingLogDTO dto = new ParkingLogDTO();
        dto.setLogId(parkingLog.getLogId());
        dto.setLicensePlate(parkingLog.getLicensePlate());
        dto.setDirection(parkingLog.getDirection());
        dto.setDetectedAt(parkingLog.getDetectedAt());
        dto.setEntryTime(parkingLog.getEntryTime());
        dto.setExitTime(parkingLog.getExitTime());
        dto.setImagePath(parkingLog.getImagePath());
        dto.setConfidence(parkingLog.getConfidence());
        dto.setIsVerified(parkingLog.getIsVerified());
        dto.setStatus(parkingLog.getStatus());
        dto.setNotes(parkingLog.getNotes());
        
        if (parkingLog.getVehicle() != null) {
            dto.setVehicleId(parkingLog.getVehicle().getVehicleId());
            dto.setVehicleLicensePlate(parkingLog.getVehicle().getLicensePlate());
            if (parkingLog.getVehicle().getOwner() != null) {
                dto.setCustomerName(parkingLog.getVehicle().getOwner().getFullName());
                dto.setCustomerPhone(parkingLog.getVehicle().getOwner().getPhone());
            }
        }
        
        return dto;
    }
}