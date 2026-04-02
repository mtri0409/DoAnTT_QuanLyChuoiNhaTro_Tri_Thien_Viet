package com.trithienviet.qlchuoiphongtro.scheduler;

import com.trithienviet.qlchuoiphongtro.service.ContractService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ContractScheduler {

    @Autowired
    private ContractService contractService;

    // Cron chạy vào 00:01 sáng mỗi ngày
    @Scheduled(cron = "0 41 21 * * *")
    public void runAutoUpdateStatus() {
        log.info("--- BẮT ĐẦU QUÉT VÀ CẬP NHẬT TRẠNG THÁI HỢP ĐỒNG TỰ ĐỘNG ---");
        
        try {
            var updatedList = contractService.autoUpdateStatus();
            
            log.info("Cập nhật thành công {} hợp đồng.", updatedList.size());
        } catch (Exception e) {
            log.error("Lỗi khi cập nhật trạng thái hợp đồng tự động: ", e);
        }
        
        log.info("--- KẾT THÚC QUÉT HỢP ĐỒNG ---");
    }
}