package com.trithienviet.qlchuoiphongtro.service;

import java.io.IOException;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.payloads.GuestRegistrationRequestDTO;
import com.trithienviet.qlchuoiphongtro.payloads.GuestRegistrationResponseDTO;

public interface GuestRegistrationService {

    /**
     * Người thuê phòng tạo đơn đăng ký người thân
     */
    GuestRegistrationResponseDTO registerGuest(GuestRegistrationRequestDTO request, Long userId)
            throws IOException;

    /**
     * Người thuê phòng upload ảnh CCCD mặt trước cho người thân
     */
    GuestRegistrationResponseDTO uploadGuestIdFrontImage(Integer memberId, MultipartFile image)
            throws IOException;

    /**
     * Người thuê phòng upload ảnh CCCD mặt sau cho người thân
     */
    GuestRegistrationResponseDTO uploadGuestIdBackImage(Integer memberId, MultipartFile image)
            throws IOException;

    /**
     * Quản lý duyệt đơn đăng ký người thân
     */
    GuestRegistrationResponseDTO approveRegistration(Integer memberId, Long adminId);

    /**
     * Quản lý từ chối đơn đăng ký người thân
     */
    GuestRegistrationResponseDTO rejectRegistration(Integer memberId, String rejectionReason, Long adminId);

    /**
     * Lấy danh sách đơn chờ duyệt
     */
    Page<GuestRegistrationResponseDTO> getPendingRegistrations(Pageable pageable);

    /**
     * Lấy danh sách người thân đã đăng ký của phòng
     */
    List<GuestRegistrationResponseDTO> getGuestsByRoom(Long roomId);

    /**
     * Lấy danh sách người thân đã duyệt của phòng
     */
    List<GuestRegistrationResponseDTO> getApprovedGuestsByRoom(Long roomId);

    /**
     * Lấy chi tiết đơn đăng ký
     */
    GuestRegistrationResponseDTO getRegistrationDetail(Integer memberId);

    /**
     * Hủy đơn đăng ký (người thân tự hủy hoặc admin hủy)
     */
    GuestRegistrationResponseDTO cancelRegistration(Integer memberId, Long userId);
}
