package com.trithienviet.qlchuoiphongtro.scheduler;

import com.trithienviet.qlchuoiphongtro.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Slf4j
@Component
@RequiredArgsConstructor
public class InvoiceAutoGenerateJob implements SchedulerJob {

    private final InvoiceService invoiceService;

    @Override
    public String getCodeKey() {
        return "INVOICE_AUTO_GENERATE";
    }

    @Override
    public void run() {
        log.info("--- BẮT ĐẦU TỰ ĐỘNG TẠO HÓA ĐƠN ---");
        LocalDate today = LocalDate.now();
        invoiceService.autoGenerateInvoices(today.getMonthValue(), today.getYear());
        log.info("--- KẾT THÚC TỰ ĐỘNG TẠO HÓA ĐƠN ---");
    }
}
