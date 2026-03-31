package com.trithienviet.qlchuoiphongtro.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Branch;
import com.trithienviet.qlchuoiphongtro.entity.Floor;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.FloorDTO;
import com.trithienviet.qlchuoiphongtro.repo.BranchRepo;
import com.trithienviet.qlchuoiphongtro.repo.FloorRepo;
import com.trithienviet.qlchuoiphongtro.service.FloorService;

@Service
public class FloorServiceImpl implements FloorService {

        @Autowired
        private FloorRepo floorRepo;

        @Autowired
        private BranchRepo branchRepo; // ← Thêm này

        @Autowired
        private ModelMapper modelMapper;

        @Override
        public FloorDTO createFloor(FloorDTO floorDTO) {
                Floor floor = new Floor();
                floor.setFloorNumber(floorDTO.getFloorNumber());

                // ← Thêm branch từ branchId
                if (floorDTO.getBranchId() != null) {
                        Branch branch = branchRepo.findById(floorDTO.getBranchId().longValue()) // ← .longValue()
                                        .orElseThrow(() -> new ResourceNotFoundException("Branch", "branchId",
                                                        floorDTO.getBranchId().longValue()));
                        floor.setBranch(branch);
                }

                Floor saved = floorRepo.save(floor);
                return FloorDTO.builder()
                                .floorId(saved.getFloorId().intValue())
                                .floorNumber(saved.getFloorNumber())
                                .branchId(saved.getBranch() != null ? saved.getBranch().getBranchId().intValue() : null) // ←
                                                                                                                         // Include
                                                                                                                         // branchId
                                .build();
        }

        @Override
        public FloorDTO updateFloor(Long floorId, FloorDTO floorDTO) {
                Floor floor = floorRepo.findById(floorId)
                                .orElseThrow(() -> new ResourceNotFoundException("Floor", "floorId", floorId));

                floor.setFloorNumber(floorDTO.getFloorNumber());

                // ← Cập nhật branch nếu cần
                if (floorDTO.getBranchId() != null) {
                        Branch branch = branchRepo.findById(floorDTO.getBranchId().longValue()) // ← .longValue()
                                        .orElseThrow(() -> new ResourceNotFoundException("Branch", "branchId",
                                                        floorDTO.getBranchId().longValue()));
                        floor.setBranch(branch);
                }

                Floor updated = floorRepo.save(floor);
                return FloorDTO.builder()
                                .floorId(updated.getFloorId().intValue())
                                .floorNumber(updated.getFloorNumber())
                                .branchId(updated.getBranch() != null ? updated.getBranch().getBranchId().intValue()
                                                : null)
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
                                .branchId(floor.getBranch() != null ? floor.getBranch().getBranchId().intValue() : null)
                                .build();
        }

        @Override
        public List<FloorDTO> getAllFloors() {
                List<Floor> floors = floorRepo.findAll();
                return floors.stream().map(floor -> {
                        FloorDTO dto = modelMapper.map(floor, FloorDTO.class);
                        if (floor.getBranch() != null) {
                                dto.setBranchId(floor.getBranch().getBranchId().intValue());
                        }
                        return dto;
                }).collect(Collectors.toList());
        }
}