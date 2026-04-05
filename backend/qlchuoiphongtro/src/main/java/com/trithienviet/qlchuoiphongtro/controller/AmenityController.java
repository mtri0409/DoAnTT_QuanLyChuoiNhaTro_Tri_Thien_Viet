package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.AmenityDTO;
import com.trithienviet.qlchuoiphongtro.service.AmenityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class AmenityController {

    @Autowired
    private AmenityService amenityService;

    @GetMapping("/amenities")
    public ResponseEntity<PageResponse<AmenityDTO>> getAllAmenities(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "amenityName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        PageResponse<AmenityDTO> response = amenityService.getAllAmenities(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/public/amenities/{amenityId}")
    public ResponseEntity<AmenityDTO> getAmenityById(@PathVariable Integer amenityId) {
        AmenityDTO amenity = amenityService.getAmenityById(amenityId);
        return ResponseEntity.ok(amenity);
    }

    @PostMapping("/admin/amenities")
    public ResponseEntity<AmenityDTO> createAmenity(@Valid @RequestBody AmenityDTO amenityDTO) {
        AmenityDTO created = amenityService.createAmenity(amenityDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/admin/amenities/{amenityId}")
    public ResponseEntity<AmenityDTO> updateAmenity(
            @PathVariable Integer amenityId,
            @Valid @RequestBody AmenityDTO amenityDTO) {

        AmenityDTO updated = amenityService.updateAmenity(amenityId, amenityDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/amenities/{amenityId}")
    public ResponseEntity<String> deleteAmenity(@PathVariable Integer amenityId) {
        String message = amenityService.deleteAmenity(amenityId);
        return ResponseEntity.ok(message);
    }
}