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
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;
import com.trithienviet.qlchuoiphongtro.service.ContractService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping
    public ResponseEntity<ContractDTO> create(@RequestBody ContractDTO dto) {
        ContractDTO created = contractService.createContract(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ContractDTO>> getAll() {
        return ResponseEntity.ok(contractService.getAllContracts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.getContractById(id));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ContractDTO>> getByStatus(@PathVariable ContractStatus status) {
        return ResponseEntity.ok(contractService.getContractsByStatus(status));
    }

    /**
     * Cập nhật thông tin cơ bản hợp đồng (chỉ dành cho PENDING)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ContractDTO> update(
            @PathVariable Long id,
            @RequestBody ContractDTO dto) {
        ContractDTO updated = contractService.updateContract(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Cập nhật trạng thái hợp đồng (ví dụ: PENDING → ACTIVE, ACTIVE →
     * TERMINATED...)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateStatus(
            @PathVariable Long id,
            @RequestBody ContractStatus newStatus) {

        contractService.updateStatus(id, newStatus);
        return ResponseEntity.ok("Contract status updated successfully to: " + newStatus);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        contractService.deleteContract(id);
        return ResponseEntity.ok("Contract deleted successfully");
    }

    /**
     * Endpoint hỗ trợ tự động cập nhật trạng thái (dành cho Scheduler hoặc admin
     * gọi thủ công)
     */
    @PostMapping("/auto-update-status")
    public ResponseEntity<?> autoUpdateStatus() {

        List<ContractDTO> updated = contractService.autoUpdateStatus();

        return ResponseEntity.ok(
                Map.of(
                        "updatedCount", updated.size(),
                        "contracts", updated));
    }
}