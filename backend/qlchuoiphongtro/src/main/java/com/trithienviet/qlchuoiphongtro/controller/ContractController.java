package com.trithienviet.qlchuoiphongtro.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ContractServiceDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.TerminateContractRequest;
import com.trithienviet.qlchuoiphongtro.payloads.ApiResponse;
import com.trithienviet.qlchuoiphongtro.service.ContractService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    // ==================== CREATE (Admin) ====================
    @PostMapping("/admin/contracts")
    public ResponseEntity<ApiResponse<ContractDTO>> create(@RequestBody ContractDTO dto) {
        ContractDTO created = contractService.createContract(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(created));
    }

    // ==================== GET ALL (Admin, phân trang) ====================
    @GetMapping("/admin/contracts")
    public ResponseEntity<ApiResponse<PageResponse<ContractDTO>>> getAll(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) int pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {
        return ResponseEntity.ok(ApiResponse.success(contractService.getAllContracts(
                Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder)));
    }

    // ==================== FILTER (Admin, lọc theo status + branchId, phân trang)
    // ====================
    // [FIX] Endpoint mới thay thế việc lọc chi nhánh client-side
    // GET
    // /api/admin/contracts/filter?status=ACTIVE&branchId=2&pageNumber=1&pageSize=10
    @GetMapping("/admin/contracts/filter")
    public ResponseEntity<ApiResponse<PageResponse<ContractDTO>>> filter(
            @RequestParam(required = false) ContractStatus status,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) int pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {
        return ResponseEntity.ok(ApiResponse.success(contractService.filterContracts(
                status, branchId, Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder)));
    }

    // ==================== SEARCH (Admin, phân trang) ====================
    @GetMapping("/admin/contracts/search")
    public ResponseEntity<ApiResponse<PageResponse<ContractDTO>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) int pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {
        return ResponseEntity.ok(ApiResponse.success(contractService.searchContracts(
                keyword, Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder)));
    }

    // ==================== GET BY ID (Public) ====================
    @GetMapping("/user/contracts/{id}")
    public ResponseEntity<ApiResponse<ContractDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(contractService.getContractById(id)));
    }

    // ==================== GET BY STATUS (Admin, phân trang) ====================
    @GetMapping("/admin/contracts/status/{status}")
    public ResponseEntity<ApiResponse<PageResponse<ContractDTO>>> getByStatus(
            @PathVariable ContractStatus status,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) int pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {
        return ResponseEntity.ok(ApiResponse.success(contractService.getContractsByStatus(
                status, Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder)));
    }

    // ==================== UPDATE (Public) ====================
    @PutMapping("/user/contracts/{id}")
    public ResponseEntity<ApiResponse<ContractDTO>> update(
            @PathVariable Long id,
            @RequestBody ContractDTO dto) {
        ContractDTO updated = contractService.updateContract(id, dto);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    // ==================== UPDATE STATUS (Admin) ====================
    @PutMapping("/admin/contracts/{id}/status")
    public ResponseEntity<ApiResponse<String>> updateStatus(
            @PathVariable Long id,
            @RequestBody ContractStatus newStatus) {
        contractService.updateStatus(id, newStatus);
        return ResponseEntity.ok(ApiResponse.success("Contract status updated successfully to: " + newStatus));
    }

    // ==================== DELETE (Admin) ====================
    @DeleteMapping("/admin/contracts/{id}")
    public ResponseEntity<ApiResponse<String>> delete(@PathVariable Long id) {
        contractService.deleteContract(id);
        return ResponseEntity.ok(ApiResponse.success("Contract deleted successfully"));
    }

    // ==================== AUTO UPDATE STATUS (Admin) ====================
    @PostMapping("/admin/contracts/status-updates")
    public ResponseEntity<ApiResponse<Map<String, Object>>> autoUpdateStatus() {
        List<ContractDTO> updated = contractService.autoUpdateStatus();
        return ResponseEntity.ok(ApiResponse.success(
                Map.of(
                        "updatedCount", updated.size(),
                        "contracts", updated)));
    }

    // ==================== MEMBERS (User/Tenant) ====================
    @PostMapping("/user/contracts/{contractId}/members/{profileId}")
    public ResponseEntity<ApiResponse<String>> addMember(
            @PathVariable Long contractId,
            @PathVariable Long profileId) {
        contractService.addMember(contractId, profileId);
        return ResponseEntity.ok(ApiResponse.success("Member added successfully"));
    }

    @DeleteMapping("/user/contracts/{contractId}/members/{profileId}")
    public ResponseEntity<ApiResponse<String>> removeMember(
            @PathVariable Long contractId,
            @PathVariable Long profileId) {
        contractService.removeMember(contractId, profileId);
        return ResponseEntity.ok(ApiResponse.success("Member removed successfully"));
    }

    @GetMapping("/user/contracts/{contractId}/members")
    public ResponseEntity<ApiResponse<List<Long>>> getMembers(@PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.success(contractService.getMemberIds(contractId)));
    }

    // ==================== GET BY ROOM (User/Tenant) ====================
    @GetMapping("/user/contracts/room/{roomId}")
    public ResponseEntity<ApiResponse<List<ContractDTO>>> getByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(ApiResponse.success(contractService.getContractsByRoom(roomId)));
    }

    // ==================== SERVICES (User/Tenant) ====================
    @GetMapping("/user/contracts/{contractId}/services")
    public ResponseEntity<ApiResponse<Map<String, List<ContractServiceDTO>>>> getServices(
            @PathVariable Long contractId) {
        return ResponseEntity.ok(ApiResponse.success(Map.of("services", contractService.getServicesByContract(contractId))));
    }

    @PostMapping("/user/contracts/{contractId}/services")
    public ResponseEntity<ApiResponse<Map<String, String>>> addServices(
            @PathVariable Long contractId,
            @RequestBody List<ContractServiceDTO> services) {
        contractService.addServices(contractId, services);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Add services to contract successfully")));
    }

    @PutMapping("/user/contracts/services/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> updateService(
            @PathVariable Integer id,
            @RequestBody ContractServiceDTO dto) {
        contractService.updateService(id, dto);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Update contract service successfully")));
    }

    @DeleteMapping("/user/contracts/services/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteService(@PathVariable Integer id) {
        contractService.deleteService(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("message", "Delete contract service successfully")));
    }

    @PostMapping("/admin/contracts/{id}/termination")
    public ResponseEntity<ApiResponse<String>> terminate(
            @PathVariable Long id,
            @RequestBody(required = false) TerminateContractRequest request) {
        String reason = (request != null) ? request.getReason() : null;
        contractService.terminateContract(id, reason);
        return ResponseEntity.ok(ApiResponse.success("Contract terminated successfully"));
    }
}