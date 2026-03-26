package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.entity.Profile;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;
import com.trithienviet.qlchuoiphongtro.service.ProfileService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "Manager Room Application")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PostMapping("/admin/profiles") // Chỉ Admin mới được tạo profile khách
    public ResponseEntity<ProfileDTO> createProfile(@Valid @RequestBody ProfileDTO profile) {
        // Gọi Service để lưu vào DB
        ProfileDTO createdProfile = profileService.createProfile(profile);
        
        // Trả về kèm mã 201 Created (Đúng chuẩn RESTful)
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }
       @PutMapping("/public/profiles/{profileId}") 
    public ResponseEntity<ProfileDTO> updateProfile(@Valid @RequestBody ProfileDTO profile,@PathVariable Long profileId) {
        // Gọi Service để lưu vào DB
        ProfileDTO updateProfile = profileService.updateProfile(profile,profileId);
        
        return new ResponseEntity<>(updateProfile, HttpStatus.OK);
    }
    
    @GetMapping("/admin/profiles")
    public ResponseEntity<PageResponse<ProfileDTO>> getAllProfiles( 
        @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
        @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
        @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PROFILE_BY, required = false) String sortBy,
        @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {

            PageResponse<ProfileDTO> profileResponse = profileService.getAllProfiles(
                Math.max(0,pageNumber-1),
                        pageSize, "id".equals(sortBy) ? "profileId":sortBy,
                        sortOrder) ;
        return new ResponseEntity<>(profileResponse, HttpStatus.CREATED);     
       }
    // Tri có thể thêm hàm lấy thông tin profile theo ID sau này ở đây
    @GetMapping("/public/profiles/{profileId}")
    public ResponseEntity<ProfileDTO> getProfileById(@PathVariable Long profileId) {
        
        ProfileDTO profileDTO = profileService.getProfileById(profileId);
        return new ResponseEntity<>(profileDTO,HttpStatus.OK);
    }

    @DeleteMapping("/admin/profiles/{profileId}")
    public ResponseEntity<String> deleteProfile(@PathVariable Long profileId) {
        String message = profileService.deleteProfile(profileId);
        return ResponseEntity.ok(message);
    }
    
}