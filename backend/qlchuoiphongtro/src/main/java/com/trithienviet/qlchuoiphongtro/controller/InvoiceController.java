package com.trithienviet.qlchuoiphongtro.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.InvoiceDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.service.InvoiceService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    @PostMapping("/admin/invoices/manual")
    public ResponseEntity<InvoiceDTO> createManual(
            @RequestParam Long contractId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return new ResponseEntity<>(
                invoiceService.createManualInvoice(contractId, month, year),
                HttpStatus.CREATED);
    }

    @PostMapping("/admin/invoices/auto-generation")
    public ResponseEntity<List<InvoiceDTO>> autoGenerate(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return new ResponseEntity<>(
                invoiceService.autoGenerateInvoices(month, year),
                HttpStatus.CREATED);
    }

    @PostMapping("/admin/invoices/deposits")
    public ResponseEntity<InvoiceDTO> createDeposit(
            @RequestParam Long contractId,
            @RequestParam Long depositId) {
        return new ResponseEntity<>(
                invoiceService.createDepositInvoice(contractId, depositId),
                HttpStatus.CREATED);
    }

    @PutMapping("/admin/invoices/{invoiceId}/deposit-payments")
    public ResponseEntity<InvoiceDTO> depositPayment(
            @PathVariable Long invoiceId,
            @RequestParam BigDecimal amount) {
        return new ResponseEntity<>(
                invoiceService.recordDepositPayment(invoiceId, amount),
                HttpStatus.OK);
    }

    @PostMapping("/admin/invoices/{invoiceId}/refunds")
    public ResponseEntity<InvoiceDTO> refund(
            @PathVariable Long invoiceId,
            @RequestParam(required = false) String note) {
        return new ResponseEntity<>(
                invoiceService.refundDeposit(invoiceId, note),
                HttpStatus.OK);
    }

    @GetMapping("/admin/invoices/{invoiceId}")
    public ResponseEntity<InvoiceDTO> getById(@PathVariable Long invoiceId) {
        return new ResponseEntity<>(invoiceService.getInvoiceById(invoiceId), HttpStatus.OK);
    }

    @GetMapping("/admin/invoices/contract/{contractId}")
    public ResponseEntity<PageResponse<InvoiceDTO>> getByContract(
            @PathVariable Long contractId,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "periodYear", required = false) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        return new ResponseEntity<>(
                invoiceService.getInvoicesByContract(contractId,
                        Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder),
                HttpStatus.OK);
    }

    @GetMapping("/admin/invoices")
    public ResponseEntity<PageResponse<InvoiceDTO>> filter(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Long contractId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

        return new ResponseEntity<>(
                invoiceService.filterInvoices(status, type, month, year, contractId, branchId,
                        Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder),
                HttpStatus.OK);
    }

    @PostMapping("/admin/invoices/{invoiceId}/dispatches")
    public ResponseEntity<InvoiceDTO> send(@PathVariable Long invoiceId) {
        return new ResponseEntity<>(invoiceService.sendInvoice(invoiceId), HttpStatus.OK);
    }

    @PostMapping("/admin/invoices/dispatches")
    public ResponseEntity<List<InvoiceDTO>> sendAll(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return new ResponseEntity<>(invoiceService.sendAllInvoices(month, year), HttpStatus.OK);
    }

    @PatchMapping("/admin/invoices/{invoiceId}/payment-status")
    public ResponseEntity<InvoiceDTO> markPaid(@PathVariable Long invoiceId) {
        return new ResponseEntity<>(invoiceService.markAsPaid(invoiceId), HttpStatus.OK);
    }

    @PostMapping("/admin/invoices/{invoiceId}/cancellations")
    public ResponseEntity<String> cancel(@PathVariable Long invoiceId) {
        invoiceService.cancelInvoice(invoiceId);
        return new ResponseEntity<>("Invoice cancelled successfully", HttpStatus.OK);
    }

    @PostMapping("/admin/invoices/{invoiceId}/recalculations")
    public ResponseEntity<InvoiceDTO> recalculate(@PathVariable Long invoiceId) {
        return new ResponseEntity<>(invoiceService.recalculate(invoiceId), HttpStatus.OK);
    }

    @GetMapping("/user/invoices/my")
    public ResponseEntity<PageResponse<InvoiceDTO>> getMyInvoices(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(defaultValue = "1") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortOrder) {

        return new ResponseEntity<>(
                invoiceService.getInvoicesByUser(
                        userDetails.getUsername(),
                        status, type, month, year,
                        Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder), HttpStatus.OK);
    }

    @GetMapping("/user/invoices/{invoiceId}")
    public ResponseEntity<InvoiceDTO> getMyInvoiceById(
            @PathVariable Long invoiceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return new ResponseEntity<>(
                invoiceService.getInvoiceByIdForUser(invoiceId, userDetails.getUsername()), HttpStatus.OK);
    }

    @PostMapping("/user/invoices/{invoiceId}/vnpay-confirmations")
    public ResponseEntity<InvoiceDTO> confirmVNPay(
            @PathVariable Long invoiceId,
            @RequestParam BigDecimal amount,
            @RequestParam String transactionCode,
            @AuthenticationPrincipal UserDetails userDetails) {

        invoiceService.getInvoiceByIdForUser(invoiceId, userDetails.getUsername());

        return new ResponseEntity<>(
                invoiceService.confirmVNPayPayment(invoiceId, amount, transactionCode), HttpStatus.OK);
    }
}
