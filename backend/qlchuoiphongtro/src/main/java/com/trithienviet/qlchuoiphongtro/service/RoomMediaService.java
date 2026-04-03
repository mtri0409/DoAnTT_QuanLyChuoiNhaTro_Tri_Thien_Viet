package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomMediaDTO;
import java.util.List;

public interface RoomMediaService {

    PageResponse<RoomMediaDTO> getAllRoomMedias(
            Integer pageNumber,
            Integer pageSize,
            String sortBy,
            String sortOrder
    );

    RoomMediaDTO getRoomMediaById(Integer mediaId);

    List<RoomMediaDTO> getMediaByRoomId(Integer roomId);

    RoomMediaDTO createRoomMedia(RoomMediaDTO roomMediaDTO);

    RoomMediaDTO updateRoomMedia(Integer mediaId, RoomMediaDTO roomMediaDTO);

    String deleteRoomMedia(Integer mediaId);
}