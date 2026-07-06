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
@RequestMapping("/api/v1")
public class DepositController {

    @Autowired
    private DepositService depositService;

    @GetMapping("/public/deposits/room/{roomId}")
    public ResponseEntity<DepositDTO> getDepositByRoom(@PathVariable Long roomId) {
        DepositDTO dto = depositService.getDepositByRoomId(roomId);
        if (dto == null) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(dto, HttpStatus.OK);
    }

    @PostMapping("/admin/deposits/room/{roomId}")
    public ResponseEntity<DepositDTO> createDeposit(
            @PathVariable Long roomId,
            @RequestParam BigDecimal amount) {
        return new ResponseEntity<>(depositService.createDeposit(roomId, amount), HttpStatus.CREATED);
    }

    @PutMapping("/admin/deposits/room/{roomId}")
    public ResponseEntity<DepositDTO> updateDeposit(
            @PathVariable Long roomId,
            @RequestParam BigDecimal amount) {
        return new ResponseEntity<>(depositService.updateDepositAmount(roomId, amount), HttpStatus.OK);
    }
}
