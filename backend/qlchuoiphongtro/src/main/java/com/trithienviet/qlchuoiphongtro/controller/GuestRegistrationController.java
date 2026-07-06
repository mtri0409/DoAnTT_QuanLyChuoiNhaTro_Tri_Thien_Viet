package com.trithienviet.qlchuoiphongtro.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.payloads.GuestRegistrationApprovalDTO;
import com.trithienviet.qlchuoiphongtro.payloads.GuestRegistrationRequestDTO;
import com.trithienviet.qlchuoiphongtro.payloads.GuestRegistrationResponseDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.service.GuestRegistrationService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
public class GuestRegistrationController {

    @Autowired
    private GuestRegistrationService guestRegistrationService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private com.trithienviet.qlchuoiphongtro.repo.RoomMemberRepo roomMemberRepo;

    @PostMapping("/tenant/guests/register")
    public ResponseEntity<GuestRegistrationResponseDTO> registerGuest(
            @Valid @RequestBody GuestRegistrationRequestDTO request,
            Authentication authentication) throws IOException {

        User user = userRepo.findByUserName(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GuestRegistrationResponseDTO response = guestRegistrationService.registerGuest(
                request,
                user.getUserId()
        );

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/tenant/guests/{memberId}/id-front")
    public ResponseEntity<GuestRegistrationResponseDTO> uploadIdFrontImage(
            @PathVariable Integer memberId,
            @RequestParam("image") MultipartFile image) throws IOException {

        GuestRegistrationResponseDTO response = guestRegistrationService.uploadGuestIdFrontImage(
                memberId,
                image
        );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PutMapping("/tenant/guests/{memberId}/id-back")
    public ResponseEntity<GuestRegistrationResponseDTO> uploadIdBackImage(
            @PathVariable Integer memberId,
            @RequestParam("image") MultipartFile image) throws IOException {

        GuestRegistrationResponseDTO response = guestRegistrationService.uploadGuestIdBackImage(
                memberId,
                image
        );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/admin/guests/{memberId}/approve")
    public ResponseEntity<GuestRegistrationResponseDTO> approveRegistration(
            @PathVariable Integer memberId,
            Authentication authentication) {

        User admin = userRepo.findByUserName(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GuestRegistrationResponseDTO response = guestRegistrationService.approveRegistration(
                memberId,
                admin.getProfile().getProfileId()
        );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/admin/guests/{memberId}/reject")
    public ResponseEntity<GuestRegistrationResponseDTO> rejectRegistration(
            @PathVariable Integer memberId,
            @RequestBody GuestRegistrationApprovalDTO approval,
            Authentication authentication) {

        User admin = userRepo.findByUserName(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GuestRegistrationResponseDTO response = guestRegistrationService.rejectRegistration(
                memberId,
                approval.getRejectionReason(),
                admin.getProfile().getProfileId()
        );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/admin/guests/pending")
    public ResponseEntity<PageResponse<GuestRegistrationResponseDTO>> getPendingRegistrations(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize) {

        Pageable pageable = PageRequest.of(
                Math.max(0, pageNumber - 1),
                pageSize,
                Sort.by("registrationDate").descending()
        );

        Page<GuestRegistrationResponseDTO> result = guestRegistrationService.getPendingRegistrations(pageable);

        PageResponse<GuestRegistrationResponseDTO> pageResponse = new PageResponse<>();
        pageResponse.setContent(result.getContent());
        pageResponse.setPageNumber(result.getNumber());
        pageResponse.setPageSize(result.getSize());
        pageResponse.setTotalElements(result.getTotalElements());
        pageResponse.setTotalPages(result.getTotalPages());
        pageResponse.setLastPage(result.isLast());

        return new ResponseEntity<>(pageResponse, HttpStatus.OK);
    }

    @GetMapping("/tenant/guests")
    public ResponseEntity<List<GuestRegistrationResponseDTO>> getGuestsByRoom(
            Authentication authentication) {

        User user = userRepo.findByUserName(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long roomId = roomMemberRepo.findActiveRoomIdByProfileId(user.getProfile().getProfileId())
                .orElseThrow(() -> new RuntimeException("Bạn chưa có phòng nào đang ở"));

        List<GuestRegistrationResponseDTO> guests = guestRegistrationService.getGuestsByRoom(roomId);

        return new ResponseEntity<>(guests, HttpStatus.OK);
    }

    @GetMapping("/tenant/guests/approved")
    public ResponseEntity<List<GuestRegistrationResponseDTO>> getApprovedGuestsByRoom(
            Authentication authentication) {

        User user = userRepo.findByUserName(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long roomId = roomMemberRepo.findActiveRoomIdByProfileId(user.getProfile().getProfileId())
                .orElseThrow(() -> new RuntimeException("Bạn chưa có phòng nào đang ở"));

        List<GuestRegistrationResponseDTO> guests = guestRegistrationService.getApprovedGuestsByRoom(roomId);

        return new ResponseEntity<>(guests, HttpStatus.OK);
    }

    @GetMapping("/guests/{memberId}")
    public ResponseEntity<GuestRegistrationResponseDTO> getRegistrationDetail(
            @PathVariable Integer memberId) {

        GuestRegistrationResponseDTO response = guestRegistrationService.getRegistrationDetail(memberId);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PatchMapping("/guests/{memberId}/cancel")
    public ResponseEntity<GuestRegistrationResponseDTO> cancelRegistration(
            @PathVariable Integer memberId,
            Authentication authentication) {

        User user = userRepo.findByUserName(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        GuestRegistrationResponseDTO response = guestRegistrationService.cancelRegistration(
                memberId,
                user.getUserId()
        );

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
