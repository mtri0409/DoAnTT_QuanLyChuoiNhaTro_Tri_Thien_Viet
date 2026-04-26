package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.ExpensesDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface ExpensesService {

        /**
         * Tạo chi phí mới.
         * - payer = TENANT_FAULT → tạo Invoice type=REPAIR liên kết maintenanceRequest,
         * trả về ExpensesDTO có invoiceId để admin gửi hóa đơn cho khách.
         * - payer = OWNER_COST → chỉ lưu bảng expenses, không tạo invoice.
         */
        ExpensesDTO createExpense(
                        String payer,
                        String expenseCategory,
                        BigDecimal amount,
                        LocalDateTime paymentDate,
                        String payeeName,
                        String evidenceUrl,
                        String description,
                        Integer maintenanceRequestId, // bắt buộc nếu TENANT_FAULT
                        Integer branchId, // bắt buộc nếu OWNER_COST
                        String adminUsername);

        /** Xem chi tiết 1 chi phí */
        ExpensesDTO getExpenseById(Long expenseId);

        /**
         * Lọc danh sách chi phí.
         * Tất cả param đều optional (null = bỏ qua điều kiện).
         */
        PageResponse<ExpensesDTO> filterExpenses(
                        String payer, String category, Integer branchId,
                        LocalDateTime from, LocalDateTime to,
                        Integer pageNumber, Integer pageSize,
                        String sortBy, String sortOrder);

        /**
         * Cập nhật thông tin chi phí
         * (chỉ các trường metadata, không đổi payer / invoice).
         * Trường nào null → giữ nguyên giá trị cũ.
         */
        ExpensesDTO updateExpense(
                        Long expenseId,
                        String expenseCategory,
                        BigDecimal amount,
                        LocalDateTime paymentDate,
                        String payeeName,
                        String evidenceUrl,
                        String description);

        /** Xóa chi phí. Nếu có Invoice REPAIR đi kèm sẽ tự động CANCEL invoice. */
        String deleteExpense(Long expenseId);

        /** Lấy tất cả chi phí liên quan đến 1 maintenance request (phân trang). */
        PageResponse<ExpensesDTO> getExpensesByMaintenanceRequest(
                        Integer maintenanceRequestId,
                        Integer pageNumber, Integer pageSize);
}