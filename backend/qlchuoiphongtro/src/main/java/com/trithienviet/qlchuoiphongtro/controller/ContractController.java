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
import com.trithienviet.qlchuoiphongtro.service.ContractService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping("/admin/contracts")
    public ResponseEntity<ContractDTO> create(@RequestBody ContractDTO dto) {
        ContractDTO created = contractService.createContract(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/admin/contracts")
    public ResponseEntity<PageResponse<ContractDTO>> getAll(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) int pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {
        PageResponse<ContractDTO> response = contractService.getAllContracts(
                Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/admin/contracts/filter")
    public ResponseEntity<PageResponse<ContractDTO>> filter(
            @RequestParam(required = false) ContractStatus status,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) int pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {
        PageResponse<ContractDTO> response = contractService.filterContracts(
                status, branchId, Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/admin/contracts/search")
    public ResponseEntity<PageResponse<ContractDTO>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) int pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {
        PageResponse<ContractDTO> response = contractService.searchContracts(
                keyword, Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/user/contracts/{id}")
    public ResponseEntity<ContractDTO> getById(@PathVariable Long id) {
        ContractDTO contract = contractService.getContractById(id);
        return new ResponseEntity<>(contract, HttpStatus.OK);
    }

    @GetMapping("/admin/contracts/status/{status}")
    public ResponseEntity<PageResponse<ContractDTO>> getByStatus(
            @PathVariable ContractStatus status,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER) int pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE) int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR) String sortOrder) {
        PageResponse<ContractDTO> response = contractService.getContractsByStatus(
                status, Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/user/contracts/{id}")
    public ResponseEntity<ContractDTO> update(
            @PathVariable Long id,
            @RequestBody ContractDTO dto) {
        ContractDTO updated = contractService.updateContract(id, dto);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @PutMapping("/admin/contracts/{id}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long id,
            @RequestBody ContractStatus newStatus) {
        contractService.updateStatus(id, newStatus);
        String message = "Contract status updated successfully to: " + newStatus;
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @DeleteMapping("/admin/contracts/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        contractService.deleteContract(id);
        return new ResponseEntity<>("Contract deleted successfully", HttpStatus.OK);
    }

    @PostMapping("/admin/contracts/status-updates")
    public ResponseEntity<Map<String, Object>> autoUpdateStatus() {
        List<ContractDTO> updated = contractService.autoUpdateStatus();
        Map<String, Object> response = Map.of(
                "updatedCount", updated.size(),
                "contracts", updated);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/user/contracts/{contractId}/members/{profileId}")
    public ResponseEntity<String> addMember(
            @PathVariable Long contractId,
            @PathVariable Long profileId) {
        contractService.addMember(contractId, profileId);
        return new ResponseEntity<>("Member added successfully", HttpStatus.OK);
    }

    @DeleteMapping("/user/contracts/{contractId}/members/{profileId}")
    public ResponseEntity<String> removeMember(
            @PathVariable Long contractId,
            @PathVariable Long profileId) {
        contractService.removeMember(contractId, profileId);
        return new ResponseEntity<>("Member removed successfully", HttpStatus.OK);
    }

    @GetMapping("/user/contracts/{contractId}/members")
    public ResponseEntity<List<Long>> getMembers(@PathVariable Long contractId) {
        List<Long> memberIds = contractService.getMemberIds(contractId);
        return new ResponseEntity<>(memberIds, HttpStatus.OK);
    }

    @GetMapping("/user/contracts/room/{roomId}")
    public ResponseEntity<List<ContractDTO>> getByRoom(@PathVariable Long roomId) {
        List<ContractDTO> contracts = contractService.getContractsByRoom(roomId);
        return new ResponseEntity<>(contracts, HttpStatus.OK);
    }

    @GetMapping("/user/contracts/{contractId}/services")
    public ResponseEntity<Map<String, List<ContractServiceDTO>>> getServices(
            @PathVariable Long contractId) {
        List<ContractServiceDTO> services = contractService.getServicesByContract(contractId);
        Map<String, List<ContractServiceDTO>> response = Map.of("services", services);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/user/contracts/{contractId}/services")
    public ResponseEntity<Map<String, String>> addServices(
            @PathVariable Long contractId,
            @RequestBody List<ContractServiceDTO> services) {
        contractService.addServices(contractId, services);
        Map<String, String> response = Map.of("message", "Add services to contract successfully");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/user/contracts/services/{id}")
    public ResponseEntity<Map<String, String>> updateService(
            @PathVariable Integer id,
            @RequestBody ContractServiceDTO dto) {
        contractService.updateService(id, dto);
        Map<String, String> response = Map.of("message", "Update contract service successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/user/contracts/services/{id}")
    public ResponseEntity<Map<String, String>> deleteService(@PathVariable Integer id) {
        contractService.deleteService(id);
        Map<String, String> response = Map.of("message", "Delete contract service successfully");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/admin/contracts/{id}/termination")
    public ResponseEntity<String> terminate(
            @PathVariable Long id,
            @RequestBody(required = false) TerminateContractRequest request) {
        String reason = (request != null) ? request.getReason() : null;
        contractService.terminateContract(id, reason);
        return new ResponseEntity<>("Contract terminated successfully", HttpStatus.OK);
    }
}
