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
import com.trithienviet.qlchuoiphongtro.payloads.ApiResponse;
import com.trithienviet.qlchuoiphongtro.service.ParkingLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class ParkingLogController {

    @Autowired
    private ParkingLogService parkingLogService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    // ==================== AI DETECTION ====================

    /**
     * Nhận dữ liệu từ AI Python (webhook)
     * POST /api/v1/ai/receive-plate
     */

    @PostMapping("/ai/receive-plate")
    public ResponseEntity<ApiResponse<String>> receivePlateFromAI(@RequestBody PlatePayload payload) {
        log.info("📥 Nhận dữ liệu từ AI: trackId={}, plate={}",
                payload.getTrackId(), payload.getBestPlate());

        // Tiến hành lưu xuống Database thông qua Service
        ParkingLogDTO created = parkingLogService.createParking(payload);

        // ========== BROADCAST QUA WEBSOCKET ==========
        if (created != null) {
            log.info("✅ Đã lưu parking log với ID: {}", created.getLogId());

            messagingTemplate.convertAndSend("/topic/plates", created);
            log.info("📡 Đã broadcast dữ liệu thành công qua WebSocket: /topic/plates");

            return ResponseEntity.ok(ApiResponse.success("Đã lưu parking log thành công!"));
        } else {
            log.warn("❌ Không thể lưu do biển số không hợp lệ");

            // Broadcast lỗi qua kênh /topic/plates_errors
            messagingTemplate.convertAndSend("/topic/plates_errors", payload);
            log.info("📡 Đã broadcast lỗi qua WebSocket: /topic/plates_errors");

            return ResponseEntity.badRequest().body(ApiResponse.error("INVALID_PLATE", "Không thể lưu do biển số không hợp lệ", 400));
        }
    }
    // ==================== GET ====================

    @GetMapping("/parking-logs")
    public ResponseEntity<ApiResponse<PageResponse<ParkingLogDTO>>> getAllParkingLogs(
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

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ==================== DELETE ====================

    @DeleteMapping("/parking-logs/{logId}")
    public ResponseEntity<ApiResponse<String>> deleteParkingLog(@PathVariable Long logId) {
        String result = parkingLogService.deleteParkingLog(logId);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    // API 1: Bộ lọc tìm kiếm lịch sử xe theo ngày
    // URL test:
    // /api/v1/admin/parking-logs/filter?startDate=2026-05-24&endDate=2026-05-24
    @GetMapping("/admin/parking-logs/filter")
    public ResponseEntity<ApiResponse<PageResponse<ParkingLogDTO>>> filterLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "detectedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {

        return ResponseEntity.ok(ApiResponse.success(parkingLogService.filterParkingLogsByDate(
                startDate, endDate, pageNumber, pageSize, sortBy, sortOrder)));
    }

    // URL test: /api/v1/parking-logs/stats?startDate=2026-05-24
    @GetMapping("/parking-logs/stats")
    public ResponseEntity<ApiResponse<ParkingStatsResponse>> getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return ResponseEntity.ok(ApiResponse.success(parkingLogService.getParkingStats(startDate, endDate)));
    }
}