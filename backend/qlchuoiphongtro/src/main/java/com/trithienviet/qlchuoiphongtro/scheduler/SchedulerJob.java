package com.trithienviet.qlchuoiphongtro.scheduler;

public interface SchedulerJob {
    String getCodeKey();
    void run();
}
