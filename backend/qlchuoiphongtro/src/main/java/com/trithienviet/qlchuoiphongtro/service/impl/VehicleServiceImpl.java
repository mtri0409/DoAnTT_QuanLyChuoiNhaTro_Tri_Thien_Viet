package com.trithienviet.qlchuoiphongtro.service.impl;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.swing.SortOrder;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.trithienviet.qlchuoiphongtro.entity.Contract;
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.entity.Room;
import com.trithienviet.qlchuoiphongtro.entity.RoomMember;
import com.trithienviet.qlchuoiphongtro.entity.Vehicle;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleDTO;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleLoadDTO;
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

    @Override
    public PageResponse<VehicleLoadDTO> getAll(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Vehicle> vehiclePages = vehicleRepo.findByStatusTrue(pageable);
        
        // Lấy content ra trước để Stream xác định rõ kiểu T là Vehicle
        List<VehicleLoadDTO> vehicleLoadDTOs = vehiclePages.getContent().stream()
            .map((Vehicle v) -> { // Khai báo rõ (Vehicle v) để tránh lỗi infer
                return VehicleLoadDTO.builder()
                    // Kiểm tra null để tránh lỗi khi xe chưa gán vào phòng/chủ
                    .vehicleId(v.getVehicleId())
                    .brand(v.getBrand())
                    .licensePlate(v.getLicensePlate())
                    .roomId(v.getRoom() != null ? v.getRoom().getRoomId() : null)
                    .roomName(v.getRoom() != null ? v.getRoom().getRoomName() :null)
                    .ownerId(v.getOwner() != null ? v.getOwner().getProfileId() : null)
                    .ownerName(v.getOwner() != null ? v.getOwner().getFullName() : "Khách vãng lai")
                    .status(v.getStatus()!=null ? v.getStatus() :false)
                    .build();
            })
            .collect(Collectors.toList());

        PageResponse<VehicleLoadDTO> response = new PageResponse<>();
        response.setContent(vehicleLoadDTOs);
        response.setPageNumber(vehiclePages.getNumber());
        response.setPageSize(vehiclePages.getSize());
        response.setTotalElements(vehiclePages.getTotalElements());
        response.setTotalPages(vehiclePages.getTotalPages());
        response.setLastPage(vehiclePages.isLast());
        return response;
    }
    
     @Override
    public PageResponse<VehicleLoadDTO> searchVehicles(String keyword,Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sortByAndOrder = sortOrder.equalsIgnoreCase("asc") 
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sortByAndOrder);
        Page<Vehicle> vehiclePages = vehicleRepo.searchVehicles(keyword,pageable);
        
        // Lấy content ra trước để Stream xác định rõ kiểu T là Vehicle
        List<VehicleLoadDTO> vehicleLoadDTOs = vehiclePages.getContent().stream()
            .map((Vehicle v) -> { 
                return VehicleLoadDTO.builder()
                    // Kiểm tra null để tránh lỗi khi xe chưa gán vào phòng/chủ
                    .roomId(v.getRoom() != null ? v.getRoom().getRoomId() : null)
                    .brand(v.getBrand())
                    .roomName(v.getRoom() != null ? v.getRoom().getRoomName() :null)
                    .ownerId(v.getOwner() != null ? v.getOwner().getProfileId() : null)
                    .ownerName(v.getOwner() != null ? v.getOwner().getFullName() : "Khách vãng lai")
                    .status(v.getStatus()!=null ? v.getStatus() :false)

                    .build();
            })
            .collect(Collectors.toList());

        PageResponse<VehicleLoadDTO> response = new PageResponse<>();
        response.setContent(vehicleLoadDTOs);
        response.setPageNumber(vehiclePages.getNumber());
        response.setPageSize(vehiclePages.getSize());
        response.setTotalElements(vehiclePages.getTotalElements());
        response.setTotalPages(vehiclePages.getTotalPages());
        response.setLastPage(vehiclePages.isLast());

        return response;
    }

    public VehicleLoadDTO  getVehicleById(Long vehicleId) {
        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe với Id: " + vehicleId));
        
        VehicleLoadDTO vehicleLoadDTO = modelMapper.map(vehicle, VehicleLoadDTO.class);

        // 3. Xử lý lấy tên chủ xe (Owner) an toàn
        if (vehicle.getOwner() != null) {
            vehicleLoadDTO.setOwnerName(vehicle.getOwner().getFullName());
        }

        return vehicleLoadDTO;
    }

    @Transactional
    @Override
    public VehicleDTO addVehicleForTenant(Long profileId, VehicleDTO vehicleDTO) {

        Profile profile = profileRepo.findById(profileId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Profile với id: " + profileId));
        Vehicle vehicle = modelMapper.map(vehicleDTO, Vehicle.class);
        vehicle.setOwner(profile);
        vehicle.getBrand();
        vehicle.setRoom(Optional.ofNullable(profile)
            .map(Profile::getRoomMember)
            .map(RoomMember::getContract)
            .map(Contract::getRoom)
            .orElse(null));      
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

        vehicle.setStatus(false);
        
        Profile owner = vehicle.getOwner();
        if (owner != null) {
            owner.getVehicles().remove(vehicle);
        }
        vehicleRepo.save(vehicle);

        return "Đã xóa thành công";
    }
}
