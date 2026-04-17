package com.trithienviet.qlchuoiphongtro.payloads;

import java.util.List;

public record DashboardRemindersDTO(
    List<ExpiringContractDTO> expiringContracts,
    List<PendingInvoiceDTO> pendingInvoices
) {}