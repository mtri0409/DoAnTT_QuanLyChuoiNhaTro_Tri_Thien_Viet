package com.trithienviet.qlchuoiphongtro.scheduler;

import com.trithienviet.qlchuoiphongtro.service.ProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProfileRemindJob implements SchedulerJob {

    private final ProfileService profileService;

    @Override
    public String getCodeKey() {
        return "PROFILE_REMIND_IDENTIFICATION";
    }

    @Override
    public void run() {
        log.info("--- BẮT ĐẦU QUÉT NHẮC NHỞ CẬP NHẬT CCCD ---");
        profileService.remidUpdateIdentification();
        log.info("--- KẾT THÚC QUÉT NHẮC NHỞ CCCD ---");
    }
}
