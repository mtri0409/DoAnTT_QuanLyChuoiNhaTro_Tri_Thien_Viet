package com.trithienviet.qlchuoiphongtro.controller;

import com.trithienviet.qlchuoiphongtro.payloads.SchedulerConfigDTO;
import com.trithienviet.qlchuoiphongtro.service.SchedulerConfigService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
@RequiredArgsConstructor
public class SchedulerConfigController {

    private final SchedulerConfigService schedulerConfigService;

    @GetMapping("/admin/schedulers")
    public ResponseEntity<List<SchedulerConfigDTO>> getAll() {
        return new ResponseEntity<>(schedulerConfigService.getAll(), HttpStatus.OK);
    }

    @PutMapping("/admin/schedulers/{id}")
    public ResponseEntity<SchedulerConfigDTO> update(
            @PathVariable Long id,
            @RequestBody SchedulerConfigDTO dto) {
        return new ResponseEntity<>(schedulerConfigService.update(id, dto), HttpStatus.OK);
    }

    @PostMapping("/admin/schedulers/{codeKey}/trigger")
    public ResponseEntity<String> trigger(@PathVariable String codeKey) {
        boolean triggered = schedulerConfigService.trigger(codeKey);
        if (triggered) {
            return new ResponseEntity<>("Scheduler [" + codeKey + "] triggered successfully", HttpStatus.OK);
        }
        return new ResponseEntity<>("Scheduler [" + codeKey + "] not found", HttpStatus.NOT_FOUND);
    }
}
