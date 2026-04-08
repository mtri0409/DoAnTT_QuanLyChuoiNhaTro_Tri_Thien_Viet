package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.MetterReadingDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

public interface MeterReadingService {

        /**
         * Nhập hoặc cập nhật chỉ số đồng hồ cho phòng trong kỳ.
         * oldValue tự động lấy từ newValue kỳ trước.
         * Nếu đã có bản ghi kỳ này → cập nhật (chỉ khi hóa đơn còn DRAFT).
         */
        MetterReadingDTO saveReading(Long roomId, Integer serviceId,
                        BigDecimal newValue,
                        Integer month, Integer year,
                        String imageUrl);

        /** Upload ảnh chụp đồng hồ — trả về URL/tên file đã lưu */
        String uploadReadingImage(MultipartFile image) throws IOException;

        MetterReadingDTO getReadingById(Long readingId);

        /** Tất cả chỉ số của phòng trong 1 kỳ (điện + nước + ...) */
        List<MetterReadingDTO> getReadingsByRoomAndPeriod(Long roomId, Integer month, Integer year);

        /** Lịch sử chỉ số của phòng — tất cả kỳ, phân trang */
        PageResponse<MetterReadingDTO> getReadingsByRoom(Long roomId,
                        Integer pageNumber, Integer pageSize,
                        String sortBy, String sortOrder);

        /** Chỉ số kỳ trước — dùng để hiển thị oldValue khi admin nhập mới */
        MetterReadingDTO getPreviousReading(Long roomId, Integer serviceId, Integer month, Integer year);

        void deleteReading(Long readingId);
}