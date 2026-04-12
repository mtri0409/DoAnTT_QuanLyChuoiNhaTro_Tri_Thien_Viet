package com.trithienviet.qlchuoiphongtro.service.impl;

import com.trithienviet.qlchuoiphongtro.entity.ContractStatus;
import com.trithienviet.qlchuoiphongtro.entity.InvoiceDetail;
import com.trithienviet.qlchuoiphongtro.entity.MeterReading;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.ServiceItem;
import com.trithienviet.qlchuoiphongtro.payloads.MetterReadingDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.repo.ContractRepo;
import com.trithienviet.qlchuoiphongtro.repo.InvoiceRepo;
import com.trithienviet.qlchuoiphongtro.repo.MeterReadingRepo;
import com.trithienviet.qlchuoiphongtro.repo.RoomRepo;
import com.trithienviet.qlchuoiphongtro.repo.ServiceItemRepo;
import com.trithienviet.qlchuoiphongtro.service.MeterReadingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class MeterReadingServiceImpl implements MeterReadingService {

        private final MeterReadingRepo meterReadingRepo;
        private final RoomRepo roomRepo;
        private final ServiceItemRepo serviceItemRepo;
        private final InvoiceRepo invoiceRepo;
        private final ContractRepo contractRepo;

        @Value("${project.image.path:uploads/meter-readings/}")
        private String uploadDir;

        @Override
        public String uploadReadingImage(MultipartFile image) throws IOException {
                String originalName = image.getOriginalFilename();
                String extension = originalName != null && originalName.contains(".")
                                ? originalName.substring(originalName.lastIndexOf("."))
                                : ".jpg";
                String fileName = UUID.randomUUID() + extension;
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath))
                        Files.createDirectories(uploadPath);
                Files.copy(image.getInputStream(), uploadPath.resolve(fileName));
                return fileName;
        }

        @Override
        public MetterReadingDTO saveReading(Long roomId, Integer serviceId,
                        BigDecimal newValue, Integer month, Integer year, String imageUrl) {

                Room room = roomRepo.findById(roomId)
                                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));
                ServiceItem service = serviceItemRepo.findById(serviceId)
                                .orElseThrow(() -> new RuntimeException("Service not found: " + serviceId));

                BigDecimal oldValue = meterReadingRepo
                                .findPreviousReading(roomId, serviceId, month, year)
                                .stream().findFirst()
                                .map(MeterReading::getNewValue)
                                .orElse(BigDecimal.ZERO);

                BigDecimal usage = newValue.subtract(oldValue);
                if (usage.compareTo(BigDecimal.ZERO) < 0)
                        throw new RuntimeException("New value (" + newValue + ") cannot be less than old value ("
                                        + oldValue + ")");

                MeterReading reading = meterReadingRepo
                                .findByRoom_RoomIdAndService_ServiceIdAndPeriodMonthAndPeriodYear(
                                                roomId, serviceId, month, year)
                                .orElse(new MeterReading());

                reading.setRoom(room);
                reading.setService(service);
                reading.setOldValue(oldValue);
                reading.setNewValue(newValue);
                reading.setUsageValue(usage);
                reading.setPeriodMonth(month);
                reading.setPeriodYear(year);
                if (imageUrl != null)
                        reading.setImage(imageUrl);

                MeterReading saved = meterReadingRepo.save(reading);

                syncToInvoiceIfExists(saved, roomId, serviceId, usage, month, year);

                return toDTO(saved);
        }

        private void syncToInvoiceIfExists(MeterReading reading, Long roomId,
                        Integer serviceId, BigDecimal usage, Integer month, Integer year) {

                // ── BƯỚC 1: tìm contract ──────────────────────────────────────────────
                List<com.trithienviet.qlchuoiphongtro.entity.Contract> contracts = contractRepo
                                .findByRoom_RoomIdAndIsDeletedFalse(roomId);

                System.out.println(">>> [SYNC] roomId=" + roomId
                                + " | contracts found=" + contracts.size()
                                + " | month=" + month + " year=" + year
                                + " | serviceId=" + serviceId + " usage=" + usage);

                contracts.forEach(c -> System.out.println(">>>   contract #" + c.getContractId()
                                + " status=" + c.getStatus() + " isDeleted=" + c.getIsDeleted()));

                var contractOpt = contracts.stream()
                                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                                .findFirst();

                if (contractOpt.isEmpty()) {
                        System.out.println(">>> [SYNC] STOP — no ACTIVE contract for roomId=" + roomId);
                        return;
                }

                var contract = contractOpt.get();
                System.out.println(">>> [SYNC] ACTIVE contract #" + contract.getContractId());

                // ── BƯỚC 2: tìm invoice ───────────────────────────────────────────────
                var invoiceOpt = invoiceRepo.findByContract_ContractIdAndTypeAndPeriodMonthAndPeriodYear(
                                contract.getContractId(), "MONTHLY", month, year);

                if (invoiceOpt.isEmpty()) {
                        System.out.println(">>> [SYNC] STOP — no invoice for contractId="
                                        + contract.getContractId() + " month=" + month + " year=" + year);
                        return;
                }

                var invoice = invoiceOpt.get();
                System.out.println(">>> [SYNC] invoice #" + invoice.getInvoiceId()
                                + " status=" + invoice.getStatus());

                if (!"DRAFT".equals(invoice.getStatus())) {
                        System.out.println(">>> [SYNC] STOP — invoice not DRAFT, status=" + invoice.getStatus());
                        return;
                }

                // ── BƯỚC 3: tìm detail ───────────────────────────────────────────────
                System.out.println(">>> [SYNC] details count=" +
                                (invoice.getDetails() != null ? invoice.getDetails().size() : "NULL"));

                if (invoice.getDetails() != null) {
                        invoice.getDetails().forEach(d -> System.out.println(">>>   detail serviceId="
                                        + (d.getService() != null ? d.getService().getServiceId() : "NULL")));
                }

                if (invoice.getDetails() == null) {
                        System.out.println(">>> [SYNC] STOP — details list is NULL");
                        return;
                }

                var detailOpt = invoice.getDetails().stream()
                                .filter(d -> d.getService() != null
                                                && d.getService().getServiceId().equals(serviceId))
                                .findFirst();

                if (detailOpt.isEmpty()) {
                        System.out.println(">>> [SYNC] STOP — no detail for serviceId=" + serviceId);
                        return;
                }

                // ── BƯỚC 4: cập nhật ─────────────────────────────────────────────────
                var detail = detailOpt.get();
                BigDecimal unitPrice = detail.getUnitPrice() != null ? detail.getUnitPrice() : BigDecimal.ZERO;
                detail.setMeterReading(reading);
                detail.setQuantity(usage);
                detail.setSubTotal(unitPrice.multiply(usage));

                BigDecimal serviceTotal = invoice.getDetails().stream()
                                .map(InvoiceDetail::getSubTotal)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                invoice.setRoomServiceAmount(serviceTotal);
                BigDecimal roomPrice = invoice.getRoomPrice() != null ? invoice.getRoomPrice() : BigDecimal.ZERO;
                invoice.setTotalAmount(roomPrice.add(serviceTotal));

                invoiceRepo.save(invoice);
                System.out.println(">>> [SYNC] SUCCESS — invoiceId=" + invoice.getInvoiceId()
                                + " serviceTotal=" + serviceTotal + " totalAmount=" + invoice.getTotalAmount());
        }

        @Override
        @Transactional(readOnly = true)
        public MetterReadingDTO getReadingById(Long readingId) {
                return toDTO(meterReadingRepo.findById(readingId)
                                .orElseThrow(() -> new RuntimeException("MeterReading not found: " + readingId)));
        }

        @Override
        @Transactional(readOnly = true)
        public List<MetterReadingDTO> getReadingsByRoomAndPeriod(Long roomId, Integer month, Integer year) {
                return meterReadingRepo
                                .findByRoom_RoomIdAndPeriodMonthAndPeriodYear(roomId, month, year)
                                .stream().map(this::toDTO).collect(Collectors.toList());
        }

        @Override
        @Transactional(readOnly = true)
        public PageResponse<MetterReadingDTO> getReadingsByRoom(Long roomId,
                        Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
                Sort sort = sortOrder.equalsIgnoreCase("asc")
                                ? Sort.by(sortBy).ascending()
                                : Sort.by(sortBy).descending();
                Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
                Page<MeterReading> page = meterReadingRepo.findByRoom_RoomId(roomId, pageable);
                return PageResponse.<MetterReadingDTO>builder()
                                .content(page.getContent().stream().map(this::toDTO).collect(Collectors.toList()))
                                .pageNumber(page.getNumber())
                                .pageSize(page.getSize())
                                .totalElements(page.getTotalElements())
                                .totalPages(page.getTotalPages())
                                .lastPage(page.isLast())
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public MetterReadingDTO getPreviousReading(Long roomId, Integer serviceId,
                        Integer month, Integer year) {
                return meterReadingRepo
                                .findPreviousReading(roomId, serviceId, month, year)
                                .stream().findFirst()
                                .map(this::toDTO)
                                .orElse(null);
        }

        @Override
        public void deleteReading(Long readingId) {
                if (!meterReadingRepo.existsById(readingId))
                        throw new RuntimeException("MeterReading not found: " + readingId);
                meterReadingRepo.deleteById(readingId);
        }

        private MetterReadingDTO toDTO(MeterReading r) {
                return MetterReadingDTO.builder()
                                .readingId(r.getReadingId())
                                .roomId(r.getRoom() != null ? r.getRoom().getRoomId() : null)
                                .roomName(r.getRoom() != null ? r.getRoom().getRoomName() : null)
                                .serviceId(r.getService() != null ? r.getService().getServiceId() : null)
                                .serviceName(r.getService() != null ? r.getService().getServiceName() : null)
                                .oldValue(r.getOldValue())
                                .newValue(r.getNewValue())
                                .usageValue(r.getUsageValue())
                                .image(r.getImage())
                                .readingDate(r.getReadingDate())
                                .build();
        }
}