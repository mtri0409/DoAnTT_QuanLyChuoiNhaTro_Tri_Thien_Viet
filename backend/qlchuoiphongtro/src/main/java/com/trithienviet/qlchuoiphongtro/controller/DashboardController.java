package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.payloads.BranchDashboardStatsDTO;
import com.trithienviet.qlchuoiphongtro.payloads.DashboardRemindersDTO;
import com.trithienviet.qlchuoiphongtro.payloads.FinancialDashboardDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UtilityDashboardDTO;
import com.trithienviet.qlchuoiphongtro.service.DashboardService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Manager Room Application")
public class DashboardController {
    
    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/admin/dashboard/total-branches")
    public ResponseEntity<Long> getTotalBranches() {
        Long count = dashboardService.countBranch();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/admin/dashboard/branch-stats/{branchId}")
    public ResponseEntity<BranchDashboardStatsDTO> getBranchStats(@PathVariable Long branchId) {
        
        BranchDashboardStatsDTO stats = dashboardService.getBranchDetailStats(branchId);
        
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }
    @GetMapping("/admin/dashboard/stats")
    public ResponseEntity<BranchDashboardStatsDTO> getBranchStats() {
        
        BranchDashboardStatsDTO stats = dashboardService.getTotalSystemStats();
        
        if (stats == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/dashboard/finance/{branchId}")
    public ResponseEntity<FinancialDashboardDTO> getFinancialAnalytics(
            @PathVariable(required = false) Long branchId) {
        
        FinancialDashboardDTO stats = dashboardService.getFinancialAnalytics(branchId);
        return ResponseEntity.ok(stats);
    }


    @GetMapping("admin/dashboard/financial-stats")
    public ResponseEntity<FinancialDashboardDTO> getFinancialStats(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
     
        FinancialDashboardDTO stats = dashboardService.getFinancialAnalyticsByMonth(branchId, month, year);
        
        return ResponseEntity.ok(stats);
    }
      @GetMapping("admin/dashboard/utility-stats")
    public ResponseEntity<UtilityDashboardDTO> getUtilityStats(
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
     
        UtilityDashboardDTO stats = dashboardService.getUtilityAnalytics(branchId, month, year);
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/admin/dashboard/reminders/{branchId}")
    public ResponseEntity<DashboardRemindersDTO> getDashboardReminders(
            @PathVariable(required = false) Long branchId) {
        
        DashboardRemindersDTO stats = dashboardService.getDashboardReminders(branchId);
        return ResponseEntity.ok(stats);
    }

}
