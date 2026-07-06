package com.trithienviet.qlchuoiphongtro.controller;

import com.trithienviet.qlchuoiphongtro.service.InternalAiToolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/internal/ai-tools")
@RequiredArgsConstructor
public class InternalAiToolsController {
    private final InternalAiToolService internalAiToolService;

    /**
     * Endpoint 1: Lấy danh sách cư dân đang nợ hóa đơn
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @param month (Optional) Tháng để lọc
     * @param year (Optional) Năm để lọc
     * @return List<Map<String, Object>> với các trường:
     *         tenant_name, tenant_phone, branch_name, room_name, invoice_id, debt_amount, due_date
     */
    @GetMapping("/debtors")
    public ResponseEntity<List<Map<String, Object>>> getDebtorsList(
            @RequestParam(required = false) String branchName,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        List<Map<String, Object>> debtors = internalAiToolService.getDebtorsList(branchName, month, year);
        return ResponseEntity.ok(debtors);
    }

    /**
     * Endpoint 2: Thống kê doanh thu theo chi nhánh, tháng, năm
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @param month (Optional) Tháng để lọc
     * @param year (Optional) Năm để lọc
     * @return List<Map<String, Object>> với các trường:
     *         branch_name, period_month, period_year, total_revenue, invoice_count
     */
    @GetMapping("/revenue-stats")
    public ResponseEntity<List<Map<String, Object>>> getRevenueStats(
            @RequestParam(required = false) String branchName,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        List<Map<String, Object>> stats = internalAiToolService.getRevenueStats(branchName, month, year);
        return ResponseEntity.ok(stats);
    }

    /**
     * Endpoint 3: Thống kê tình trạng phòng (trống/đã thuê)
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @return List<Map<String, Object>> với các trường:
     *         branch_name, room_status, room_count
     */
    @GetMapping("/room-status")
    public ResponseEntity<List<Map<String, Object>>> getRoomStatusStats(
            @RequestParam(required = false) String branchName) {
        List<Map<String, Object>> stats = internalAiToolService.getRoomStatusStats(branchName);
        return ResponseEntity.ok(stats);
    }

    /**
     * Endpoint 5: Danh sách hợp đồng theo trạng thái
     * @param status (Optional) Trạng thái hợp đồng (PENDING, ACTIVE, EXPIRED, TERMINATED, CANCELLED, DEPOSITED). Mặc định EXPIRED.
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @return List<Map<String, Object>> với các trường:
     *         tenant_name, tenant_phone, branch_name, room_name, start_date, end_date, status
     */
    @GetMapping("/contracts-by-status")
    public ResponseEntity<List<Map<String, Object>>> getContractsByStatus(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String branchName) {
        List<Map<String, Object>> contracts = internalAiToolService.getContractsByStatus(status, branchName);
        return ResponseEntity.ok(contracts);
    }

    /**
     * Endpoint 6: Danh sách hợp đồng sắp hết hạn trong tháng
     * @param month (Optional) Tháng cần kiểm tra, mặc định tháng hiện tại
     * @param year (Optional) Năm cần kiểm tra, mặc định năm hiện tại
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @return List<Map<String, Object>> với các trường:
     *         tenant_name, tenant_phone, branch_name, room_name, start_date, end_date, status
     */
    @GetMapping("/contracts-expiring-in-month")
    public ResponseEntity<List<Map<String, Object>>> getContractsExpiringInMonth(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String branchName) {
        List<Map<String, Object>> contracts = internalAiToolService.getContractsExpiringInMonth(month, year, branchName);
        return ResponseEntity.ok(contracts);
    }

    /**
     * Endpoint 4: Lấy cấu hình AI cho Python (API_KEY, BASE_URL, MODEL)
     * @return Map<String, String> với các key:
     *         - AI_API_KEY
     *         - AI_BASE_URL
     *         - AI_MODEL
     */
    @GetMapping("/ai-config")
    public ResponseEntity<Map<String, String>> getAiConfig() {
        Map<String, String> config = internalAiToolService.getAiConfig();
        return ResponseEntity.ok(config);
    }

    /**
     * Endpoint 7: Lấy số lượng người ở theo chi nhánh
     * @param branchName (Optional) Tên chi nhánh để lọc
     */
    @GetMapping("/tenant-count")
    public ResponseEntity<List<Map<String, Object>>> getTenantCountStats(
            @RequestParam(required = false) String branchName) {
        List<Map<String, Object>> stats = internalAiToolService.getTenantCountStats(branchName);
        return ResponseEntity.ok(stats);
    }

    /**
     * Endpoint 8: Liệt kê chi tiết danh sách phòng trống
     * @param branchName (Optional) Tên chi nhánh để lọc
     */
    @GetMapping("/vacant-rooms-list")
    public ResponseEntity<List<Map<String, Object>>> getVacantRoomsList(
            @RequestParam(required = false) String branchName) {
        List<Map<String, Object>> rooms = internalAiToolService.getVacantRoomsList(branchName);
        return ResponseEntity.ok(rooms);
    }

    /**
     * Endpoint 9: Thống kê lượng điện nước tiêu thụ và số tiền tương ứng
     * @param branchName (Optional) Tên chi nhánh để lọc
     * @param month (Optional) Tháng để lọc
     * @param year (Optional) Năm để lọc
     */
    @GetMapping("/utility-stats")
    public ResponseEntity<List<Map<String, Object>>> getUtilityStats(
            @RequestParam(required = false) String branchName,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        List<Map<String, Object>> stats = internalAiToolService.getUtilityStats(branchName, month, year);
        return ResponseEntity.ok(stats);
    }
}