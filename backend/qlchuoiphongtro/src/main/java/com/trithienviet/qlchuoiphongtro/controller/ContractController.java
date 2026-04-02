package com.trithienviet.qlchuoiphongtro.controller;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ContractServiceDTO;
import com.trithienviet.qlchuoiphongtro.service.ContractService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    // ==================== Helper tạo Pageable ====================
    private Pageable buildPageable(int pageNumber, int pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        return PageRequest.of(pageNumber, pageSize, sort);
    }

    // ==================== CREATE ====================
    @PostMapping
    public ResponseEntity<ContractDTO> create(@RequestBody ContractDTO dto) {
        ContractDTO created = contractService.createContract(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ==================== GET ALL (phân trang) ====================
    @GetMapping
    public ResponseEntity<Page<ContractDTO>> getAll(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(contractService.getAllContracts(pageable));
    }

    // ==================== SEARCH (phân trang) ====================
    @GetMapping("/search")
    public ResponseEntity<Page<ContractDTO>> search(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(contractService.searchContracts(keyword, pageable));
    }

    // ==================== GET BY ID ====================
    @GetMapping("/{id}")
    public ResponseEntity<ContractDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.getContractById(id));
    }

    // ==================== GET BY STATUS (phân trang) ====================
    @GetMapping("/status/{status}")
    public ResponseEntity<Page<ContractDTO>> getByStatus(
            @PathVariable ContractStatus status,
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "contractId") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {
        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        return ResponseEntity.ok(contractService.getContractsByStatus(status, pageable));
    }

    // ==================== UPDATE ====================
    @PutMapping("/{id}")
    public ResponseEntity<ContractDTO> update(
            @PathVariable Long id,
            @RequestBody ContractDTO dto) {
        ContractDTO updated = contractService.updateContract(id, dto);
        return ResponseEntity.ok(updated);
    }

    // ==================== UPDATE STATUS ====================
    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long id,
            @RequestBody ContractStatus newStatus) {
        contractService.updateStatus(id, newStatus);
        return ResponseEntity.ok("Contract status updated successfully to: " + newStatus);
    }

    // ==================== DELETE ====================
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        contractService.deleteContract(id);
        return ResponseEntity.ok("Contract deleted successfully");
    }

    // ==================== AUTO UPDATE STATUS ====================
    @PostMapping("/auto-update-status")
    public ResponseEntity<?> autoUpdateStatus() {
        List<ContractDTO> updated = contractService.autoUpdateStatus();
        return ResponseEntity.ok(
                Map.of(
                        "updatedCount", updated.size(),
                        "contracts", updated));
    }

    // ==================== MEMBERS ====================
    @PostMapping("/{contractId}/members/{profileId}")
    public ResponseEntity<String> addMember(
            @PathVariable Long contractId,
            @PathVariable Long profileId) {
        contractService.addMember(contractId, profileId);
        return ResponseEntity.ok("Member added successfully");
    }

    @DeleteMapping("/{contractId}/members/{profileId}")
    public ResponseEntity<String> removeMember(
            @PathVariable Long contractId,
            @PathVariable Long profileId) {
        contractService.removeMember(contractId, profileId);
        return ResponseEntity.ok("Member removed successfully");
    }

    @GetMapping("/{contractId}/members")
    public ResponseEntity<List<Long>> getMembers(@PathVariable Long contractId) {
        return ResponseEntity.ok(contractService.getMemberIds(contractId));
    }

    // ==================== GET BY ROOM ====================
    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<ContractDTO>> getByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(contractService.getContractsByRoom(roomId));
    }

    // ==================== SERVICES ====================
    @GetMapping("/{contractId}/services")
    public ResponseEntity<Map<String, List<ContractServiceDTO>>> getServices(
            @PathVariable Long contractId) {
        return ResponseEntity.ok(Map.of("services", contractService.getServicesByContract(contractId)));
    }

    @PostMapping("/{contractId}/services")
    public ResponseEntity<Map<String, String>> addServices(
            @PathVariable Long contractId,
            @RequestBody List<ContractServiceDTO> services) {
        contractService.addServices(contractId, services);
        return ResponseEntity.ok(Map.of("message", "Add services to contract successfully"));
    }

    @PutMapping("/services/{id}")
    public ResponseEntity<Map<String, String>> updateService(
            @PathVariable Integer id,
            @RequestBody ContractServiceDTO dto) {
        contractService.updateService(id, dto);
        return ResponseEntity.ok(Map.of("message", "Update contract service successfully"));
    }

    @DeleteMapping("/services/{id}")
    public ResponseEntity<Map<String, String>> deleteService(@PathVariable Integer id) {
        contractService.deleteService(id);
        return ResponseEntity.ok(Map.of("message", "Delete contract service successfully"));
    }
}