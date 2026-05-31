package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.AmenityDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ApiResponse;
import com.trithienviet.qlchuoiphongtro.service.AmenityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
public class AmenityController {

    @Autowired
    private AmenityService amenityService;

    // ── Public: Danh sách tiện ích (vãng lai) ─────────────────────
    @GetMapping("/public/amenities")
    public ResponseEntity<ApiResponse<PageResponse<AmenityDTO>>> getAllAmenitiesPublic(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "amenityName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        PageResponse<AmenityDTO> response = amenityService.getAllAmenities(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(ApiResponse.success(response), HttpStatus.OK);
    }

    // ── Internal: Danh sách tiện ích (cần auth) ────────────────────
    @GetMapping("/admin/amenities")
    public ResponseEntity<ApiResponse<PageResponse<AmenityDTO>>> getAllAmenities(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "amenityName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        PageResponse<AmenityDTO> response = amenityService.getAllAmenities(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(ApiResponse.success(response), HttpStatus.OK);
    }

    @GetMapping("/admin/amenities/{amenityId}")
    public ResponseEntity<ApiResponse<AmenityDTO>> getAmenityById(@PathVariable Integer amenityId) {
        AmenityDTO amenity = amenityService.getAmenityById(amenityId);
        return ResponseEntity.ok(ApiResponse.success(amenity));
    }

    @PostMapping("/admin/amenities")
    public ResponseEntity<ApiResponse<AmenityDTO>> createAmenity(@Valid @RequestBody AmenityDTO amenityDTO) {
        AmenityDTO created = amenityService.createAmenity(amenityDTO);
        return new ResponseEntity<>(ApiResponse.success(created), HttpStatus.CREATED);
    }

    @PutMapping("/admin/amenities/{amenityId}")
    public ResponseEntity<ApiResponse<AmenityDTO>> updateAmenity(
            @PathVariable Integer amenityId,
            @Valid @RequestBody AmenityDTO amenityDTO) {

        AmenityDTO updated = amenityService.updateAmenity(amenityId, amenityDTO);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/admin/amenities/{amenityId}")
    public ResponseEntity<ApiResponse<String>> deleteAmenity(@PathVariable Integer amenityId) {
        String message = amenityService.deleteAmenity(amenityId);
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}