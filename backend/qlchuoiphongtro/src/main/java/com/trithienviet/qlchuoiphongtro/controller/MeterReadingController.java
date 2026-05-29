package com.trithienviet.qlchuoiphongtro.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.MetterReadingDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.service.MeterReadingService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import java.io.IOException;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Manager Room Application")
public class MeterReadingController {

    @Autowired
    private MeterReadingService meterReadingService;

    @PostMapping("/admin/meter-readings")
    public ResponseEntity<MetterReadingDTO> saveReading(
            @RequestParam Long roomId,
            @RequestParam Integer serviceId,
            @RequestParam BigDecimal newValue,
            @RequestParam Integer month,
            @RequestParam Integer year,
            @RequestParam(value = "image", required = false) MultipartFile image,
            // oldValue truyền thẳng từ frontend — tránh backend tự tính sai khi phòng mới
            @RequestParam(value = "oldValue", required = false) BigDecimal oldValue,
            // isInitial = true khi phòng chưa có HĐ, đánh dấu số đầu đồng hồ
            @RequestParam(value = "isInitial", required = false, defaultValue = "false") Boolean isInitial)
            throws IOException {

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = meterReadingService.uploadReadingImage(image);
        }

        MetterReadingDTO saved = meterReadingService.saveReading(
                roomId, serviceId, newValue, month, year, imageUrl, oldValue, isInitial);

        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/admin/meter-readings/{readingId}")
    public ResponseEntity<MetterReadingDTO> getById(@PathVariable Long readingId) {
        MetterReadingDTO reading = meterReadingService.getReadingById(readingId);
        return new ResponseEntity<>(reading, HttpStatus.OK);
    }

    @GetMapping("/admin/meter-readings/room/{roomId}")
    public ResponseEntity<PageResponse<MetterReadingDTO>> getByRoom(
            @PathVariable Long roomId,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = "periodYear", required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        PageResponse<MetterReadingDTO> response = meterReadingService.getReadingsByRoom(
                roomId,
                Math.max(0, pageNumber - 1),
                pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/admin/meter-readings/room/{roomId}/period")
    public ResponseEntity<List<MetterReadingDTO>> getByRoomAndPeriod(
            @PathVariable Long roomId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        List<MetterReadingDTO> readings = meterReadingService.getReadingsByRoomAndPeriod(
                roomId, month, year);
        return new ResponseEntity<>(readings, HttpStatus.OK);
    }

    @GetMapping("/admin/meter-readings/room/{roomId}/previous")
    public ResponseEntity<MetterReadingDTO> getPrevious(
            @PathVariable Long roomId,
            @RequestParam Integer serviceId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        MetterReadingDTO reading = meterReadingService.getPreviousReading(
                roomId, serviceId, month, year);
        if (reading == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(reading, HttpStatus.OK);
    }

    @DeleteMapping("/admin/meter-readings/{readingId}")
    public ResponseEntity<String> delete(@PathVariable Long readingId) {
        meterReadingService.deleteReading(readingId);
        return new ResponseEntity<>("Meter reading deleted successfully", HttpStatus.OK);
    }
}