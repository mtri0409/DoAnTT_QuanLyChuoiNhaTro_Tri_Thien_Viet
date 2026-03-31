package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ServiveDTO;
import com.trithienviet.qlchuoiphongtro.service.ServiceService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Manager Room Application")
public class ServiceController {

    @Autowired
    private ServiceService serviceService;

    // ✅ GET ALL
    @GetMapping("/admin/services")
    public ResponseEntity<PageResponse<ServiveDTO>> getAllServices(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = "serviceId", required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        PageResponse<ServiveDTO> response = serviceService.getAllServices(
                Math.max(0, pageNumber - 1),
                pageSize,
                sortBy,
                sortOrder
        );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ✅ GET BY ID
    @GetMapping("/public/services/{id}")
    public ResponseEntity<ServiveDTO> getServiceById(@PathVariable Integer id) {
        ServiveDTO dto = serviceService.getServiceById(id);
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    // ✅ CREATE
    @PostMapping("/admin/services")
    public ResponseEntity<ServiveDTO> createService(@Valid @RequestBody ServiveDTO dto) {
        ServiveDTO saved = serviceService.createService(dto);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // ✅ UPDATE
    @PutMapping("/admin/services/{id}")
    public ResponseEntity<ServiveDTO> updateService(
            @PathVariable Integer id,
            @Valid @RequestBody ServiveDTO dto) {

        ServiveDTO updated = serviceService.updateService(id, dto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    // ✅ DELETE
    @DeleteMapping("/admin/services/{id}")
    public ResponseEntity<String> deleteService(@PathVariable Integer id) {
        String message = serviceService.deleteService(id);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}