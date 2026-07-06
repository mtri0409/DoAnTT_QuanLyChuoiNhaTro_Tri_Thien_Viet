package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.trithienviet.qlchuoiphongtro.payloads.FloorDTO;
import com.trithienviet.qlchuoiphongtro.service.FloorService;

@RestController
@RequestMapping("/api/v1")
public class FloorController {

    @Autowired
    private FloorService floorService;

    @PostMapping("/admin/floors")
    public ResponseEntity<FloorDTO> createFloor(@RequestBody FloorDTO floorDTO){
        FloorDTO created = floorService.createFloor(floorDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/admin/floors/{floorId}")
    public ResponseEntity<FloorDTO> updateFloor(@PathVariable Long floorId, @RequestBody FloorDTO floorDTO){
        FloorDTO updated = floorService.updateFloor(floorId, floorDTO);
        return new ResponseEntity<>(updated, HttpStatus.OK);
    }

    @DeleteMapping("/admin/floors/{floorId}")
    public ResponseEntity<String> deleteFloor(@PathVariable Long floorId){
        String msg = floorService.deleteFloor(floorId);
        return new ResponseEntity<>(msg, HttpStatus.OK);
    }

    @GetMapping("/public/floors/{floorId}")
    public ResponseEntity<FloorDTO> getFloorById(@PathVariable Long floorId){
        FloorDTO floor = floorService.getFloorById(floorId);
        return new ResponseEntity<>(floor, HttpStatus.OK);
    }

    @GetMapping("/public/floors")
    public ResponseEntity<List<FloorDTO>> getAllFloorsPublic(){
        List<FloorDTO> floors = floorService.getAllFloors();
        return new ResponseEntity<>(floors, HttpStatus.OK);
    }

    @GetMapping("/admin/floors")
    public ResponseEntity<List<FloorDTO>> getAllFloors(){
        List<FloorDTO> floors = floorService.getAllFloors();
        return new ResponseEntity<>(floors, HttpStatus.OK);
    }
}
