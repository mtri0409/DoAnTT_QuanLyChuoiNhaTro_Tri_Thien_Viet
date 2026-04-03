package com.trithienviet.qlchuoiphongtro.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomMediaDTO;
import com.trithienviet.qlchuoiphongtro.service.RoomMediaService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class RoomMediaController {

    @Autowired
    private RoomMediaService roomMediaService;

    @GetMapping("/admin/room-medias")
    public ResponseEntity<PageResponse<RoomMediaDTO>> getAllRoomMedias(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "mediaId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        PageResponse<RoomMediaDTO> response = roomMediaService.getAllRoomMedias(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/public/room-medias/{mediaId}")
    public ResponseEntity<RoomMediaDTO> getRoomMediaById(@PathVariable Integer mediaId) {
        RoomMediaDTO media = roomMediaService.getRoomMediaById(mediaId);
        return ResponseEntity.ok(media);
    }

    @GetMapping("/public/rooms/{roomId}/medias")
    public ResponseEntity<List<RoomMediaDTO>> getMediaByRoomId(@PathVariable Integer roomId) {
        List<RoomMediaDTO> medias = roomMediaService.getMediaByRoomId(roomId);
        return ResponseEntity.ok(medias);
    }

    @PostMapping("/admin/room-medias")
    public ResponseEntity<RoomMediaDTO> createRoomMedia(@Valid @RequestBody RoomMediaDTO roomMediaDTO) {
        RoomMediaDTO created = roomMediaService.createRoomMedia(roomMediaDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/admin/room-medias/{mediaId}")
    public ResponseEntity<RoomMediaDTO> updateRoomMedia(
            @PathVariable Integer mediaId,
            @Valid @RequestBody RoomMediaDTO roomMediaDTO) {

        RoomMediaDTO updated = roomMediaService.updateRoomMedia(mediaId, roomMediaDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/room-medias/{mediaId}")
    public ResponseEntity<String> deleteRoomMedia(@PathVariable Integer mediaId) {
        String message = roomMediaService.deleteRoomMedia(mediaId);
        return ResponseEntity.ok(message);
    }
}