package com.trithienviet.qlchuoiphongtro.controller;

import java.net.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.UserDTO;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleDTO;
import com.trithienviet.qlchuoiphongtro.payloads.VehicleLoadDTO;
import com.trithienviet.qlchuoiphongtro.service.VehicleService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Manager Room Application")
public class VehicleController {
    @Autowired
    private VehicleService vehicleService;

    @GetMapping("/admin/vehicles")
    public ResponseEntity<PageResponse<VehicleLoadDTO>> getAllVehicles( 
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_VEHICEL_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<VehicleLoadDTO> profileResponse = vehicleService.getAll(
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "vehicleId":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(profileResponse, HttpStatus.OK);     
    }
    @GetMapping("/admin/vehicles/history")
    public ResponseEntity<PageResponse<VehicleLoadDTO>> getAllVehicleIsDelete( 
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_VEHICEL_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<VehicleLoadDTO> profileResponse = vehicleService.getAllVehicleIsDelete(
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "vehicleId":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(profileResponse, HttpStatus.OK);     
    }
    @GetMapping("/admin/vehicles/search")
    public ResponseEntity<PageResponse<VehicleLoadDTO>> searchVehicles( 
        @RequestParam String keyword,
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_VEHICEL_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<VehicleLoadDTO> profileResponse = vehicleService.searchVehicles(
                keyword,
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "vehicleId":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(profileResponse, HttpStatus.OK);     
    }

    @GetMapping("/public/vehice/{vehicleId}")
    public ResponseEntity<VehicleLoadDTO> getVehicleById(@PathVariable Long vehicleId)
    {
        VehicleLoadDTO vehicleLoadDTO = vehicleService.getVehicleById(vehicleId);
        return new ResponseEntity<>(vehicleLoadDTO,HttpStatus.OK);
    }   

    @PostMapping("/public/vehicles/{owner_id}")
    public ResponseEntity<VehicleDTO> addVehicleForTenant(@Valid @PathVariable Long owner_id,@RequestBody VehicleDTO vehicelDTO) {
        VehicleDTO addVehicle = vehicleService.addVehicleForTenant(owner_id, vehicelDTO);
        return new ResponseEntity<VehicleDTO>(addVehicle,HttpStatus.OK);
    }
    
    @PutMapping("/public/vehicles/{vehicleId}")
    public ResponseEntity<VehicleDTO> updateVehicle(
            @PathVariable Long vehicleId, 
            @Valid @RequestBody VehicleDTO vehicleDTO) {
        
        VehicleDTO updatedVehicle = vehicleService.updateVehicle(vehicleId, vehicleDTO);
        return new ResponseEntity<>(updatedVehicle, HttpStatus.OK);
    }

    @DeleteMapping("/public/vehicles/{vehicleId}")
    public ResponseEntity<String> deleteVehicle(@PathVariable Long vehicleId) {
        String message =  vehicleService.deleteVehicle(vehicleId);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }

    @PatchMapping("/admin/vehicles/restore/{vehicleId}")
    public ResponseEntity<String> restoreVehicle(@PathVariable Long vehicleId){
        String message = vehicleService.restoreVehilcle(vehicleId);
        return new ResponseEntity<>(message,HttpStatus.OK);
    }
}
