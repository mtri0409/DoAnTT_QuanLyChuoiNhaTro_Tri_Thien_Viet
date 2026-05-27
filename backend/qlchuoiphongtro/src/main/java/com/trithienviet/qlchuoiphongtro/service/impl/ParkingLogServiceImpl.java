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
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.Vehicle;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.helper.NotificationHelper;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ParkingLogDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ParkingStatsResponse;
import com.trithienviet.qlchuoiphongtro.payloads.PlatePayload;
import com.trithienviet.qlchuoiphongtro.repo.ParkingLogRepo;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
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

    @Autowired
    private NotificationHelper notificationHelper;
    // ==================== CREATE ====================
    @Autowired
    private ProfileRepo profileRepo;

    @Override
    public ParkingLogDTO createParking(PlatePayload payload) {
        System.out.println("\n=== TẠO/CẬP NHẬT PARKING LOG ===");
        System.out.println("Track ID: " + payload.getTrackId());

         // 1. Parse thời gian từ Python gửi qua
        LocalDateTime checkAt = LocalDateTime.parse(payload.getTimestamp());
        
        // 2. Kiểm tra điều kiện nếu giờ quét nằm trong khoảng từ 0h sáng đến trước 6h sáng (Sau 12h đêm)
        // if (checkAt.getHour() >= 0 && checkAt.getHour() < 6) {
        if (checkAt.getHour() >= 6 || checkAt.getHour() == 0) {
            log.info("🌙 [CẢNH BÁO CA ĐÊM] Xe quét vào khung giờ muộn sau 12h đêm: {}h", checkAt.getHour());
            List<Profile> profiles = profileRepo.findProfileByRole(com.trithienviet.qlchuoiphongtro.entity.UserRole.ADMIN); // Giả sử role = ADMIN là người quản lý hoặc chủ nhà, bạn cần thay bằng logic lấy profile thực tế
            
            for (Profile profile : profiles) {
                notificationHelper.sendVehicleExitAfter12Hour(
                    profile,
                    payload.getBestPlate(), 
                    checkAt.toString()
                );
            }
                    
        } else {
            log.info("☀️ Xe quét vào khung giờ ca ngày bình thường: {}h", checkAt.getHour());
        }

        // ============================================================
        // BƯỚC 1: XỬ LÝ BIỂN SỐ (BAO GỒM TRƯỜNG HỢP OCR LỖI)
        // ============================================================
        String detectedPlate = null;
        boolean isOcrSuccess = false;

        // Kiểm tra nếu Python báo thành công và có biển số tốt nhất
        if ("SUCCESS".equals(payload.getStatus()) && payload.getBestPlate() != null
                && !payload.getBestPlate().isEmpty()) {
            detectedPlate = cleanString(payload.getBestPlate());
            System.out.println("✅ OCR thành công. Biển số: " + detectedPlate);
            isOcrSuccess = true;
        } else {
            // Trường hợp OCR FAILED hoặc best_plate null
            System.out.println("⚠️ OCR thất bại hoặc không đọc được biển số hợp lệ từ Python.");
            detectedPlate = "UNKNOWN"; // Gán giá trị UNKNOWN để lưu log
            isOcrSuccess = false;
        }

        // ============================================================
        // BƯỚC 2: XỬ LÝ LƯU ẢNH BIỂN SỐ (BASE64)
        // ============================================================
        // Gọi hàm helper đã viết ở Mục 1
        String savedImagePath = savePlateImage(payload.getPlateImageBase64(), detectedPlate, payload.getTrackId());

        // ============================================================
        // BƯỚC 3: XỬ LÝ LOGIC XE (TÌM XE, HƯỚNG RA/VÀO)
        // ============================================================
        Vehicle foundVehicle = null;
        String direction = "UNKNOWN";

        if (isOcrSuccess) {
            // Chỉ tìm xe và xác định hướng nếu OCR thành công
            foundVehicle = findVehicleByPlate(detectedPlate);
            direction = determineDirection(detectedPlate); // Hàm xác định IN/OUT dựa trên vùng camera
        } else {
            // Nếu OCR lỗi, chúng ta chỉ lưu nhật ký, không thể xác định hướng hay tìm xe.
            // Bạn có thể giữ hướng là UNKNOWN hoặc tự định nghĩa logic mặc định.
            direction = "";
        }
        System.out.println("Direction: " + direction);

        // ============================================================
        // BƯỚC 4: XÂY DỰNG VÀ LƯU PARKING LOG
        // ============================================================
        LocalDateTime detectedAt = parseTimestamp(payload.getTimestamp());

        ParkingLog.ParkingLogBuilder logBuilder = ParkingLog.builder()
                .licensePlate(detectedPlate)
                .direction(direction)
                .detectedAt(detectedAt)
                // Nếu xác định được hướng thì gán, không thì để null
                .entryTime("IN".equals(direction) ? detectedAt : null)
                .exitTime("OUT".equals(direction) ? detectedAt : null)
                .imagePath(savedImagePath) // Lưu đường dẫn ảnh đã lưu thành công vào DB
                .confidence(calculateConfidence(payload.getConfidenceVotes()))
                .notes(buildNotes(payload)); // Hàm build notes nên ghi chú rõ nếu OCR lỗi

        // Logic xử lý Trạng thái Verified và Xe (Xử lý xe lạ)
        if (foundVehicle != null) {
            System.out.println("✅ Tìm thấy xe trong hệ thống: " + foundVehicle.getVehicleId());
            logBuilder.vehicle(foundVehicle);
            logBuilder.isVerified(true);
            logBuilder.status("SUCCESS"); // Có xe, có biển sạch -> Có thể set SUCCESS luôn tùy nghiệp vụ
        } else {
            if (!isOcrSuccess) {
                System.out.println("⚠️ Lưu log xe không đọc được biển số (UNKNOWN).");
                logBuilder.status("FAILED_OCR"); // Đặt trạng thái riêng để ban quản lý dễ lọc
            } else {
                System.out.println("⚠️ Xe lạ (Không có trong hệ thống), lưu log xe vãng lai.");
                logBuilder.status("PENDING_VERIFY"); // Đặt trạng thái chờ xác minh xe lạ
            }
            logBuilder.vehicle(null); // Lưu null vào cột vehicle_id trong DB cho cả xe lạ và xe không đọc được biển
            logBuilder.isVerified(false); // Chưa xác minh
        }

        // Lưu xuống Database
        ParkingLog parkingLog = logBuilder.build();
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
            String sortOrder,
            String licensePlate, 
            String direction, 
            Boolean isVerified, 
            String fromDate, 
            String toDate) {

        // 1. Xử lý Sắp xếp (Sort) như cũ của bạn
        Sort sort = sortOrder != null && sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        // 2. Làm sạch chuỗi rỗng chuyển về null để câu lệnh SQL WHERE dễ xử lý
        String searchPlate = (licensePlate != null && !licensePlate.trim().isEmpty()) ? licensePlate.trim() : null;
        String searchDir = (direction != null && !direction.trim().isEmpty()) ? direction.trim() : null;

        // 3. Chuyển đổi khoảng ngày (String từ React) sang LocalDateTime để truy vấn DB chính xác
        LocalDateTime startDateTime = null;
        LocalDateTime endDateTime = null;
        try {
            if (fromDate != null && !fromDate.isEmpty()) {
                startDateTime = LocalDate.parse(fromDate).atStartOfDay(); // Lọc từ 00:00:00 ngày bắt đầu
            }
            if (toDate != null && !toDate.isEmpty()) {
                endDateTime = LocalDate.parse(toDate).atTime(LocalTime.MAX); // Lọc đến 23:59:59 ngày kết thúc
            }
        } catch (Exception e) {
            System.out.println("⚠️ Lỗi định dạng ngày lọc lịch sử bãi xe: " + e.getMessage());
        }

        // 4. Gọi hàm Query động từ Repository (Hàm findAllWithFilters đã tạo ở bước trước)
        Page<ParkingLog> logPage = parkingLogRepo.findAllWithFilters(
                searchPlate, searchDir, isVerified, startDateTime, endDateTime, pageable);

        // 5. Chuyển đổi kết quả sang DTO bằng hàm convertToDTO có sẵn của bạn
        List<ParkingLogDTO> dtos = logPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // 6. Đóng gói dữ liệu vào PageResponse trả về cho Client
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

    // ==================== BỘ LỌC VÀ THỐNG KÊ THEO NGÀY ====================

    @Override
    public PageResponse<ParkingLogDTO> filterParkingLogsByDate(
            LocalDate startDate, 
            LocalDate endDate,
            Integer pageNumber, 
            Integer pageSize, 
            String sortBy, 
            String sortOrder) {
        
        // 1. Nếu ngày rỗng, mặc định lọc ngày hôm nay
        if (startDate == null) startDate = LocalDate.now();
        if (endDate == null) endDate = startDate; // Nếu chỉ truyền 1 ngày thì lọc trong ngày đó

        // 2. Thiết lập mốc thời gian từ 00:00:00 của ngày bắt đầu đến 23:59:59 của ngày kết thúc
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(LocalTime.MAX);

        // 3. Xử lý sắp xếp (Sort)
        Sort sort = sortOrder != null && sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        // 4. Gọi DB lấy dữ liệu theo khoảng thời gian đã tính toán
        Page<ParkingLog> logPage = parkingLogRepo.findByDetectedAtBetween(startDateTime, endDateTime, pageable);

        // 5. Chuyển đổi sang List DTO bằng hàm convertToDTO có sẵn của bạn
        List<ParkingLogDTO> dtos = logPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        // 6. Tạo cấu trúc PageResponse trả về cho Client
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
    public ParkingStatsResponse getParkingStats(LocalDate startDate, LocalDate endDate) {
        // Nếu không truyền ngày, mặc định lấy dữ liệu ngày hôm nay
        if (startDate == null) startDate = LocalDate.now();
        if (endDate == null) endDate = startDate;

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        // Đếm song song các chỉ số từ cơ sở dữ liệu
        long totalIn = parkingLogRepo.countByDirectionAndDetectedAtBetween("IN", start, end);
        long totalOut = parkingLogRepo.countByDirectionAndDetectedAtBetween("OUT", start, end);
        long totalLogs = totalIn + totalOut;
        
        long unknownVehicles = parkingLogRepo.countByVehicleIsNullAndDetectedAtBetween(start, end);
        long failedOcr = parkingLogRepo.countByStatusAndDetectedAtBetween("FAILED_OCR", start, end);

        return new ParkingStatsResponse(totalLogs, totalIn, totalOut, unknownVehicles, failedOcr);
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
        if (input == null)
            return "";
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