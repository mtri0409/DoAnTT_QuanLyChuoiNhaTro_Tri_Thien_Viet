package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.repo.AiConfigurationRepo;
import com.trithienviet.qlchuoiphongtro.repo.ContractRepo;
import com.trithienviet.qlchuoiphongtro.repo.InvoiceRepo;
import com.trithienviet.qlchuoiphongtro.repo.MeterReadingRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class InternalAiToolService {
    private final InvoiceRepo invoiceRepo;
    private final AiConfigurationRepo aiConfigurationRepo;
    private final ContractRepo contractRepo;
    private final MeterReadingRepo meterReadingRepo;

    /**
     * Query 1: Lấy danh sách cư dân có hóa đơn tháng quá hạn và còn nợ
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @param month (Optional) Tháng để lọc
     * @param year (Optional) Năm để lọc
     * @return List<Map<String, Object>> với các trường:
     *         tenant_name, tenant_phone, branch_name, room_name, invoice_id, debt_amount, due_date
     */
    public List<Map<String, Object>> getDebtorsList(String branchName, Integer month, Integer year) {
        return invoiceRepo.findDebtorsList(branchName, month, year);
    }

    /**
     * Query 2: Thống kê doanh thu theo chi nhánh, tháng, năm
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @param month (Optional) Tháng để lọc
     * @param year (Optional) Năm để lọc
     * @return List<Map<String, Object>> với các trường:
     *         branch_name, period_month, period_year, total_revenue, invoice_count
     */
    public List<Map<String, Object>> getRevenueStats(String branchName, Integer month, Integer year) {
        // Nếu không truyền cả month và year thì mặc định lấy tháng/năm hiện tại
        if (month == null && year == null) {
            LocalDate now = LocalDate.now();
            month = now.getMonthValue();
            year = now.getYear();
        }
        return invoiceRepo.findRevenueStats(branchName, month, year);
    }

    /**
     * Query 3: Thống kê tình trạng phòng (trống/đã thuê)
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @return List<Map<String, Object>> với các trường:
     *         branch_name, room_status, room_count
     */
    public List<Map<String, Object>> getRoomStatusStats(String branchName) {
        return invoiceRepo.findRoomStatusStats(branchName);
    }


    /**
     * Query 5: Danh sách hợp đồng theo trạng thái
     * @param status (Optional) Trạng thái hợp đồng (PENDING, ACTIVE, EXPIRED, TERMINATED, CANCELLED, DEPOSITED). Mặc định EXPIRED.
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @return List<Map<String, Object>> với các trường:
     *         tenant_name, tenant_phone, branch_name, room_name, start_date, end_date, status
     */
    public List<Map<String, Object>> getContractsByStatus(String status, String branchName) {
        // Mặc định EXPIRED nếu không truyền status
        return contractRepo.findContractsByStatus(status != null ? status : "EXPIRED", branchName);
    }

    /**
     * Query 6: Danh sách hợp đồng sắp hết hạn trong tháng/năm cụ thể
     * @param month (Optional) Tháng cần kiểm tra, mặc định tháng hiện tại
     * @param year (Optional) Năm cần kiểm tra, mặc định năm hiện tại
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @return List<Map<String, Object>> với các trường:
     *         tenant_name, tenant_phone, branch_name, room_name, start_date, end_date, status
     */
    public List<Map<String, Object>> getContractsExpiringInMonth(Integer month, Integer year, String branchName) {
        LocalDate now = LocalDate.now();
        int targetMonth = month != null ? month : now.getMonthValue();
        int targetYear = year != null ? year : now.getYear();
        LocalDate startDate = LocalDate.of(targetYear, targetMonth, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        return contractRepo.findContractsExpiringInMonth(startDate, endDate, branchName);
    }

    /**
     * Lấy cấu hình AI cho Python (API_KEY, BASE_URL, MODEL)
     * @return Map<String, String> với các key:
     *         - API_KEY
     *         - BASE_URL
     *         - MODEL
     */
    public Map<String, String> getAiConfig() {
        Map<String, String> config = new HashMap<>();
        aiConfigurationRepo.findTopByOrderByConfigIdAsc().ifPresent(aiConfig -> {
            config.put("API_KEY", aiConfig.getApiKey());
            config.put("BASE_URL", aiConfig.getBaseUrl());
            config.put("MODEL", aiConfig.getModel());
        });
        return config;
    }

    /**
     * Lấy thống kê số lượng người ở theo chi nhánh
     * @param branchName (Optional) Tên chi nhánh để lọc
     */
    public List<Map<String, Object>> getTenantCountStats(String branchName) {
        return invoiceRepo.findTenantCountStats(branchName);
    }

    /**
     * Liệt kê danh sách các phòng trống chi tiết
     * @param branchName (Optional) Tên chi nhánh để lọc
     */
    public List<Map<String, Object>> getVacantRoomsList(String branchName) {
        return invoiceRepo.findVacantRoomsList(branchName);
    }

    /**
     * Thống kê lượng điện nước tiêu thụ và số tiền tương ứng
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @param month (Optional) Tháng để lọc
     * @param year (Optional) Năm để lọc
     */
    public List<Map<String, Object>> getUtilityStats(String branchName, Integer month, Integer year) {
        return meterReadingRepo.findUtilityStats(branchName, month, year, "Điện", "Nước");
    }
}