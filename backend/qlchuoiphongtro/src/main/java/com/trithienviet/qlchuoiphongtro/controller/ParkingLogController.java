package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ParkingLogDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PlatePayload;
import com.trithienviet.qlchuoiphongtro.service.ParkingLogService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
    @PostMapping("/ai/receive-plate")
    public ResponseEntity<String> receivePlateFromAI(@RequestBody PlatePayload payload) {
        log.info("📥 Nhận dữ liệu từ AI: trackId={}, plate={}", 
                 payload.getTrackId(), payload.getBestPlate());
        
        // Lưu vào database
        ParkingLogDTO created = parkingLogService.createParking(payload);
        
        // ========== BROADCAST QUA WEBSOCKET ==========
        if (created != null) {
            log.info("✅ Đã lưu parking log với ID: {}", created.getLogId());
            
            // Broadcast thành công qua kênh /topic/plates
            messagingTemplate.convertAndSend("/topic/plates", payload);
            log.info("📡 Đã broadcast qua WebSocket: /topic/plates");
            
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
            @RequestParam(defaultValue = "desc") String sortOrder) {
        
        PageResponse<ParkingLogDTO> response = parkingLogService.getAllParkingLogs(
            pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/parking-logs/{logId}")
    public ResponseEntity<ParkingLogDTO> getParkingLogById(@PathVariable Long logId) {
        ParkingLogDTO log = parkingLogService.getParkingLogById(logId);
        return ResponseEntity.ok(log);
    }

    // ==================== DELETE ====================
    
    @DeleteMapping("/parking-logs/{logId}")
    public ResponseEntity<String> deleteParkingLog(@PathVariable Long logId) {
        String result = parkingLogService.deleteParkingLog(logId);
        return ResponseEntity.ok(result);
    }
}