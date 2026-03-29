package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.BranchDTO;
import com.trithienviet.qlchuoiphongtro.service.BranchService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Manager Room Application")
public class BranchController {

    @Autowired
    private BranchService branchService;

    // ✅ GET ALL (FIX sortBy = branchId)
    @GetMapping("/admin/branches")
    public ResponseEntity<PageResponse<BranchDTO>> getAllBranches(
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = "branchId", required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        PageResponse<BranchDTO> response = branchService.getAllBranches(
                Math.max(0, pageNumber - 1),
                pageSize,
                sortBy,
                sortOrder
        );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    // ✅ GET BY ID
    @GetMapping("/public/branches/{id}")
    public ResponseEntity<BranchDTO> getBranchById(@PathVariable Long id) {
        BranchDTO branchDTO = branchService.getBranchById(id);
        return new ResponseEntity<>(branchDTO, HttpStatus.OK);
    }

    // ✅ CREATE
    @PostMapping("/admin/branches")
    public ResponseEntity<BranchDTO> createBranch(@Valid @RequestBody BranchDTO branchDTO) {
        BranchDTO savedBranch = branchService.createBranch(branchDTO);
        return new ResponseEntity<>(savedBranch, HttpStatus.CREATED);
    }

    // ✅ UPDATE
    @PutMapping("/admin/branches/{id}")
    public ResponseEntity<BranchDTO> updateBranch(
            @PathVariable Long id,
            @Valid @RequestBody BranchDTO branchDTO) {

        BranchDTO updatedBranch = branchService.updateBranch(id, branchDTO);
        return new ResponseEntity<>(updatedBranch, HttpStatus.OK);
    }

    // ✅ DELETE (bonus thêm luôn cho đủ CRUD)
    @DeleteMapping("/admin/branches/{id}")
    public ResponseEntity<String> deleteBranch(@PathVariable Long id) {
        String message = branchService.deleteBranch(id);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}