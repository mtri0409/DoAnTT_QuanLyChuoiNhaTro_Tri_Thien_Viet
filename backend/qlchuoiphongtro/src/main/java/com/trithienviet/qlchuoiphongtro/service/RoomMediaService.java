package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomMediaDTO;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface RoomMediaService {

    PageResponse<RoomMediaDTO> getAllRoomMedias(
            Integer pageNumber,
            Integer pageSize,
            String sortBy,
            String sortOrder
    );

    RoomMediaDTO getRoomMediaById(Integer mediaId);

    List<RoomMediaDTO> getMediaByRoomId(Integer roomId);

    RoomMediaDTO createRoomMedia(MultipartFile file, Long roomId, boolean isThumbnail);

    RoomMediaDTO updateRoomMedia(Integer mediaId, MultipartFile file);

    String deleteRoomMedia(Integer mediaId);
}