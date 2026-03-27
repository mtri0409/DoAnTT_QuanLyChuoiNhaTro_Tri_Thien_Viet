package com.trithienviet.qlchuoiphongtro.service.impl;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.Vehicle;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleDTO;
import com.trithienviet.qlchuoiphongtro.repo.ProfileRepo;
import com.trithienviet.qlchuoiphongtro.repo.VehicleRepo;
import com.trithienviet.qlchuoiphongtro.service.VehicleService;

import jakarta.transaction.Transactional;

@Service
public class VehicleServiceImpl implements VehicleService {
    
    @Autowired
    private VehicleRepo vehicleRepo;
     
    @Autowired
    private ProfileRepo profileRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Transactional
    @Override
    public VehicleDTO addVehicleForTenant(Long profileId, VehicleDTO vehicleDTO) {

        Profile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Profile với id: " + profileId));
        Vehicle vehicle = modelMapper.map(vehicleDTO, Vehicle.class);
        vehicle.setOwner(profile);
        vehicle.setRoom(profile.getRoomMember().getContract().getRoom());
        vehicle.setLicensePlate(vehicleDTO.getLicensePlate());
        Vehicle savedVehicle = vehicleRepo.save(vehicle);
        return modelMapper.map(savedVehicle, VehicleDTO.class);        
    }

    @Transactional
    @Override
    public VehicleDTO updateVehicle(Long vehicleId, VehicleDTO vehicleDTO) {
        // 1. Tìm xe cũ trong DB
        Vehicle existingVehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        // 2. Kiểm tra nếu biển số xe thay đổi thì phải check xem biển mới có bị trùng với xe khác không
        if (!existingVehicle.getLicensePlate().equals(vehicleDTO.getLicensePlate())) {
            if (vehicleRepo.existsByLicensePlate(vehicleDTO.getLicensePlate())) {
                throw new RuntimeException("Biển số xe mới đã tồn tại trên hệ thống!");
            }
        }
        modelMapper.map(vehicleDTO, existingVehicle);
        
        Vehicle updatedVehicle = vehicleRepo.save(existingVehicle);
        return modelMapper.map(updatedVehicle, VehicleDTO.class);
    }

    @Transactional
    @Override
    public String deleteVehicle(Long vehicleId) {
     
        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "vehicleID", vehicleId));

        // 2. THỰC HIỆN XÓA MỀM
        vehicle.setStatus(true);
        
        Profile owner = vehicle.getOwner();
        if (owner != null) {
            owner.getVehicles().remove(vehicle);
        }
        vehicleRepo.save(vehicle);

        return "Đã xóa thành công";
    }
}
