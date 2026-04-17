package com.trithienviet.qlchuoiphongtro.scheduler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.trithienviet.qlchuoiphongtro.service.ProfileService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ProfileSchdeuler {
    @Autowired
    private ProfileService profileService;

    
    @Scheduled(cron = "0 5 22 * * *")
    public void scheduledRemidUpdateProfile() {
         log.info("--- BẮT ĐẦU QUÉT  ---");
        profileService.remidUpdateIdentification();
        log.info("--- KẾT THÚC QUÉT  ---");

    }
}
