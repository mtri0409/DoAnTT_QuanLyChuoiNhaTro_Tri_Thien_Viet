package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.trithienviet.qlchuoiphongtro.payloads.FloorDTO;
import com.trithienviet.qlchuoiphongtro.service.FloorService;

@RestController
@RequestMapping("/api")
public class FloorController {

    @Autowired
    private FloorService floorService;

    @PostMapping("/admin/floors")
    public ResponseEntity<FloorDTO> createFloor(@RequestBody FloorDTO floorDTO){
        FloorDTO created = floorService.createFloor(floorDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/public/floors/{floorId}")
    public ResponseEntity<FloorDTO> updateFloor(@PathVariable Long floorId, @RequestBody FloorDTO floorDTO){
        FloorDTO updated = floorService.updateFloor(floorId, floorDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admin/floors/{floorId}")
    public ResponseEntity<String> deleteFloor(@PathVariable Long floorId){
        String msg = floorService.deleteFloor(floorId);
        return ResponseEntity.ok(msg);
    }

    @GetMapping("/public/floors/{floorId}")
    public ResponseEntity<FloorDTO> getFloorById(@PathVariable Long floorId){
        FloorDTO floor = floorService.getFloorById(floorId);
        return ResponseEntity.ok(floor);
    }

    @GetMapping("/public/floors")
    public ResponseEntity<List<FloorDTO>> getAllFloors(){
        List<FloorDTO> floors = floorService.getAllFloors();
        return ResponseEntity.ok(floors);
    }
}