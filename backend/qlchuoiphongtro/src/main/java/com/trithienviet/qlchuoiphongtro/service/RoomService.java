package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoomDTO;

public interface RoomService {
    
    PageResponse<RoomDTO> getAllRooms(
            Integer pageNumber,
            Integer pageSize,
            String sortBy,
            String sortOrder,
            Long floorId,
            Long branchId,
            String search,
            String status,
            Integer maxPeople
    );
    
    RoomDTO getRoomById(Long roomId);
    
    RoomDTO createRoom(RoomDTO roomDTO);
    
    RoomDTO updateRoom(Long roomId, RoomDTO roomDTO);
    
    String deleteRoom(Long roomId);
}