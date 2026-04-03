package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.InvoiceDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;

import java.math.BigDecimal;
import java.util.List;

public interface InvoiceService {

        // ── TẠO HÓA ĐƠN MONTHLY ─────────────────────────────────────────────────

        /** Admin tạo thủ công 1 hóa đơn MONTHLY cho hợp đồng → trạng thái DRAFT */
        InvoiceDTO createManualInvoice(Long contractId, Integer month, Integer year);

        /**
         * Tạo hàng loạt theo billingDay — gọi từ @Scheduled mỗi ngày.
         * Chỉ tạo hợp đồng ACTIVE có billingDay == hôm nay, chưa có hóa đơn kỳ này.
         */
        List<InvoiceDTO> autoGenerateInvoices(Integer month, Integer year);

        // ── TẠO HÓA ĐƠN DEPOSIT ─────────────────────────────────────────────────

        /**
         * Tạo hóa đơn tiền cọc cho 1 hợp đồng → status DRAFT.
         * Tổng tiền = deposits.amount, không có InvoiceDetail (hoặc 1 dòng tóm tắt).
         *
         * @param contractId hợp đồng cần tạo hóa đơn cọc
         * @param depositId  bản ghi Deposit liên kết (đã tồn tại)
         */
        InvoiceDTO createDepositInvoice(Long contractId, Long depositId);

        /**
         * Ghi nhận 1 lần nộp tiền cọc (có thể nộp từng phần nhiều lần).
         * Logic:
         * - paidAmount += amount
         * - Nếu paidAmount < totalAmount → status = PARTIAL
         * - Nếu paidAmount >= totalAmount → status = PAID
         *
         * @param invoiceId id hóa đơn deposit (phải đang PENDING hoặc PARTIAL)
         * @param amount    số tiền nộp lần này
         */
        InvoiceDTO recordDepositPayment(Long invoiceId, BigDecimal amount);

        /**
         * Hoàn trả tiền cọc → status = REFUNDED.
         * Chỉ cho phép khi hóa đơn đang PAID (cọc đã đóng đủ).
         *
         * @param invoiceId id hóa đơn deposit
         * @param note      lý do hoàn cọc (optional, lưu vào note hoặc log)
         */
        InvoiceDTO refundDeposit(Long invoiceId, String note);

        // ── CHỈ SỐ ĐỒNG HỒ ───────────────────────────────────────────────────────

        /**
         * Nhập chỉ số điện/nước → cập nhật InvoiceDetail trong hóa đơn DRAFT của kỳ.
         */
        void inputMeterReading(Long roomId, Integer serviceId,
                        BigDecimal newValue,
                        Integer month, Integer year,
                        String imageUrl);

        // ── XEM ──────────────────────────────────────────────────────────────────

        InvoiceDTO getInvoiceById(Long invoiceId);

        PageResponse<InvoiceDTO> getInvoicesByContract(Long contractId,
                        Integer pageNumber, Integer pageSize,
                        String sortBy, String sortOrder);

        /**
         * Lọc hóa đơn — hỗ trợ thêm param type để lọc riêng MONTHLY/DEPOSIT/REPAIR.
         */
        PageResponse<InvoiceDTO> filterInvoices(String status, String type,
                        Integer month, Integer year,
                        Long contractId, Long branchId,
                        Integer pageNumber, Integer pageSize,
                        String sortBy, String sortOrder);

        // ── WORKFLOW: DRAFT → PENDING → PAID (MONTHLY / REPAIR) ─────────────────

        /** Gửi hóa đơn cho khách: tính lại total, DRAFT → PENDING, set dueDate */
        InvoiceDTO sendInvoice(Long invoiceId);
        List<InvoiceDTO> sendAllInvoices(Integer month, Integer year) ;
        /** Xác nhận thanh toán 1 lần (MONTHLY): PENDING → PAID */
        InvoiceDTO markAsPaid(Long invoiceId);

        /** Hủy hóa đơn (không được hủy khi đã PAID hoặc REFUNDED) */
        void cancelInvoice(Long invoiceId);

        /** Tính lại totalAmount từ các InvoiceDetail hiện có */
        InvoiceDTO recalculate(Long invoiceId);

        void remindInvoice();
}