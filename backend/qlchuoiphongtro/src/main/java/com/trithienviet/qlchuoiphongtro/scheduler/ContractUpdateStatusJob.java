package com.trithienviet.qlchuoiphongtro.scheduler;

import com.trithienviet.qlchuoiphongtro.service.ContractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContractUpdateStatusJob implements SchedulerJob {

    private final ContractService contractService;

    @Override
    public String getCodeKey() {
        return "CONTRACT_UPDATE_STATUS";
    }

    @Override
    public void run() {
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
