package com.trithienviet.qlchuoiphongtro.scheduler;

import com.trithienviet.qlchuoiphongtro.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class InvoiceRemindJob implements SchedulerJob {

    private final InvoiceService invoiceService;

    @Override
    public String getCodeKey() {
        return "INVOICE_REMIND_OVERDUE";
    }

    @Override
    public void run() {
        log.info("--- BẮT ĐẦU NHẮC NHỞ HÓA ĐƠN QUÁ HẠN ---");
        invoiceService.remindInvoice();
        log.info("--- KẾT THÚC NHẮC NHỞ HÓA ĐƠN ---");
    }
}
