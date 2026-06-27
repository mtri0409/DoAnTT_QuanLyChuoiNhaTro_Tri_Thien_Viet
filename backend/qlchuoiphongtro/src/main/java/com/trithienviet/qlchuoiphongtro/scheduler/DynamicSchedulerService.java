package com.trithienviet.qlchuoiphongtro.scheduler;

import com.trithienviet.qlchuoiphongtro.entity.SchedulerConfig;
import com.trithienviet.qlchuoiphongtro.repo.SchedulerConfigRepo;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.scheduling.support.CronTrigger;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ScheduledFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicSchedulerService {

    private final SchedulerConfigRepo configRepo;
    private final List<SchedulerJob> jobList;

    private final Map<String, ScheduledFuture<?>> scheduledTasks = new ConcurrentHashMap<>();
    private final Map<String, SchedulerJob> jobRegistry = new HashMap<>();
    private final ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();

    private static final List<SchedulerConfig> DEFAULT_CONFIGS = List.of(
            SchedulerConfig.builder()
                    .codeKey("INVOICE_AUTO_GENERATE")
                    .name("Tự động tạo hóa đơn")
                    .cronExpression("0 0 8 * * *")
                    .isActive(true)
                    .description("Tự động tạo hóa đơn hàng tháng cho các hợp đồng đến ngày xuất hóa đơn")
                    .build(),
            SchedulerConfig.builder()
                    .codeKey("INVOICE_REMIND_OVERDUE")
                    .name("Nhắc nhở hóa đơn quá hạn")
                    .cronExpression("0 49 14 * * *")
                    .isActive(true)
                    .description("Gửi thông báo nhắc nhở thanh toán cho các hóa đơn quá hạn")
                    .build(),
            SchedulerConfig.builder()
                    .codeKey("CONTRACT_UPDATE_STATUS")
                    .name("Cập nhật trạng thái hợp đồng")
                    .cronExpression("0 39 9 * * *")
                    .isActive(true)
                    .description("Tự động cập nhật trạng thái hợp đồng hết hạn hoặc bị hủy")
                    .build(),
            SchedulerConfig.builder()
                    .codeKey("PROFILE_REMIND_IDENTIFICATION")
                    .name("Nhắc nhở cập nhật CCCD")
                    .cronExpression("0 5 22 * * *")
                    .isActive(true)
                    .description("Nhắc nhở người thuê cập nhật giấy tờ tùy thân")
                    .build(),
            SchedulerConfig.builder()
                    .codeKey("ROOMMATE_POST_EXPIRE")
                    .name("Hết hạn bài đăng tìm bạn ghép")
                    .cronExpression("0 5 0 * * *")
                    .isActive(true)
                    .description("Tự động đánh dấu hết hạn các bài đăng tìm bạn ghép quá hạn")
                    .build()
    );

    @PostConstruct
    public void init() {
        taskScheduler.setPoolSize(10);
        taskScheduler.setThreadNamePrefix("dynamic-scheduler-");
        taskScheduler.initialize();

        for (SchedulerJob job : jobList) {
            jobRegistry.put(job.getCodeKey(), job);
        }

        seedDefaultConfigs();
        scheduleAllActive();
    }

    private void seedDefaultConfigs() {
        for (SchedulerConfig defaultConfig : DEFAULT_CONFIGS) {
            if (configRepo.findByCodeKey(defaultConfig.getCodeKey()).isEmpty()) {
                configRepo.save(defaultConfig);
                log.info("Seeded default scheduler config: {}", defaultConfig.getCodeKey());
            }
        }
    }

    public void scheduleAllActive() {
        List<SchedulerConfig> activeConfigs = configRepo.findByIsActiveTrue();
        for (SchedulerConfig config : activeConfigs) {
            scheduleJob(config.getCodeKey(), config.getCronExpression());
        }
    }

    public void scheduleJob(String codeKey, String cronExpression) {
        SchedulerJob job = jobRegistry.get(codeKey);
        if (job == null) {
            log.warn("No SchedulerJob found for codeKey: {}", codeKey);
            return;
        }

        cancelJob(codeKey);

        ScheduledFuture<?> future = taskScheduler.schedule(
                job::run,
                new CronTrigger(cronExpression)
        );
        scheduledTasks.put(codeKey, future);
        log.info("Scheduled job [{}] with cron: {}", codeKey, cronExpression);
    }

    public void cancelJob(String codeKey) {
        ScheduledFuture<?> future = scheduledTasks.remove(codeKey);
        if (future != null && !future.isCancelled()) {
            future.cancel(false);
            log.info("Cancelled job [{}]", codeKey);
        }
    }

    public void rescheduleJob(String codeKey) {
        SchedulerConfig config = configRepo.findByCodeKey(codeKey).orElse(null);
        if (config == null) {
            cancelJob(codeKey);
            return;
        }

        if (Boolean.TRUE.equals(config.getIsActive())) {
            scheduleJob(codeKey, config.getCronExpression());
        } else {
            cancelJob(codeKey);
        }
    }

    public boolean triggerNow(String codeKey) {
        SchedulerJob job = jobRegistry.get(codeKey);
        if (job == null) {
            log.warn("Cannot trigger unknown job: {}", codeKey);
            return false;
        }

        job.run();
        log.info("Triggered job [{}] manually", codeKey);
        return true;
    }

    public void reloadAll() {
        for (String codeKey : Set.copyOf(scheduledTasks.keySet())) {
            cancelJob(codeKey);
        }
        scheduleAllActive();
    }
}
