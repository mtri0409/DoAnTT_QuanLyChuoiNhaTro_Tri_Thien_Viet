package com.trithienviet.qlchuoiphongtro.service.impl;

import com.trithienviet.qlchuoiphongtro.config.EmailTemplate;
import com.trithienviet.qlchuoiphongtro.entity.*;
import com.trithienviet.qlchuoiphongtro.payloads.InvoiceDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.repo.*;
import com.trithienviet.qlchuoiphongtro.service.EmailService;
import com.trithienviet.qlchuoiphongtro.service.InvoiceService;
import com.trithienviet.qlchuoiphongtro.service.NotificationService;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InvoiceServiceImpl implements InvoiceService {

    private static final String TYPE_MONTHLY = "MONTHLY";
    private static final String TYPE_DEPOSIT = "DEPOSIT";

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PARTIAL = "PARTIAL";
    private static final String STATUS_PAID = "PAID";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final String STATUS_REFUNDED = "REFUNDED";

    private final InvoiceRepo invoiceRepo;
    private final InvoiceDetailRepo invoiceDetailRepo;
    private final ContractRepo contractRepo;
    private final MeterReadingRepo meterReadingRepo;
    private final DepositRepo depositRepo; // <-- inject thêm

   private final EmailService emailService;
    private final NotificationService notificationService;
    // ────────────────────────────────────────────────────────────────────────
    // TẠO HÓA ĐƠN MONTHLY
    // ────────────────────────────────────────────────────────────────────────

    @Override
    public InvoiceDTO createManualInvoice(Long contractId, Integer month, Integer year) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new RuntimeException("Contract is not ACTIVE");
        }
        if (invoiceRepo.existsByContract_ContractIdAndTypeAndPeriodMonthAndPeriodYear(
                contractId, TYPE_MONTHLY, month, year)) {
            throw new RuntimeException("Invoice already exists for this period");
        }

        Invoice invoice = buildDraftInvoice(contract, month, year);
        invoiceRepo.save(invoice);

        
        return toDTO(invoice);
    }

    @Override
    public List<InvoiceDTO> autoGenerateInvoices(Integer month, Integer year) {
        List<Contract> activeContracts = contractRepo.findByStatusAndIsDeletedFalse(ContractStatus.ACTIVE);
        List<InvoiceDTO> result = new ArrayList<>();
        int today = LocalDate.now().getDayOfMonth();

        for (Contract contract : activeContracts) {
            if (contract.getBillingDay() == null || contract.getBillingDay() != today)
                continue;
            if (invoiceRepo.existsByContract_ContractIdAndTypeAndPeriodMonthAndPeriodYear(
                    contract.getContractId(), TYPE_MONTHLY, month, year))
                continue;

            Invoice invoice = buildDraftInvoice(contract, month, year);
            invoiceRepo.save(invoice);
            result.add(toDTO(invoice));
        }
        return result;
    }

    // ────────────────────────────────────────────────────────────────────────
    // TẠO HÓA ĐƠN DEPOSIT
    // ────────────────────────────────────────────────────────────────────────

    @Override
    public InvoiceDTO createDepositInvoice(Long contractId, Long depositId) {
        Contract contract = contractRepo.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        Deposit deposit = depositRepo.findById(depositId)
                .orElseThrow(() -> new RuntimeException("Deposit not found: " + depositId));

        // Không cho tạo 2 hóa đơn cọc cho cùng 1 deposit
        if (deposit.getInvoice() != null) {
            throw new RuntimeException("Deposit already has an invoice");
        }

        LocalDate now = LocalDate.now();

        Invoice invoice = new Invoice();
        invoice.setContract(contract);
        invoice.setType(TYPE_DEPOSIT);
        invoice.setPeriodMonth(now.getMonthValue());
        invoice.setPeriodYear(now.getYear());
        invoice.setRoomPrice(BigDecimal.ZERO);
        invoice.setRoomServiceAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(deposit.getAmount()); // tổng cần thu = số tiền cọc
        invoice.setPaidAmount(BigDecimal.ZERO); // chưa nộp đồng nào
        invoice.setDeposit(deposit);
        invoice.setStatus(STATUS_DRAFT);
        invoice.setDetails(new ArrayList<>());

        invoiceRepo.save(invoice);
        return toDTO(invoice);
    }

    /**
     * Ghi nhận 1 lần nộp tiền cọc (có thể nộp nhiều lần).
     * Hóa đơn phải đang PENDING hoặc PARTIAL.
     */
    @Override
    public InvoiceDTO recordDepositPayment(Long invoiceId, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Payment amount must be positive");
        }

        Invoice invoice = findInvoice(invoiceId);

        if (!TYPE_DEPOSIT.equals(invoice.getType())) {
            throw new RuntimeException("recordDepositPayment only applies to DEPOSIT invoices");
        }
        if (!STATUS_PENDING.equals(invoice.getStatus()) && !STATUS_PARTIAL.equals(invoice.getStatus())) {
            throw new RuntimeException(
                    "Invoice must be PENDING or PARTIAL to record payment. Current: " + invoice.getStatus());
        }

        BigDecimal currentPaid = invoice.getPaidAmount() != null ? invoice.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal newPaid = currentPaid.add(amount);

        // Không cho nộp quá số cần thu
        if (newPaid.compareTo(invoice.getTotalAmount()) > 0) {
            throw new RuntimeException(
                    "Payment exceeds required amount. Required: " + invoice.getTotalAmount()
                            + ", Already paid: " + currentPaid
                            + ", This payment: " + amount);
        }

        invoice.setPaidAmount(newPaid);

        if (newPaid.compareTo(invoice.getTotalAmount()) >= 0) {
            invoice.setStatus(STATUS_PAID);
        } else {
            invoice.setStatus(STATUS_PARTIAL);
        }

        invoiceRepo.save(invoice);
        return toDTO(invoice);
    }

    /**
     * Hoàn trả tiền cọc → REFUNDED.
     * Chỉ cho phép khi đang PAID.
     */
    @Override
    public InvoiceDTO refundDeposit(Long invoiceId, String note) {
        Invoice invoice = findInvoice(invoiceId);

        if (!TYPE_DEPOSIT.equals(invoice.getType())) {
            throw new RuntimeException("refundDeposit only applies to DEPOSIT invoices");
        }
        if (!STATUS_PAID.equals(invoice.getStatus())) {
            throw new RuntimeException(
                    "Only fully PAID deposit invoices can be refunded. Current: " + invoice.getStatus());
        }

        // ✅ THÊM: kiểm tra hợp đồng phải đã kết thúc
        Contract contract = invoice.getContract();
        ContractStatus contractStatus = contract.getStatus();
        if (contractStatus == ContractStatus.ACTIVE || contractStatus == ContractStatus.PENDING) {
            throw new RuntimeException(
                    "Cannot refund deposit while contract is still " + contractStatus
                            + ". Contract must be EXPIRED or TERMINATED first.");
        }

        invoice.setStatus(STATUS_REFUNDED);

        if (invoice.getDeposit() != null) {
            invoice.getDeposit().setStatus("REFUNDED");
        }

        invoiceRepo.save(invoice);
        return toDTO(invoice);
    }

    // ────────────────────────────────────────────────────────────────────────
    // CHỈ SỐ ĐỒNG HỒ
    // ────────────────────────────────────────────────────────────────────────

    @Override
    public void inputMeterReading(Long roomId, Integer serviceId,
            BigDecimal newValue,
            Integer month, Integer year,
            String imageUrl) {

        MeterReading reading = meterReadingRepo
                .findByRoom_RoomIdAndService_ServiceIdAndPeriodMonthAndPeriodYear(
                        roomId, serviceId, month, year)
                .orElseThrow(() -> new RuntimeException("MeterReading not found after save"));

        BigDecimal usage = reading.getUsageValue();

        contractRepo.findByRoom_RoomIdAndIsDeletedFalse(roomId).stream()
                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                .findFirst()
                .ifPresent(contract -> {
                    BigDecimal unitPrice = contract.getContractServices().stream()
                            .filter(cs -> cs.getService().getServiceId().equals(serviceId))
                            .findFirst()
                            .map(ContractService::getPriceAtSigning)
                            .orElse(BigDecimal.ZERO);

                    invoiceRepo.findByContract_ContractIdAndTypeAndPeriodMonthAndPeriodYear(
                            contract.getContractId(), TYPE_MONTHLY, month, year)
                            .ifPresent(invoice -> {
                                if (!STATUS_DRAFT.equals(invoice.getStatus()))
                                    return;

                                InvoiceDetail detail = invoice.getDetails().stream()
                                        .filter(d -> d.getService().getServiceId().equals(serviceId))
                                        .findFirst()
                                        .orElseGet(() -> {
                                            InvoiceDetail d = new InvoiceDetail();
                                            d.setInvoice(invoice);
                                            invoice.getDetails().add(d);
                                            return d;
                                        });

                                detail.setService(reading.getService());
                                detail.setMeterReading(reading);
                                detail.setUnitPrice(unitPrice);
                                detail.setQuantity(usage);
                                detail.setSubTotal(unitPrice.multiply(usage));

                                recalculateTotal(invoice);
                                invoiceRepo.save(invoice);
                            });
                });
    }

    // ────────────────────────────────────────────────────────────────────────
    // XEM
    // ────────────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceById(Long invoiceId) {
        return toDTO(findInvoice(invoiceId));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InvoiceDTO> getInvoicesByContract(Long contractId,
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {
        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        return toPageResponse(invoiceRepo.findByContract_ContractId(contractId, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<InvoiceDTO> filterInvoices(String status, String type,
            Integer month, Integer year,
            Long contractId, Long branchId,
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder) {
        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        return toPageResponse(invoiceRepo.filterInvoices(status, type, month, year, contractId, branchId, pageable));
    }

    // ────────────────────────────────────────────────────────────────────────
    // WORKFLOW MONTHLY: DRAFT → PENDING → PAID
    // ────────────────────────────────────────────────────────────────────────

    @Override
    public InvoiceDTO sendInvoice(Long invoiceId) {
        Invoice invoice = findInvoice(invoiceId);
        if (!STATUS_DRAFT.equals(invoice.getStatus())) {
            throw new RuntimeException("Only DRAFT invoices can be sent");
        }

        // DEPOSIT: chỉ chuyển sang PENDING, không tính lại (totalAmount =
        // deposit.amount)
        if (!TYPE_DEPOSIT.equals(invoice.getType())) {
            recalculateTotal(invoice);
        }

        invoice.setStatus(STATUS_PENDING);
        invoice.setDueDate(LocalDate.now().plusDays(7));
        invoiceRepo.save(invoice);
        return toDTO(invoice);
    }

    /**
     * markAsPaid chỉ dùng cho MONTHLY (thanh toán 1 lần). DEPOSIT dùng
     * recordDepositPayment.
     */
    @Override
    public InvoiceDTO markAsPaid(Long invoiceId) {
        Invoice invoice = findInvoice(invoiceId);

        if (TYPE_DEPOSIT.equals(invoice.getType())) {
            throw new RuntimeException("Use recordDepositPayment() for DEPOSIT invoices");
        }
        if (!STATUS_PENDING.equals(invoice.getStatus())) {
            throw new RuntimeException("Only PENDING invoices can be marked as PAID");
        }
        invoice.setStatus(STATUS_PAID);
        invoiceRepo.save(invoice);
        return toDTO(invoice);
    }

    @Override
    public void cancelInvoice(Long invoiceId) {
        Invoice invoice = findInvoice(invoiceId);
        if (STATUS_PAID.equals(invoice.getStatus()) || STATUS_REFUNDED.equals(invoice.getStatus())) {
            throw new RuntimeException("Cannot cancel a PAID or REFUNDED invoice");
        }
        invoice.setStatus(STATUS_CANCELLED);
        invoiceRepo.save(invoice);
    }

    @Override
    public InvoiceDTO recalculate(Long invoiceId) {
        Invoice invoice = findInvoice(invoiceId);

        if (TYPE_DEPOSIT.equals(invoice.getType())) {
            throw new RuntimeException("DEPOSIT invoices do not have meter-based details to recalculate");
        }

        if (invoice.getDetails() != null) {
            for (InvoiceDetail detail : invoice.getDetails()) {
                if (detail.getService() == null)
                    continue;
                if ("METERED".equalsIgnoreCase(detail.getService().getServiceType())) {
                    Long roomId = invoice.getContract().getRoom().getRoomId();
                    meterReadingRepo.findByRoom_RoomIdAndService_ServiceIdAndPeriodMonthAndPeriodYear(
                            roomId, detail.getService().getServiceId(),
                            invoice.getPeriodMonth(), invoice.getPeriodYear())
                            .ifPresent(mr -> {
                                detail.setMeterReading(mr);
                                detail.setQuantity(mr.getUsageValue());
                                BigDecimal up = detail.getUnitPrice() != null ? detail.getUnitPrice() : BigDecimal.ZERO;
                                detail.setSubTotal(up.multiply(mr.getUsageValue()));
                            });
                }
            }
        }
        recalculateTotal(invoice);
        invoiceRepo.save(invoice);
        return toDTO(invoice);
    }

    // ────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ────────────────────────────────────────────────────────────────────────

    private Invoice buildDraftInvoice(Contract contract, Integer month, Integer year) {
        Invoice invoice = new Invoice();
        invoice.setContract(contract);
        invoice.setType(TYPE_MONTHLY);
        invoice.setPeriodMonth(month);
        invoice.setPeriodYear(year);
        invoice.setStatus(STATUS_DRAFT);
        invoice.setRoomPrice(contract.getRentPrice());

        List<InvoiceDetail> details = new ArrayList<>();
        BigDecimal serviceTotal = BigDecimal.ZERO;

        if (contract.getContractServices() != null) {
            for (ContractService cs : contract.getContractServices()) {
                ServiceItem svc = cs.getService();
                InvoiceDetail detail = new InvoiceDetail();
                detail.setInvoice(invoice);
                detail.setService(svc);
                detail.setUnitPrice(cs.getPriceAtSigning());

                if ("FIXED".equalsIgnoreCase(svc.getServiceType())) {
                    detail.setQuantity(BigDecimal.ONE);
                    detail.setSubTotal(cs.getPriceAtSigning());
                    serviceTotal = serviceTotal.add(cs.getPriceAtSigning());
                } else {
                    Long roomId = contract.getRoom().getRoomId();
                    Integer serviceId = svc.getServiceId();
                    Optional<MeterReading> existingReading = meterReadingRepo
                            .findByRoom_RoomIdAndService_ServiceIdAndPeriodMonthAndPeriodYear(
                                    roomId, serviceId, month, year);

                    if (existingReading.isPresent()) {
                        BigDecimal usage = existingReading.get().getUsageValue();
                        BigDecimal unitPrice = cs.getPriceAtSigning();
                        detail.setMeterReading(existingReading.get());
                        detail.setQuantity(usage);
                        detail.setSubTotal(unitPrice.multiply(usage));
                        serviceTotal = serviceTotal.add(detail.getSubTotal());
                    } else {
                        detail.setMeterReading(null);
                        detail.setQuantity(BigDecimal.ZERO);
                        detail.setSubTotal(BigDecimal.ZERO);
                    }
                }
                details.add(detail);
            }
        }

        invoice.setDetails(details);
        invoice.setRoomServiceAmount(serviceTotal);
        invoice.setTotalAmount(contract.getRentPrice().add(serviceTotal));
        return invoice;
    }

    private void recalculateTotal(Invoice invoice) {
        if (invoice.getDetails() == null)
            return;
        BigDecimal serviceTotal = invoice.getDetails().stream()
                .map(InvoiceDetail::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        invoice.setRoomServiceAmount(serviceTotal);
        BigDecimal roomPrice = invoice.getRoomPrice() != null ? invoice.getRoomPrice() : BigDecimal.ZERO;
        invoice.setTotalAmount(roomPrice.add(serviceTotal));
    }

    private Pageable buildPageable(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        return PageRequest.of(pageNumber, pageSize, sort);
    }

    private Invoice findInvoice(Long id) {
        return invoiceRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found: " + id));
    }

    private PageResponse<InvoiceDTO> toPageResponse(Page<Invoice> page) {
        return PageResponse.<InvoiceDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).collect(Collectors.toList()))
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .lastPage(page.isLast())
                .build();
    }

    private InvoiceDTO toDTO(Invoice invoice) {
        List<InvoiceDTO.Detail> details = new ArrayList<>();
        if (invoice.getDetails() != null) {
            details = invoice.getDetails().stream()
                    .map(this::toDetailDTO)
                    .collect(Collectors.toList());
        }

        LocalDateTime paidAt = null;
        if (STATUS_PAID.equals(invoice.getStatus()) && invoice.getPayment() != null) {
            paidAt = invoice.getPayment().getPaymentDate();
        }

        return InvoiceDTO.builder()
                .invoiceId(invoice.getInvoiceId())
                .contractId(invoice.getContract().getContractId())
                .roomName(invoice.getContract().getRoom() != null
                        ? invoice.getContract().getRoom().getRoomName()
                        : null)
                .type(invoice.getType())
                .periodMonth(invoice.getPeriodMonth())
                .periodYear(invoice.getPeriodYear())
                .roomPrice(invoice.getRoomPrice())
                .roomServiceAmount(invoice.getRoomServiceAmount())
                .totalAmount(invoice.getTotalAmount())
                .paidAmount(invoice.getPaidAmount())
                .depositId(invoice.getDeposit() != null ? invoice.getDeposit().getDepositId() : null)
                .status(invoice.getStatus())
                .dueDate(invoice.getDueDate())
                .contractStatus(invoice.getContract().getStatus().name())
                .createdAt(invoice.getCreatedAt())
                .paidAt(paidAt)
                .invoiceDetails(details)
                .build();
    }

    private InvoiceDTO.Detail toDetailDTO(InvoiceDetail d) {
        MeterReading mr = d.getMeterReading();
        return InvoiceDTO.Detail.builder()
                .invoiceDetailId(d.getInvoiceDetailID())
                .serviceId(d.getService() != null ? d.getService().getServiceId() : null)
                .serviceName(d.getService() != null ? d.getService().getServiceName() : null)
                .unit(d.getService() != null ? d.getService().getUnit() : null)
                .unitPrice(d.getUnitPrice())
                .quantity(d.getQuantity())
                .subTotal(d.getSubTotal())
                .meterReadingId(mr != null ? mr.getReadingId() : null)
                .oldValue(mr != null ? mr.getOldValue() : null)
                .newValue(mr != null ? mr.getNewValue() : null)
                .build();
    }
}