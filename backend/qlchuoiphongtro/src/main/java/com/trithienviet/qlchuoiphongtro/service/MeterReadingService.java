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
         *
         * @param oldValueParam Nếu frontend truyền vào (>= 0), dùng luôn giá trị này
         *                      làm oldValue thay vì để backend tự tìm. Truyền null để
         *                      backend tự tính (tương thích ngược).
         *                      Bắt buộc truyền khi phòng mới có bản isInitial cùng
         *                      tháng để tránh oldValue = 0 sai.
         * @param isInitial     true khi phòng chưa có HĐ — đánh dấu đây là số đầu
         *                      đồng hồ, không tính vào tiêu thụ hóa đơn.
         */
        MetterReadingDTO saveReading(Long roomId, Integer serviceId,
                        BigDecimal newValue,
                        Integer month, Integer year,
                        String imageUrl,
                        BigDecimal oldValueParam,
                        Boolean isInitial);

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