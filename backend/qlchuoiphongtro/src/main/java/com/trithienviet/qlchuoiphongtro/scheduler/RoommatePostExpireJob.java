package com.trithienviet.qlchuoiphongtro.scheduler;

import com.trithienviet.qlchuoiphongtro.service.RoommatePostService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoommatePostExpireJob implements SchedulerJob {

    private final RoommatePostService roommatePostService;

    @Override
    public String getCodeKey() {
        return "ROOMMATE_POST_EXPIRE";
    }

    @Override
    public void run() {
        log.info("--- BẮT ĐẦU QUÉT BÀI ĐĂNG TÌM BẠN GHÉP HẾT HẠN ---");
        roommatePostService.expireOldPosts();
        log.info("--- KẾT THÚC QUÉT BÀI ĐĂNG HẾT HẠN ---");
    }
}
