package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomDTO;

public interface RoomService {

    RoomDTO createRoom(RoomDTO roomDTO);

    RoomDTO updateRoom(Long roomId, RoomDTO roomDTO);

    RoomDTO getRoomById(Long roomId);

    PageResponse<RoomDTO> getAllRooms(
        Integer pageNumber,
        Integer pageSize,
        String sortBy,
        String sortOrder,
        Long floorId,
        Long branchId,
        String search
    );

    String deleteRoom(Long roomId);
}