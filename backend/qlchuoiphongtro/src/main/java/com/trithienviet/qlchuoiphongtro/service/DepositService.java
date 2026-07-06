package com.trithienviet.qlchuoiphongtro.service;

import java.math.BigDecimal;

import com.trithienviet.qlchuoiphongtro.payloads.DepositDTO;

public interface DepositService {

    DepositDTO getDepositByRoomId(Long roomId);

    DepositDTO createDeposit(Long roomId, BigDecimal amount);

    DepositDTO updateDepositAmount(Long roomId, BigDecimal amount);
}