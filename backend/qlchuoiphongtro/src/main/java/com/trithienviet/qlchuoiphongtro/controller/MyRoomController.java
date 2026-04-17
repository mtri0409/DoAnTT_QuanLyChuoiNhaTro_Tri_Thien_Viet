package com.trithienviet.qlchuoiphongtro.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.RoomDTO;
import com.trithienviet.qlchuoiphongtro.repo.RoomMemberRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.service.RoomService;

import lombok.RequiredArgsConstructor;

/**
 * Endpoint cho tenant tự lấy danh sách phòng mình đang ở.
 * GET /api/user/my-rooms
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MyRoomController {

    private final UserRepo userRepo;
    private final RoomMemberRepo roomMemberRepo; // repo đã có sẵn (dùng trong RoommatePostRepo)
    private final RoomService roomService; // đã có sẵn

    private Long getCurrentProfileId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepo.findProfileIdByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "username", username));
    }

    /**
     * Trả về danh sách phòng mà tenant hiện tại đang là thành viên (isStaying =
     * true).
     * FE dùng để hiển thị dropdown khi tạo bài tìm bạn ghép phòng.
     */
    @GetMapping("/user/my-rooms")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<RoomDTO>> getMyRooms() {
        Long profileId = getCurrentProfileId();

        // Lấy tất cả roomId mà profile đang ở (isStaying = true)
        List<Long> roomIds = roomMemberRepo.findRoomIdsByProfileIdAndIsStaying(profileId, true);

        List<RoomDTO> rooms = roomIds.stream()
                .map(roomService::getRoomById) // giả sử RoomService có getRoomById(Long) -> RoomDTO
                .collect(Collectors.toList());

        return ResponseEntity.ok(rooms);
    }
}