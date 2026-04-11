package com.trithienviet.qlchuoiphongtro.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.MeterReading;
import com.trithienviet.qlchuoiphongtro.payloads.BranchDashboardStatsDTO;
import com.trithienviet.qlchuoiphongtro.payloads.DashboardRemindersDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ExpiringContractDTO;
import com.trithienviet.qlchuoiphongtro.payloads.FinancialDashboardDTO;
import com.trithienviet.qlchuoiphongtro.payloads.FinancialProjection;
import com.trithienviet.qlchuoiphongtro.payloads.PendingInvoiceDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UtilityDashboardDTO;
import com.trithienviet.qlchuoiphongtro.payloads.UtilityProjection;
import com.trithienviet.qlchuoiphongtro.repo.BranchRepo;
import com.trithienviet.qlchuoiphongtro.repo.ContractRepo;
import com.trithienviet.qlchuoiphongtro.repo.FloorRepo;
import com.trithienviet.qlchuoiphongtro.repo.InvoiceRepo;
import com.trithienviet.qlchuoiphongtro.repo.MeterReadingRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.service.DashboardService;

import org.springframework.transaction.annotation.Transactional;




@Service
public class DashboardServiceImpl implements DashboardService{

    @Autowired
    private BranchRepo branchRepo;
    @Autowired
    private RoomRepo roomRepo;
    @Autowired
    private FloorRepo floorRepo;
    @Autowired
    private InvoiceRepo invoiceRepo;

    @Autowired 
    private MeterReadingRepo metterReadingRepo;

    @Autowired
    private ContractRepo contractRepo;
    public Long countBranch(){
        Long count = branchRepo.count();
        return count;
    }

    public BranchDashboardStatsDTO getBranchDetailStats(Long branchId) {
        BranchDashboardStatsDTO stats = branchRepo.getCombinedStatsByBranchId(branchId);
        
        // 2. Kiểm tra nếu null (Trường hợp chi nhánh hoàn toàn chưa có phòng nào)
        if (stats == null) {
            return new BranchDashboardStatsDTO(0L, 0L, 0L, 0L, 0L,0L);
        }
        
        return stats;
    }
      public BranchDashboardStatsDTO getTotalSystemStats() {
        BranchDashboardStatsDTO stats = branchRepo.getTotalSystemStats();
        
        // 2. Kiểm tra nếu null (Trường hợp chi nhánh hoàn toàn chưa có phòng nào)
        if (stats == null) {
            return new BranchDashboardStatsDTO(0L, 0L, 0L, 0L, 0L,0L);
        }
        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialDashboardDTO getFinancialAnalytics(Long branchId) {
        // Gọi Repo lấy Projection
        FinancialProjection pro = invoiceRepo.getFinancialStatsInterface(branchId);
        
        // Nếu không có bất kỳ hóa đơn nào (pro sẽ null hoặc các trường bên trong null)
        if (pro == null) {
            return new FinancialDashboardDTO(
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 
                BigDecimal.ZERO, 0L, 0L
            );
        }

        return new FinancialDashboardDTO(
            pro.getTotalPaidMonthly() != null ? pro.getTotalPaidMonthly() : BigDecimal.ZERO,
            pro.getTotalPaidDeposit() != null ? pro.getTotalPaidDeposit() : BigDecimal.ZERO,
            pro.getTotalRefunded() != null ? pro.getTotalRefunded() : BigDecimal.ZERO,
            pro.getTotalPending() != null ? pro.getTotalPending() : BigDecimal.ZERO,
            pro.getPaidCount() != null ? pro.getPaidCount() : 0L,
            pro.getPendingCount() != null ? pro.getPendingCount() : 0L
        );
    }
  public FinancialDashboardDTO getFinancialAnalyticsByMonth(Long branchId, Integer month, Integer year) {

        Long searchBranchId = (branchId == null || branchId == 0) ? null : branchId;
        Integer searchMonth = (month == null || month == 0) ? null : month;
        Integer searchYear = (year == null || year == 0) ? null : year;

    
        FinancialProjection projection = invoiceRepo.getFinancialStats(searchBranchId, searchMonth, searchYear);

        // 3. Trả về DTO (Sử dụng Optional hoặc kiểm tra null tập trung)
        if (projection == null) {
            return new FinancialDashboardDTO(
            BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, 0L, 0L
        );
        }

        return new FinancialDashboardDTO(
            projection.getTotalPaidMonthly() != null ? projection.getTotalPaidMonthly() : BigDecimal.ZERO,
            projection.getTotalPaidDeposit() != null ? projection.getTotalPaidDeposit() : BigDecimal.ZERO,
            projection.getTotalRefunded() != null ? projection.getTotalRefunded() : BigDecimal.ZERO,
            projection.getTotalPending() != null ? projection.getTotalPending() : BigDecimal.ZERO,
            projection.getPaidCount() != null ? projection.getPaidCount() : 0L,
            projection.getPendingCount() != null ? projection.getPendingCount() : 0L
            
        );
    }


    public UtilityDashboardDTO getUtilityAnalytics(Long branchId,Integer month,Integer year){
        Long searchBranchId = (branchId == null || branchId == 0) ? null : branchId;
        Integer searchMonth = (month == null || month == 0) ? null : month;
        Integer searchYear = (year == null || year == 0) ? null : year;

        UtilityProjection utilityProjection = metterReadingRepo.getUtilityAnalytics(searchBranchId, searchMonth, searchYear, "Điện", "Nước");
        if(utilityProjection == null)
        {
            return new UtilityDashboardDTO(BigDecimal.ZERO,BigDecimal.ZERO,BigDecimal.ZERO,BigDecimal.ZERO);
        }

        return new UtilityDashboardDTO(
            utilityProjection.getTotalElectricUsage(),
            utilityProjection.getTotalElectricMoney(),
            utilityProjection.getTotalWaterUsage(),
            utilityProjection.getTotalWaterMoney()
        );
    }

    @Override
    public DashboardRemindersDTO getDashboardReminders(Long branchId) {
        Pageable topFive = PageRequest.of(0, 5);
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);

        // 1. Lấy Hợp đồng sắp hết hạn (Giữ nguyên)
        List<ExpiringContractDTO> contracts = contractRepo
            .findTopExpiringContracts(thirtyDaysFromNow, branchId, topFive)
            .stream()
            .map(c -> new ExpiringContractDTO(
                c.getRoom().getRoomName(),
                c.getRepresentative().getRoomMember().getProfile().getFullName(), 
                c.getEndDate(),
                java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), c.getEndDate())
            ))
            .toList();

        // 2. Lấy Hóa đơn nợ 
        List<PendingInvoiceDTO> invoices = invoiceRepo
            .findTopPendingInvoices(branchId, topFive)
            .stream()
            .map(i -> {
                BigDecimal total = i.getTotalAmount() != null ? i.getTotalAmount() : BigDecimal.ZERO;
                BigDecimal paid = i.getPaidAmount() != null ? i.getPaidAmount() : BigDecimal.ZERO;
                
                return new PendingInvoiceDTO(
                    i.getInvoiceId(),
                    i.getContract().getRoom().getRoomName(),
                    i.getContract().getRepresentative().getRoomMember().getProfile().getFullName(),
                    total, // Lấy tổng tiền hóa đơn
                    total.subtract(paid), // Số tiền còn nợ thực tế
                    i.getDueDate()
                );
            })
            .toList();

        return new DashboardRemindersDTO(contracts, invoices);
    }
}

