package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ApiResponse;
import com.trithienviet.qlchuoiphongtro.service.RoomService;

@RestController
@RequestMapping("/api/v1")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping("/admin/rooms")
    public ResponseEntity<ApiResponse<RoomDTO>> createRoom(@RequestBody RoomDTO roomDTO) {
        RoomDTO created = roomService.createRoom(roomDTO);
        return new ResponseEntity<>(ApiResponse.success(created), HttpStatus.CREATED);
    }

    @PutMapping("/admin/rooms/{roomId}")
    public ResponseEntity<ApiResponse<RoomDTO>> updateRoom(@PathVariable Long roomId, @RequestBody RoomDTO roomDTO) {
        RoomDTO updated = roomService.updateRoom(roomId, roomDTO);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/admin/rooms/{roomId}")
    public ResponseEntity<ApiResponse<String>> deleteRoom(@PathVariable Long roomId) {
        String msg = roomService.deleteRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    // ── Public: Xem chi tiết phòng (vãng lai) ──────────────────────
    @GetMapping("/public/rooms/{roomId}")
    public ResponseEntity<ApiResponse<RoomDTO>> getRoomById(@PathVariable Long roomId) {
        RoomDTO room = roomService.getRoomById(roomId);
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    // ── Internal: Xem chi tiết phòng (cần auth) ─────────────────────
    @GetMapping("/admin/rooms/{roomId}")
    public ResponseEntity<ApiResponse<RoomDTO>> getRoomByIdAuth(@PathVariable Long roomId) {
        RoomDTO room = roomService.getRoomById(roomId);
        return ResponseEntity.ok(ApiResponse.success(room));
    }

    // ── Public: Danh sách phòng đầy đủ filter (vãng lai) ───────────
    @GetMapping("/public/rooms")
    public ResponseEntity<ApiResponse<PageResponse<RoomDTO>>> getAllRoomsPublic(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "roomName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(required = false) Long floorId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer maxPeople) {
        PageResponse<RoomDTO> page = roomService.getAllRooms(
                pageNumber, pageSize, sortBy, sortOrder,
                floorId, branchId, search, status, maxPeople);
        return new ResponseEntity<>(ApiResponse.success(page), HttpStatus.OK);
    }

    // ── Internal: Danh sách phòng đầy đủ filter (cần auth) ──────────
    @GetMapping("/admin/rooms")
    public ResponseEntity<ApiResponse<PageResponse<RoomDTO>>> getAllRooms(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "roomName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder,
            @RequestParam(required = false) Long floorId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer maxPeople) {
        PageResponse<RoomDTO> page = roomService.getAllRooms(
                pageNumber, pageSize, sortBy, sortOrder,
                floorId, branchId, search, status, maxPeople);
        return new ResponseEntity<>(ApiResponse.success(page), HttpStatus.OK);
    }
}