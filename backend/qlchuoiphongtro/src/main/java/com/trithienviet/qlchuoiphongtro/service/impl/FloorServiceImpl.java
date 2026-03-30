package com.trithienviet.qlchuoiphongtro.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Floor;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.FloorDTO;
import com.trithienviet.qlchuoiphongtro.repo.FloorRepo;
import com.trithienviet.qlchuoiphongtro.service.FloorService;

@Service
public class FloorServiceImpl implements FloorService {

    @Autowired
    private FloorRepo floorRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public FloorDTO createFloor(FloorDTO floorDTO) {
        Floor floor = new Floor();
        floor.setFloorNumber(floorDTO.getFloorNumber());
        Floor saved = floorRepo.save(floor);
        return FloorDTO.builder()
                .floorId(saved.getFloorId().intValue())
                .floorNumber(saved.getFloorNumber())
                .build();
    }

    @Override
    public FloorDTO updateFloor(Long floorId, FloorDTO floorDTO) {
        Floor floor = floorRepo.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", floorId));
        floor.setFloorNumber(floorDTO.getFloorNumber());
        Floor updated = floorRepo.save(floor);
        return FloorDTO.builder()
                .floorId(updated.getFloorId().intValue())
                .floorNumber(updated.getFloorNumber())
                .build();
    }

    @Override
    public String deleteFloor(Long floorId) {
        Floor floor = floorRepo.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", floorId));
        floorRepo.delete(floor);
        return "Xóa tầng thành công " + floorId;
    }

    @Override
    public FloorDTO getFloorById(Long floorId) {
        Floor floor = floorRepo.findById(floorId)
                .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", floorId));
        return FloorDTO.builder()
                .floorId(floor.getFloorId().intValue())
                .floorNumber(floor.getFloorNumber())
                .build();
    }

    @Override
    public List<FloorDTO> getAllFloors() {
        return floorRepo.findAll().stream()
                .map(f -> FloorDTO.builder()
                        .floorId(f.getFloorId().intValue())
                        .floorNumber(f.getFloorNumber())
                        .build())
                .collect(Collectors.toList());
    }
}