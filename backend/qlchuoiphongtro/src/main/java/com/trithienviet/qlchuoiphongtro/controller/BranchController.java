package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.BranchDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ApiResponse;
import com.trithienviet.qlchuoiphongtro.service.BranchService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
public class BranchController {

    @Autowired
    private BranchService branchService;

    // ── Public: Danh sách chi nhánh (vãng lai) ──────────────────────
    @GetMapping("/public/branches")
    public ResponseEntity<ApiResponse<PageResponse<BranchDTO>>> getAllBranchesPublic(
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = "branchId", required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        PageResponse<BranchDTO> response = branchService.getAllBranches(
                Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(ApiResponse.success(response), HttpStatus.OK);
    }

    // ── Internal: Danh sách chi nhánh (cần auth) ─────────────────────
    @GetMapping("/admin/branches")
    public ResponseEntity<ApiResponse<PageResponse<BranchDTO>>> getAllBranches(
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = "branchId", required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        PageResponse<BranchDTO> response = branchService.getAllBranches(
                Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(ApiResponse.success(response), HttpStatus.OK);
    }

    // ── Public: Chi tiết chi nhánh (vãng lai) ────────────────────────
    @GetMapping("/public/branches/{id}")
    public ResponseEntity<ApiResponse<BranchDTO>> getBranchByIdPublic(@PathVariable Long id) {
        BranchDTO branchDTO = branchService.getBranchById(id);
        return new ResponseEntity<>(ApiResponse.success(branchDTO), HttpStatus.OK);
    }

    // ── Internal: Chi tiết chi nhánh (cần auth) ──────────────────────
    @GetMapping("/admin/branches/{id}")
    public ResponseEntity<ApiResponse<BranchDTO>> getBranchById(@PathVariable Long id) {
        BranchDTO branchDTO = branchService.getBranchById(id);
        return new ResponseEntity<>(ApiResponse.success(branchDTO), HttpStatus.OK);
    }

    @PostMapping("/admin/branches")
    public ResponseEntity<ApiResponse<BranchDTO>> createBranch(@Valid @RequestBody BranchDTO branchDTO) {
        BranchDTO savedBranch = branchService.createBranch(branchDTO);
        return new ResponseEntity<>(ApiResponse.success(savedBranch), HttpStatus.CREATED);
    }

    @PutMapping("/admin/branches/{id}")
    public ResponseEntity<ApiResponse<BranchDTO>> updateBranch(
            @PathVariable Long id,
            @Valid @RequestBody BranchDTO branchDTO) {

        BranchDTO updatedBranch = branchService.updateBranch(id, branchDTO);
        return new ResponseEntity<>(ApiResponse.success(updatedBranch), HttpStatus.OK);
    }

    @DeleteMapping("/admin/branches/{id}")
    public ResponseEntity<ApiResponse<String>> deleteBranch(@PathVariable Long id) {
        String message = branchService.deleteBranch(id);
        return new ResponseEntity<>(ApiResponse.success(message), HttpStatus.OK);
    }
}