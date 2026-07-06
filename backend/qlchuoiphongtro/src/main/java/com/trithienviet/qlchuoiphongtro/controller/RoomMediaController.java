package com.trithienviet.qlchuoiphongtro.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomMediaDTO;
import com.trithienviet.qlchuoiphongtro.service.RoomMediaService;

@RestController
@RequestMapping("/api/v1")
public class RoomMediaController {

    @Autowired
    private RoomMediaService roomMediaService;

    @GetMapping("/public/room-medias")
    public ResponseEntity<PageResponse<RoomMediaDTO>> getAllRoomMedias(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "mediaId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        PageResponse<RoomMediaDTO> response = roomMediaService.getAllRoomMedias(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/admin/room-medias/{mediaId}")
    public ResponseEntity<RoomMediaDTO> getRoomMediaById(@PathVariable Integer mediaId) {
        RoomMediaDTO media = roomMediaService.getRoomMediaById(mediaId);
        return ResponseEntity.ok(media);
    }

    @GetMapping("/public/rooms/{roomId}/medias")
    public ResponseEntity<List<RoomMediaDTO>> getMediaByRoomId(@PathVariable Integer roomId) {
        List<RoomMediaDTO> medias = roomMediaService.getMediaByRoomId(roomId);
        return ResponseEntity.ok(medias);
    }

    @PostMapping(value = "/admin/room-medias", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomMediaDTO> createRoomMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam("roomId") Long roomId,
            @RequestParam(value = "isThumbnail", defaultValue = "false") boolean isThumbnail) {

        RoomMediaDTO created = roomMediaService.createRoomMedia(file, roomId, isThumbnail);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping(value = "/admin/room-medias/{mediaId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomMediaDTO> updateRoomMedia(
            @PathVariable Integer mediaId,
            @RequestParam("file") MultipartFile file) {

        RoomMediaDTO updated = roomMediaService.updateRoomMedia(mediaId, file);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/room-medias/{mediaId}")
    public ResponseEntity<String> deleteRoomMedia(@PathVariable Integer mediaId) {
        String message = roomMediaService.deleteRoomMedia(mediaId);
        return ResponseEntity.ok(message);
    }
}
