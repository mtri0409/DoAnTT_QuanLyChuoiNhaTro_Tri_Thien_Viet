package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomDTO;
import com.trithienviet.qlchuoiphongtro.service.RoomService;

@RestController
@RequestMapping("/api/v1")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping("/admin/rooms")
    public ResponseEntity<RoomDTO> createRoom(@RequestBody RoomDTO roomDTO) {
        RoomDTO created = roomService.createRoom(roomDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/admin/rooms/{roomId}")
    public ResponseEntity<RoomDTO> updateRoom(@PathVariable Long roomId, @RequestBody RoomDTO roomDTO) {
        RoomDTO updated = roomService.updateRoom(roomId, roomDTO);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/admin/rooms/{roomId}")
    public ResponseEntity<String> deleteRoom(@PathVariable Long roomId) {
        String msg = roomService.deleteRoom(roomId);
        return new ResponseEntity<>(msg, HttpStatus.OK);
    }

    @GetMapping("/public/rooms/{roomId}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Long roomId) {
        RoomDTO room = roomService.getRoomById(roomId);
        return new ResponseEntity<>(room, HttpStatus.OK);
    }

    @GetMapping("/admin/rooms/{roomId}")
    public ResponseEntity<RoomDTO> getRoomByIdAuth(@PathVariable Long roomId) {
        RoomDTO room = roomService.getRoomById(roomId);
        return new ResponseEntity<>(room, HttpStatus.OK);
    }

    @GetMapping("/public/rooms")
    public ResponseEntity<PageResponse<RoomDTO>> getAllRoomsPublic(
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
        return new ResponseEntity<>(page, HttpStatus.OK);
    }

    @GetMapping("/admin/rooms")
    public ResponseEntity<PageResponse<RoomDTO>> getAllRooms(
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
        return new ResponseEntity<>(page, HttpStatus.OK);
    }
}
