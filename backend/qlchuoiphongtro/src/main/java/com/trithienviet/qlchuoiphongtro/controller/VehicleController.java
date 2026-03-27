package com.trithienviet.qlchuoiphongtro.controller;

import java.net.http.HttpHeaders;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.trithienviet.qlchuoiphongtro.payloads.VehicleDTO;
import com.trithienviet.qlchuoiphongtro.service.VehicleService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
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
}
