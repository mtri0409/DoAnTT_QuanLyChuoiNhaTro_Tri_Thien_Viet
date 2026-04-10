package com.trithienviet.qlchuoiphongtro.scheduler;

import lombok.extern.slf4j.Slf4j;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.trithienviet.qlchuoiphongtro.service.InvoiceService;

@Component
@Slf4j

public class InvoiceScheduler {
    @Autowired
    private InvoiceService invoiceService;

    @Scheduled(cron = "0 0 8 * * *")
    public void scheduledAutoGenerate() {
        LocalDate today = LocalDate.now();
        invoiceService.autoGenerateInvoices(today.getMonthValue(), today.getYear());
    }

    @Scheduled(cron = "0 49 14 * * *")
    public void scheduleRemidOverBill(){
        invoiceService.remindInvoice();
    }
    
}
