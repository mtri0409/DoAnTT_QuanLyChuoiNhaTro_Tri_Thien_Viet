package com.trithienviet.qlchuoiphongtro.controller;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.payloads.DepositDTO;
import com.trithienviet.qlchuoiphongtro.service.DepositService;

@RestController
@RequestMapping("/api")
public class DepositController {

    @Autowired
    private DepositService depositService;

    // Lấy tiền cọc theo phòng
    @GetMapping("/public/deposits/room/{roomId}")
    public ResponseEntity<DepositDTO> getDepositByRoom(@PathVariable Long roomId) {
        DepositDTO dto = depositService.getDepositByRoomId(roomId);
        if (dto == null) return ResponseEntity.noContent().build();
        return ResponseEntity.ok(dto);
    }

    // Tạo tiền cọc cho phòng (dùng khi cần tạo độc lập ngoài room)
    @PostMapping("/admin/deposits/room/{roomId}")
    public ResponseEntity<DepositDTO> createDeposit(
            @PathVariable Long roomId,
            @RequestParam BigDecimal amount) {
        return new ResponseEntity<>(depositService.createDeposit(roomId, amount), HttpStatus.CREATED);
    }

    // Cập nhật tiền cọc
    @PutMapping("/admin/deposits/room/{roomId}")
    public ResponseEntity<DepositDTO> updateDeposit(
            @PathVariable Long roomId,
            @RequestParam BigDecimal amount) {
        return ResponseEntity.ok(depositService.updateDepositAmount(roomId, amount));
    }
}