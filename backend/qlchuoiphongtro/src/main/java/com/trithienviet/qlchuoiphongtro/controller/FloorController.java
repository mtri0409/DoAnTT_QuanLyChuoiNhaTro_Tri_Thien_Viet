package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.trithienviet.qlchuoiphongtro.payloads.FloorDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ApiResponse;
import com.trithienviet.qlchuoiphongtro.service.FloorService;

@RestController
@RequestMapping("/api/v1")
public class FloorController {

    @Autowired
    private FloorService floorService;

    @PostMapping("/admin/floors")
    public ResponseEntity<ApiResponse<FloorDTO>> createFloor(@RequestBody FloorDTO floorDTO){
        FloorDTO created = floorService.createFloor(floorDTO);
        return new ResponseEntity<>(ApiResponse.success(created), HttpStatus.CREATED);
    }

    @PutMapping("/admin/floors/{floorId}")
    public ResponseEntity<ApiResponse<FloorDTO>> updateFloor(@PathVariable Long floorId, @RequestBody FloorDTO floorDTO){
        FloorDTO updated = floorService.updateFloor(floorId, floorDTO);
        return ResponseEntity.ok(ApiResponse.success(updated));
    }

    @DeleteMapping("/admin/floors/{floorId}")
    public ResponseEntity<ApiResponse<String>> deleteFloor(@PathVariable Long floorId){
        String msg = floorService.deleteFloor(floorId);
        return ResponseEntity.ok(ApiResponse.success(msg));
    }

    // ── Public: Chi tiết tầng (vãng lai) ────────────────────────────
    @GetMapping("/public/floors/{floorId}")
    public ResponseEntity<ApiResponse<FloorDTO>> getFloorById(@PathVariable Long floorId){
        FloorDTO floor = floorService.getFloorById(floorId);
        return ResponseEntity.ok(ApiResponse.success(floor));
    }

    // ── Public: Danh sách tầng (vãng lai) ───────────────────────────
    @GetMapping("/public/floors")
    public ResponseEntity<ApiResponse<List<FloorDTO>>> getAllFloorsPublic(){
        List<FloorDTO> floors = floorService.getAllFloors();
        return ResponseEntity.ok(ApiResponse.success(floors));
    }

    // ── Internal: Danh sách tầng (cần auth) ─────────────────────────
    @GetMapping("/admin/floors")
    public ResponseEntity<ApiResponse<List<FloorDTO>>> getAllFloors(){
        List<FloorDTO> floors = floorService.getAllFloors();
        return ResponseEntity.ok(ApiResponse.success(floors));
    }
}