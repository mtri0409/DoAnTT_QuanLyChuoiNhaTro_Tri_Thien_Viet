package com.trithienviet.qlchuoiphongtro.service.impl;

import com.trithienviet.qlchuoiphongtro.entity.*;
import com.trithienviet.qlchuoiphongtro.exceptions.APIException;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.ExpensesDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.repo.*;
import com.trithienviet.qlchuoiphongtro.service.ExpensesService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpensesServiceImpl implements ExpensesService {

    private static final List<String> VALID_PAYERS = List.of("TENANT_FAULT", "OWNER_COST");

    @Autowired
    private ExpensesRepo expensesRepo;
    @Autowired
    private BranchRepo branchRepo;
    @Autowired
    private UserRepo userRepo;
    @Autowired
    private MaintenanceRequestRepo maintenanceRequestRepo;
    @Autowired
    private ContractRepo contractRepo;
    @Autowired
    private InvoiceRepo invoiceRepo;
    @Autowired
    private InvoiceDetailRepo invoiceDetailRepo;

    // =========================================================
    // TẠO CHI PHÍ
    // =========================================================

    @Override
    @Transactional
    public ExpensesDTO createExpense(
            String payer,
            String expenseCategory,
            BigDecimal amount,
            LocalDateTime paymentDate,
            String payeeName,
            String evidenceUrl,
            String description,
            Integer maintenanceRequestId,
            Integer branchId,
            String adminUsername) {

        if (!VALID_PAYERS.contains(payer)) {
            throw new APIException("Trường payer phải là TENANT_FAULT hoặc OWNER_COST");
        }

        User admin = userRepo.findByUserName(adminUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User", "userName", adminUsername));

        Expenses expense = new Expenses();
        expense.setPayer(payer);
        expense.setExpenseCategory(expenseCategory);
        expense.setAmount(amount);
        expense.setPaymentDate(paymentDate != null ? paymentDate : LocalDateTime.now());
        expense.setPayeeName(payeeName);
        expense.setEvidenceUrl(evidenceUrl);
        expense.setDescription(description);
        expense.setUser(admin);

        if ("TENANT_FAULT".equals(payer)) {
            expense = handleTenantFault(expense, maintenanceRequestId, amount);
        } else {
            // OWNER_COST
            if (branchId == null) {
                throw new APIException("Vui lòng cung cấp branchId khi payer = OWNER_COST");
            }
            Branch branch = branchRepo.findById(branchId.longValue())
                    .orElseThrow(() -> new ResourceNotFoundException("Branch", "branchId", branchId));
            expense.setBranch(branch);
            expense = expensesRepo.save(expense);
        }

        return toDTO(expense);
    }

    private Expenses handleTenantFault(Expenses expense, Integer maintenanceRequestId, BigDecimal amount) {

        if (maintenanceRequestId == null) {
            throw new APIException("Vui lòng cung cấp maintenanceRequestId khi payer = TENANT_FAULT");
        }

        MaintenanceRequest mr = maintenanceRequestRepo
                .findById(maintenanceRequestId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "MaintenanceRequest", "requestId", maintenanceRequestId));

        Room room = mr.getRoom();

        Contract contract = contractRepo
                .findByRoom_RoomIdAndIsDeletedFalse(room.getRoomId())
                .stream()
                .filter(c -> ContractStatus.ACTIVE.equals(c.getStatus()))
                .findFirst()
                .orElseThrow(() -> new APIException(
                        "Không tìm thấy hợp đồng ACTIVE cho phòng " + room.getRoomName()));

        LocalDate now = LocalDate.now();

        // 1. Tạo và save Invoice — KHÔNG có details trong collection
        Invoice invoice = new Invoice();
        invoice.setContract(contract);
        invoice.setType("REPAIR");
        invoice.setStatus("DRAFT");
        invoice.setTotalAmount(amount);
        invoice.setCreatedAt(LocalDateTime.now());
        invoice.setDueDate(null);
        invoice.setPeriodMonth(now.getMonthValue());
        invoice.setPeriodYear(now.getYear());
        invoice.setRoomPrice(BigDecimal.ZERO);
        invoice.setRoomServiceAmount(BigDecimal.ZERO);
        invoice.setPaidAmount(BigDecimal.ZERO);
        invoice.setDetails(new ArrayList<>()); // empty, không add gì vào đây
        invoice = invoiceRepo.save(invoice);

        // 2. Save Expense trước để có expenseId
        expense.setMaintenanceRequest(mr);
        expense.setInvoice(invoice);
        expense.setBranch(room.getFloor().getBranch());
        Expenses savedExpense = expensesRepo.save(expense);

        // 3. Tạo và save InvoiceDetail SAU KHI có đủ invoiceId + expenseId
        InvoiceDetail detail = new InvoiceDetail();
        detail.setInvoice(invoice);
        detail.setQuantity(BigDecimal.ONE);
        detail.setUnitPrice(amount);
        detail.setSubTotal(amount);
        detail.setExpenseId(savedExpense.getExpenseId()); // có ID rồi
        detail.setExpenseCategory(savedExpense.getExpenseCategory());
        detail.setDescription(savedExpense.getDescription());
        detail.setPayeeName(savedExpense.getPayeeName());
        detail.setEvidenceUrl(savedExpense.getEvidenceUrl());
        detail.setService(null);
        detail.setMeterReading(null);
        invoiceDetailRepo.save(detail); // save DUY NHẤT 1 lần

        return savedExpense;
    }
    // =========================================================
    // XEM
    // =========================================================

    @Override
    public ExpensesDTO getExpenseById(Long expenseId) {
        return toDTO(expensesRepo.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "expenseId", expenseId)));
    }

    @Override
    public PageResponse<ExpensesDTO> filterExpenses(
            String payer, String category, Integer branchId,
            LocalDateTime from, LocalDateTime to,
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {

        Sort sort = "desc".equalsIgnoreCase(sortOrder)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        return toPageResponse(expensesRepo.filterExpenses(branchId, payer, category, from, to, pageable));
    }

    @Override
    public PageResponse<ExpensesDTO> getExpensesByMaintenanceRequest(
            Integer maintenanceRequestId, Integer pageNumber, Integer pageSize) {

        List<Expenses> list = expensesRepo.findByMaintenanceRequest_RequestId(maintenanceRequestId);
        int start = pageNumber * pageSize;
        int end = Math.min(start + pageSize, list.size());
        List<Expenses> subList = (start >= list.size()) ? List.of() : list.subList(start, end);

        List<ExpensesDTO> content = subList.stream().map(this::toDTO).collect(Collectors.toList());

        PageResponse<ExpensesDTO> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(pageNumber + 1);
        response.setPageSize(pageSize);
        response.setTotalElements(list.size());
        response.setTotalPages((int) Math.ceil((double) list.size() / pageSize));
        response.setLastPage(end >= list.size());
        return response;
    }

    // =========================================================
    // CẬP NHẬT / XÓA
    // =========================================================

    @Override
    @Transactional
    public ExpensesDTO updateExpense(
            Long expenseId,
            String expenseCategory,
            BigDecimal amount,
            LocalDateTime paymentDate,
            String payeeName,
            String evidenceUrl,
            String description) {

        Expenses expense = expensesRepo.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "expenseId", expenseId));

        if (expenseCategory != null)
            expense.setExpenseCategory(expenseCategory);

        if (amount != null) {
            expense.setAmount(amount);
            if ("TENANT_FAULT".equals(expense.getPayer()) && expense.getInvoice() != null) {
                Invoice inv = expense.getInvoice();
                if ("DRAFT".equals(inv.getStatus()) || "PENDING".equals(inv.getStatus())) {
                    inv.setTotalAmount(amount);
                    invoiceRepo.save(inv);
                } else {
                    throw new APIException(
                            "Không thể thay đổi số tiền khi hóa đơn đã ở trạng thái " + inv.getStatus());
                }
            }
        }

        if (paymentDate != null)
            expense.setPaymentDate(paymentDate);
        if (payeeName != null)
            expense.setPayeeName(payeeName);
        if (evidenceUrl != null)
            expense.setEvidenceUrl(evidenceUrl);
        if (description != null)
            expense.setDescription(description);

        Expenses saved = expensesRepo.save(expense);

        // ── Đồng bộ InvoiceDetail khi cập nhật expense TENANT_FAULT ──────────
        // Giữ cho InvoiceDetail luôn phản ánh thông tin mới nhất từ expense.
        if ("TENANT_FAULT".equals(saved.getPayer()) && saved.getInvoice() != null) {
            Invoice inv = saved.getInvoice();
            if ("DRAFT".equals(inv.getStatus()) || "PENDING".equals(inv.getStatus())) {
                invoiceDetailRepo.findByInvoice_InvoiceId(inv.getInvoiceId())
                        .stream()
                        .filter(d -> expenseId.equals(d.getExpenseId()))
                        .findFirst()
                        .ifPresent(d -> {
                            if (expenseCategory != null)
                                d.setExpenseCategory(expenseCategory);
                            if (description != null)
                                d.setDescription(description);
                            if (payeeName != null)
                                d.setPayeeName(payeeName);
                            if (evidenceUrl != null)
                                d.setEvidenceUrl(evidenceUrl);
                            if (amount != null) {
                                d.setUnitPrice(amount);
                                d.setSubTotal(amount);
                            }
                            invoiceDetailRepo.save(d);
                        });
            }
        }

        return toDTO(saved);
    }

    @Override
    @Transactional
    public String deleteExpense(Long expenseId) {

        Expenses expense = expensesRepo.findById(expenseId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense", "expenseId", expenseId));

        if (expense.getInvoice() != null) {
            Invoice inv = expense.getInvoice();
            if ("PAID".equals(inv.getStatus()) || "REFUNDED".equals(inv.getStatus())) {
                throw new APIException(
                        "Không thể xóa chi phí vì hóa đơn liên kết đã ở trạng thái " + inv.getStatus());
            }
            inv.setStatus("CANCELLED");
            invoiceRepo.save(inv);
        }

        expensesRepo.delete(expense);
        return "Xóa chi phí #" + expenseId + " thành công";
    }

    // =========================================================
    // HELPER
    // =========================================================

    private ExpensesDTO toDTO(Expenses e) {
        return ExpensesDTO.builder()
                .expenseId(e.getExpenseId())
                .payer(e.getPayer())
                .expenseCategory(e.getExpenseCategory())
                .amount(e.getAmount())
                .paymentDate(e.getPaymentDate())
                .payeeName(e.getPayeeName())
                .evidenceUrl(e.getEvidenceUrl())
                .description(e.getDescription())
                .maintenanceRequestId(
                        e.getMaintenanceRequest() != null ? e.getMaintenanceRequest().getRequestId() : null)
                .invoiceId(e.getInvoice() != null ? e.getInvoice().getInvoiceId() : null)
                .branchId(e.getBranch() != null ? e.getBranch().getBranchId() : null)
                .branchName(e.getBranch() != null ? e.getBranch().getBranchName() : null)
                .createdBy(e.getUser() != null ? e.getUser().getUserId().longValue() : null)
                .createdByName(e.getUser() != null ? e.getUser().getUserName() : null)
                .createdAt(e.getCreatedAt())
                .build();
    }

    private PageResponse<ExpensesDTO> toPageResponse(Page<Expenses> page) {
        List<ExpensesDTO> content = page.getContent()
                .stream().map(this::toDTO).collect(Collectors.toList());

        PageResponse<ExpensesDTO> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(page.getNumber() + 1);
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLastPage(page.isLast());
        return response;
    }
}