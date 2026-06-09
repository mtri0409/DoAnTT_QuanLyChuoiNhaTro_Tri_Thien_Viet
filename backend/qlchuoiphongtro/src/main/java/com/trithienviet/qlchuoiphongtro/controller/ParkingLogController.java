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

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Slf4j
public class ParkingLogController {

    @Autowired
    private ParkingLogService parkingLogService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/ai/receive-plate")
    public ResponseEntity<String> receivePlateFromAI(@RequestBody PlatePayload payload) {
        log.info("📥 Nhận dữ liệu từ AI: trackId={}, plate={}",
                payload.getTrackId(), payload.getBestPlate());

        ParkingLogDTO created = parkingLogService.createParking(payload);

        if (created != null) {
            log.info("✅ Đã lưu parking log với ID: {}", created.getLogId());

            messagingTemplate.convertAndSend("/topic/plates", created);
            log.info("📡 Đã broadcast dữ liệu thành công qua WebSocket: /topic/plates");

            return new ResponseEntity<>("Đã lưu parking log thành công!", HttpStatus.OK);
        } else {
            log.warn("❌ Không thể lưu do biển số không hợp lệ");

            messagingTemplate.convertAndSend("/topic/plates_errors", payload);
            log.info("📡 Đã broadcast lỗi qua WebSocket: /topic/plates_errors");

            return new ResponseEntity<>("Không thể lưu do biển số không hợp lệ", HttpStatus.BAD_REQUEST);
        }
    }

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

        PageResponse<ParkingLogDTO> response = parkingLogService.getAllParkingLogs(
                pageNumber, pageSize, sortBy, sortOrder, licensePlate, direction, isVerified, fromDate, toDate);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/parking-logs/{logId}")
    public ResponseEntity<String> deleteParkingLog(@PathVariable Long logId) {
        String result = parkingLogService.deleteParkingLog(logId);
        return new ResponseEntity<>(result, HttpStatus.OK);
    }

    @GetMapping("/admin/parking-logs/filter")
    public ResponseEntity<PageResponse<ParkingLogDTO>> filterLogs(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "detectedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {

        return new ResponseEntity<>(parkingLogService.filterParkingLogsByDate(
                startDate, endDate, pageNumber, pageSize, sortBy, sortOrder), HttpStatus.OK);
    }

    @GetMapping("/parking-logs/stats")
    public ResponseEntity<ParkingStatsResponse> getStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return new ResponseEntity<>(parkingLogService.getParkingStats(startDate, endDate), HttpStatus.OK);
    }
}
