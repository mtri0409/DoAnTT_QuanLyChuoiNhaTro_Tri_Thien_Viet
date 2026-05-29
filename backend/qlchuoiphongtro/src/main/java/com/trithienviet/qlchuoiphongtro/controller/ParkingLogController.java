package com.trithienviet.qlchuoiphongtro.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ParkingLogDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ParkingStatsResponse;
import com.trithienviet.qlchuoiphongtro.payloads.PlatePayload;
import com.trithienviet.qlchuoiphongtro.service.ParkingLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.time.LocalTime;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
public class ParkingLogController {

    @Autowired
    private ParkingLogService parkingLogService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;  // ✅ Thêm dòng này

    // ==================== AI DETECTION ====================
    
    /**
     * Nhận dữ liệu từ AI Python (webhook)
     * POST /api/ai/receive-plate
     */

   @PostMapping("/ai/receive-plate") // Đảm bảo đúng Endpoint Webhook nhận từ Python
    public ResponseEntity<String> receivePlateFromAI(@RequestBody PlatePayload payload) {
        log.info("📥 Nhận dữ liệu từ AI: trackId={}, plate={}", 
                payload.getTrackId(), payload.getBestPlate());

       
        // Tiến hành lưu xuống Database thông qua Service
        ParkingLogDTO created = parkingLogService.createParking(payload);
        
        // ========== BROADCAST QUA WEBSOCKET ==========
        if (created != null) {
            log.info("✅ Đã lưu parking log với ID: {}", created.getLogId());
            
             messagingTemplate.convertAndSend("/topic/plates", created);
            
            return ResponseEntity.ok("Đã lưu parking log thành công!");
        } else {
            log.warn("❌ Không thể lưu do biển số không hợp lệ");
            
            // Broadcast lỗi qua kênh /topic/plates_errors
            messagingTemplate.convertAndSend("/topic/plates_errors", payload);
            log.info("📡 Đã broadcast lỗi qua WebSocket: /topic/plates_errors");
            
            return ResponseEntity.badRequest().body("Không thể lưu do biển số không hợp lệ");
        }
    }

    // ==================== GET ====================
    
    @GetMapping("/parking-logs")
    public ResponseEntity<PageResponse<ParkingLogDTO>> getAllParkingLogs(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "detectedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder,
            @RequestParam(required = false) String licensePlate,
            @RequestParam(required = false) String direction,
            @RequestParam(required = false) Boolean isVerified,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        
        // Truyền thêm các tham số lọc vào hàm service
        PageResponse<ParkingLogDTO> response = parkingLogService.getAllParkingLogs(
            pageNumber, pageSize, sortBy, sortOrder, licensePlate, direction, isVerified, fromDate, toDate);
            
        return ResponseEntity.ok(response);
    }

    // ==================== DELETE ====================
    
    @DeleteMapping("/parking-logs/{logId}")
    public ResponseEntity<String> deleteParkingLog(@PathVariable Long logId) {
        String result = parkingLogService.deleteParkingLog(logId);
        return ResponseEntity.ok(result);
    }

    // API 1: Bộ lọc tìm kiếm lịch sử xe theo ngày
    // URL test: /api/admin/parking-logs/filter?startDate=2026-05-24&endDate=2026-05-24
    @GetMapping("/filter")
    public ResponseEntity<PageResponse<ParkingLogDTO>> filterLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "detectedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        
        return ResponseEntity.ok(parkingLogService.filterParkingLogsByDate(
                startDate, endDate, pageNumber, pageSize, sortBy, sortOrder));
    }

    // URL test: /api/admin/parking-logs/stats?startDate=2026-05-24
    @GetMapping("/parking-logs/stats")
    public ResponseEntity<ParkingStatsResponse> getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        return ResponseEntity.ok(parkingLogService.getParkingStats(startDate, endDate));
    }
}