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
@RequestMapping("/api")
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

    @PostMapping("/admin/invoices/auto-generate")
    public ResponseEntity<List<InvoiceDTO>> autoGenerate(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return new ResponseEntity<>(
                invoiceService.autoGenerateInvoices(month, year),
                HttpStatus.CREATED);
    }

    @PostMapping("/admin/invoices/deposit")
    public ResponseEntity<InvoiceDTO> createDeposit(
            @RequestParam Long contractId,
            @RequestParam Long depositId) {
        return new ResponseEntity<>(
                invoiceService.createDepositInvoice(contractId, depositId),
                HttpStatus.CREATED);
    }

    @PutMapping("/admin/invoices/{invoiceId}/deposit-payment")
    public ResponseEntity<InvoiceDTO> depositPayment(
            @PathVariable Long invoiceId,
            @RequestParam BigDecimal amount) {
        return new ResponseEntity<>(
                invoiceService.recordDepositPayment(invoiceId, amount),
                HttpStatus.OK);
    }

    @PutMapping("/admin/invoices/{invoiceId}/refund")
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

    @PutMapping("/admin/invoices/{invoiceId}/send")
    public ResponseEntity<InvoiceDTO> send(@PathVariable Long invoiceId) {
        return new ResponseEntity<>(invoiceService.sendInvoice(invoiceId), HttpStatus.OK);
    }
      @PutMapping("/admin/invoices/send")
  @PostMapping("/send-all")
    public ResponseEntity<List<InvoiceDTO>> sendAll(
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return ResponseEntity.ok(invoiceService.sendAllInvoices(month, year));
    }
    
    
    @PutMapping("/admin/invoices/{invoiceId}/mark-paid")
    public ResponseEntity<InvoiceDTO> markPaid(@PathVariable Long invoiceId) {
        return new ResponseEntity<>(invoiceService.markAsPaid(invoiceId), HttpStatus.OK);
    }

    @PutMapping("/admin/invoices/{invoiceId}/cancel")
    public ResponseEntity<String> cancel(@PathVariable Long invoiceId) {
        invoiceService.cancelInvoice(invoiceId);
        return new ResponseEntity<>("Invoice cancelled successfully", HttpStatus.OK);
    }

    @PutMapping("/admin/invoices/{invoiceId}/recalculate")
    public ResponseEntity<InvoiceDTO> recalculate(@PathVariable Long invoiceId) {
        return new ResponseEntity<>(invoiceService.recalculate(invoiceId), HttpStatus.OK);
    }

    // UserInvoiceController.java
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

        return ResponseEntity.ok(
                invoiceService.getInvoicesByUser(
                        userDetails.getUsername(), // hoặc userId từ JWT
                        status, type, month, year,
                        Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder));
    }

    @GetMapping("/user/invoices/{invoiceId}")
    public ResponseEntity<InvoiceDTO> getMyInvoiceById(
            @PathVariable Long invoiceId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                invoiceService.getInvoiceByIdForUser(invoiceId, userDetails.getUsername()));
    }

    @PutMapping("/user/invoices/{invoiceId}/confirm-vnpay")
    public ResponseEntity<InvoiceDTO> confirmVNPay(
            @PathVariable Long invoiceId,
            @RequestParam BigDecimal amount,
            @RequestParam String transactionCode,
            @AuthenticationPrincipal UserDetails userDetails) {

        // Validate invoice thuộc về user trước khi confirm
        invoiceService.getInvoiceByIdForUser(invoiceId, userDetails.getUsername());

        return ResponseEntity.ok(
                invoiceService.confirmVNPayPayment(invoiceId, amount, transactionCode));
    }
}