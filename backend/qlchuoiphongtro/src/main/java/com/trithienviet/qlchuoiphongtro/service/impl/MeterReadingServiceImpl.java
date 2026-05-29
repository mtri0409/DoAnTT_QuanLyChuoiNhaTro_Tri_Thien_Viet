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

        /**
         * Lưu chỉ số điện/nước.
         *
         * @param oldValueParam Nếu frontend truyền vào (>= 0), dùng luôn giá trị này
         *                      làm oldValue — tránh backend tự tính sai khi phòng mới
         *                      có bản isInitial bị lọc ra bởi findPreviousReading.
         *                      Nếu null thì fallback về tự tính như cũ.
         * @param isInitial     true khi phòng chưa có HĐ — đánh dấu số đầu đồng hồ,
         *                      không tính vào tiêu thụ hóa đơn.
         */
        @Override
        public MetterReadingDTO saveReading(Long roomId, Integer serviceId,
                        BigDecimal newValue, Integer month, Integer year,
                        String imageUrl, BigDecimal oldValueParam, Boolean isInitial) {

                boolean isInitialRecord = Boolean.TRUE.equals(isInitial);

                Room room = roomRepo.findById(roomId)
                                .orElseThrow(() -> new RuntimeException("Room not found: " + roomId));
                ServiceItem service = serviceItemRepo.findById(serviceId)
                                .orElseThrow(() -> new RuntimeException("Service not found: " + serviceId));

                MeterReading reading = meterReadingRepo
                                .findByRoom_RoomIdAndService_ServiceIdAndPeriodMonthAndPeriodYear(
                                                roomId, serviceId, month, year)
                                .orElse(new MeterReading());

                reading.setRoom(room);
                reading.setService(service);
                reading.setPeriodMonth(month);
                reading.setPeriodYear(year);
                reading.setIsInitial(isInitialRecord);
                if (imageUrl != null)
                        reading.setImage(imageUrl);

                if (isInitialRecord) {
                        // Bản số đầu đồng hồ — không có oldValue, không tính tiêu thụ
                        reading.setOldValue(null);
                        reading.setNewValue(newValue);
                        reading.setUsageValue(BigDecimal.ZERO);
                } else {
                        // ── Xác định oldValue ──────────────────────────────────────────────────
                        // Ưu tiên giá trị frontend truyền xuống (đã tính đúng từ isInitial).
                        // Chỉ tự tính khi frontend không gửi (null) — để tương thích ngược.
                        BigDecimal oldValue;
                        if (oldValueParam != null && oldValueParam.compareTo(BigDecimal.ZERO) >= 0) {
                                // Frontend đã tính đúng (lấy từ bản isInitial hoặc kỳ trước)
                                oldValue = oldValueParam;
                        } else {
                                // Fallback bước 1: tìm bản ghi kỳ trước (period < kỳ hiện tại)
                                oldValue = meterReadingRepo
                                                .findPreviousReadingIncludingInitial(roomId, serviceId, month, year)
                                                .stream().findFirst()
                                                .map(MeterReading::getNewValue)
                                                .orElse(null);

                                if (oldValue == null) {
                                        // Fallback bước 2: thêm phòng & người thuê cùng tháng
                                        // → bản isInitial cùng tháng không tìm được bằng bước 1
                                        // → tìm riêng trong cùng period
                                        oldValue = meterReadingRepo
                                                        .findInitialReadingSameMonth(roomId, serviceId, month, year)
                                                        .stream().findFirst()
                                                        .map(MeterReading::getNewValue)
                                                        .orElse(null);
                                }

                                if (oldValue == null) {
                                        // Fallback bước 3: bản isInitial kỳ trước bất kỳ
                                        oldValue = meterReadingRepo
                                                        .findInitialReading(roomId, serviceId)
                                                        .stream().findFirst()
                                                        .map(MeterReading::getNewValue)
                                                        .orElse(BigDecimal.ZERO);
                                }
                        }
                        // ──────────────────────────────────────────────────────────────────────

                        BigDecimal usage = newValue.subtract(oldValue);
                        if (usage.compareTo(BigDecimal.ZERO) < 0)
                                throw new RuntimeException("New value (" + newValue
                                                + ") cannot be less than old value (" + oldValue + ")");

                        reading.setOldValue(oldValue);
                        reading.setNewValue(newValue);
                        reading.setUsageValue(usage);

                        MeterReading saved = meterReadingRepo.save(reading);
                        syncToInvoiceIfExists(saved, roomId, serviceId, usage, month, year);
                        return toDTO(saved);
                }

                MeterReading saved = meterReadingRepo.save(reading);
                return toDTO(saved);
        }

        private void syncToInvoiceIfExists(MeterReading reading, Long roomId,
                        Integer serviceId, BigDecimal usage, Integer month, Integer year) {

                List<com.trithienviet.qlchuoiphongtro.entity.Contract> contracts = contractRepo
                                .findByRoom_RoomIdAndIsDeletedFalse(roomId);

                var contractOpt = contracts.stream()
                                .filter(c -> c.getStatus() == ContractStatus.ACTIVE)
                                .findFirst();

                if (contractOpt.isEmpty())
                        return;

                var contract = contractOpt.get();

                var invoiceOpt = invoiceRepo.findByContract_ContractIdAndTypeAndPeriodMonthAndPeriodYear(
                                contract.getContractId(), "MONTHLY", month, year);

                if (invoiceOpt.isEmpty())
                        return;

                var invoice = invoiceOpt.get();
                if (!"DRAFT".equals(invoice.getStatus()))
                        return;

                if (invoice.getDetails() == null)
                        return;

                var detailOpt = invoice.getDetails().stream()
                                .filter(d -> d.getService() != null
                                                && d.getService().getServiceId().equals(serviceId))
                                .findFirst();

                if (detailOpt.isEmpty())
                        return;

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
                // Bước 1: tìm bản ghi có period < tháng hiện tại (kể cả isInitial kỳ trước)
                var prev = meterReadingRepo
                                .findPreviousReadingIncludingInitial(roomId, serviceId, month, year)
                                .stream().findFirst();
                if (prev.isPresent())
                        return toDTO(prev.get());

                // Bước 2: không tìm thấy kỳ trước → thêm phòng & người thuê cùng tháng
                // Tìm bản isInitial trong CÙNG THÁNG làm oldValue cho kỳ này
                return meterReadingRepo
                                .findInitialReadingSameMonth(roomId, serviceId, month, year)
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
                                .isInitial(r.getIsInitial())
                                .build();
        }
}