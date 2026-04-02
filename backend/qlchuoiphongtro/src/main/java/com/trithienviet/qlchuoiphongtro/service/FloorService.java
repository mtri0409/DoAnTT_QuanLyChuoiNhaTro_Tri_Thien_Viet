package com.trithienviet.qlchuoiphongtro.service;

import java.util.List;
import com.trithienviet.qlchuoiphongtro.payloads.FloorDTO;

public interface FloorService {
    FloorDTO createFloor(FloorDTO floorDTO);
    FloorDTO updateFloor(Long floorId, FloorDTO floorDTO);
    String deleteFloor(Long floorId);
    FloorDTO getFloorById(Long floorId);
    List<FloorDTO> getAllFloors();
}