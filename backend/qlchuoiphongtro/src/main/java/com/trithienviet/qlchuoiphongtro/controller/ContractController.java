package com.trithienviet.qlchuoiphongtro.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.service.ContractService;
import com.trithienviet.qlchuoiphongtro.payloads.ContractDTO;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @PostMapping
    public ResponseEntity<ContractDTO> create(@RequestBody ContractDTO dto) {
        return ResponseEntity.ok(contractService.createContract(dto));
    }

    @GetMapping
    public ResponseEntity<List<ContractDTO>> getAll() {
        return ResponseEntity.ok(contractService.getAllContracts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contractService.getContractById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractDTO> update(
            @PathVariable Long id,
            @RequestBody ContractDTO dto) {
        return ResponseEntity.ok(contractService.updateContract(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        contractService.deleteContract(id);
        return ResponseEntity.ok("Deleted successfully");
    }
}
