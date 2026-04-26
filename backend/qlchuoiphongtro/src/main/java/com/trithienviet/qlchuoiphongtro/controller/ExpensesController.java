package com.trithienviet.qlchuoiphongtro.controller;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.ExpensesDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.service.ExpensesService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/expenses")
@SecurityRequirement(name = "Manager Room Application")
public class ExpensesController {

    @Autowired
    private ExpensesService expenseService;

    // ================================================================
    // TẠO CHI PHÍ
    // ================================================================

    /**
     * Tạo chi phí mới.
     * - payer = TENANT_FAULT → yêu cầu maintenanceRequestId, tạo Invoice REPAIR
     * - payer = OWNER_COST → yêu cầu branchId, chỉ lưu expenses
     * POST /api/admin/expenses
     */
    @PostMapping
    public ResponseEntity<ExpensesDTO> createExpense(
            @RequestParam String payer,
            @RequestParam String expenseCategory,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime paymentDate,
            @RequestParam(required = false) String payeeName,
            @RequestParam(required = false) String evidenceUrl,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) Integer maintenanceRequestId,
            @RequestParam(required = false) Integer branchId,
            @AuthenticationPrincipal UserDetails userDetails) {

        return new ResponseEntity<>(
                expenseService.createExpense(
                        payer, expenseCategory, amount, paymentDate,
                        payeeName, evidenceUrl, description,
                        maintenanceRequestId, branchId,
                        userDetails.getUsername()),
                HttpStatus.CREATED);
    }

    // ================================================================
    // XEM
    // ================================================================

    /**
     * Xem chi tiết 1 chi phí.
     * GET /api/admin/expenses/{expenseId}
     */
    @GetMapping("/{expenseId}")
    public ResponseEntity<ExpensesDTO> getById(@PathVariable Long expenseId) {
        return ResponseEntity.ok(expenseService.getExpenseById(expenseId));
    }

    /**
     * Lọc danh sách chi phí.
     * GET /api/admin/expenses
     */
    @GetMapping
    public ResponseEntity<PageResponse<ExpensesDTO>> filter(
            @RequestParam(required = false) String payer,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer branchId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = "desc", required = false) String sortOrder) {

        return ResponseEntity.ok(
                expenseService.filterExpenses(
                        payer, category, branchId, from, to,
                        Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder));
    }

    /**
     * Xem chi phí theo yêu cầu sửa chữa.
     * GET /api/admin/expenses/maintenance/{requestId}
     */
    @GetMapping("/maintenance/{requestId}")
    public ResponseEntity<PageResponse<ExpensesDTO>> getByMaintenanceRequest(
            @PathVariable Integer requestId,
            @RequestParam(defaultValue = "1") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize) {

        return ResponseEntity.ok(
                expenseService.getExpensesByMaintenanceRequest(
                        requestId, Math.max(0, pageNumber - 1), pageSize));
    }

    // ================================================================
    // CẬP NHẬT / XÓA
    // ================================================================

    /**
     * Cập nhật chi phí (chỉ metadata, không đổi payer / invoice).
     * PATCH /api/admin/expenses/{expenseId}
     */
    @PatchMapping("/{expenseId}")
    public ResponseEntity<ExpensesDTO> update(
            @PathVariable Long expenseId,
            @RequestParam(required = false) String expenseCategory,
            @RequestParam(required = false) BigDecimal amount,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime paymentDate,
            @RequestParam(required = false) String payeeName,
            @RequestParam(required = false) String evidenceUrl,
            @RequestParam(required = false) String description) {

        return ResponseEntity.ok(
                expenseService.updateExpense(
                        expenseId, expenseCategory, amount,
                        paymentDate, payeeName, evidenceUrl, description));
    }

    /**
     * Xóa chi phí.
     * DELETE /api/admin/expenses/{expenseId}
     */
    @DeleteMapping("/{expenseId}")
    public ResponseEntity<String> delete(@PathVariable Long expenseId) {
        return ResponseEntity.ok(expenseService.deleteExpense(expenseId));
    }
}