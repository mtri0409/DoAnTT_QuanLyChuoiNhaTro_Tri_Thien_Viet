package com.trithienviet.qlchuoiphongtro.service.impl;

import java.math.BigDecimal;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.trithienviet.qlchuoiphongtro.entity.Deposit;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.DepositDTO;
import com.trithienviet.qlchuoiphongtro.repo.DepositRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.service.DepositService;

@Service
public class DepositServiceImpl implements DepositService {

    @Autowired
    private DepositRepo depositRepo;

    @Autowired
    private RoomRepo roomRepo;

    @Override
    public DepositDTO getDepositByRoomId(Long roomId) {
        return depositRepo.findByRoom_RoomId(roomId)
                .map(this::toDTO)
                .orElse(null);
    }

    @Override
    public DepositDTO createDeposit(Long roomId, BigDecimal amount) {
        Room room = roomRepo.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));

        Deposit deposit = new Deposit();
        deposit.setRoom(room);
        deposit.setAmount(amount);
        deposit.setStatus("BOOKED");
        // profile, contract, invoice để null — chỉ giữ chỗ tiền cọc

        return toDTO(depositRepo.save(deposit));
    }

    @Override
    @Transactional
    public DepositDTO updateDepositAmount(Long roomId, BigDecimal amount) {
        Deposit deposit = depositRepo.findByRoom_RoomId(roomId)
                .orElseGet(() -> {
                    // Chưa có deposit → tạo mới
                    Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new ResourceNotFoundException("Room", "roomId", roomId));
                    Deposit d = new Deposit();
                    d.setRoom(room);
                    d.setStatus("BOOKED");
                    return d;
                });

        deposit.setAmount(amount);
        return toDTO(depositRepo.save(deposit));
    }

    private DepositDTO toDTO(Deposit d) {
        DepositDTO dto = new DepositDTO();
        dto.setDespositId(d.getDepositId());
        dto.setRoomId(d.getRoom() != null ? d.getRoom().getRoomId() : null);
        dto.setAmount(d.getAmount());
        dto.setStatus(d.getStatus());
        if (d.getContract() != null) {
            dto.setContractId(d.getContract().getContractId());
        }
        return dto;
    }
}