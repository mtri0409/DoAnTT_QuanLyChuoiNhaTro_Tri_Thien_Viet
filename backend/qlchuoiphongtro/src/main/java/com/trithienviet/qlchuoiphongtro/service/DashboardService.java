package com.trithienviet.qlchuoiphongtro.service;

import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.payloads.BranchDashboardStatsDTO;
import com.trithienviet.qlchuoiphongtro.payloads.DashboardRemindersDTO;
import com.trithienviet.qlchuoiphongtro.payloads.FinancialDashboardDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UtilityDashboardDTO;


public interface DashboardService {
    
    Long countBranch();
    BranchDashboardStatsDTO getBranchDetailStats (Long branchId);
    BranchDashboardStatsDTO getTotalSystemStats ();
    FinancialDashboardDTO getFinancialAnalytics(Long branchId);
    FinancialDashboardDTO getFinancialAnalyticsByMonth(Long branchId,Integer month,Integer year);

    UtilityDashboardDTO getUtilityAnalytics(Long branchId,Integer month,Integer year);
    DashboardRemindersDTO getDashboardReminders(Long branchId);
}