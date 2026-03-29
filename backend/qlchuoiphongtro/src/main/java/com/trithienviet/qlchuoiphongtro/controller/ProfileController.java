package com.trithienviet.qlchuoiphongtro.controller;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileDetailDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileImageDTO;
import com.trithienviet.qlchuoiphongtro.payloads.ProfileUpdateDTO;
import com.trithienviet.qlchuoiphongtro.service.ProfileService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;


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
    public ResponseEntity<ProfileUpdateDTO> updateProfile(@Valid @RequestBody ProfileUpdateDTO profile,@PathVariable Long profileId) {
        // Gọi Service để lưu vào DB
        ProfileUpdateDTO updateProfile = profileService.updateProfile(profile,profileId);
        
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
    public ResponseEntity<ProfileDetailDTO> getProfileById(@PathVariable Long profileId) {
        
        ProfileDetailDTO profileDTO = profileService.getProfileById(profileId);
        return new ResponseEntity<>(profileDTO,HttpStatus.OK);
    }

    @DeleteMapping("/admin/profiles/{profileId}")
    public ResponseEntity<String> deleteProfile(@PathVariable Long profileId) {
        String message = profileService.deleteProfile(profileId);
        return new ResponseEntity<String>(message, HttpStatus.OK);
    }

    @PutMapping("/public/profiles/{profileId}/id-front-image")
    public ResponseEntity<ProfileImageDTO> updateIdFrontImage(
            @PathVariable Long profileId, 
            @RequestParam("image") MultipartFile image) throws IOException {
            
        ProfileImageDTO updatedProfile = profileService.updateIdFrontImage(profileId, image);
        return ResponseEntity.ok(updatedProfile);
    }

    @PutMapping("/public/profiles/{profileId}/id-back-image")
    public ResponseEntity<ProfileImageDTO> updateIdBackImage(
            @PathVariable Long profileId, 
            @RequestParam("image") MultipartFile image) throws IOException {
            
        ProfileImageDTO updatedProfile = profileService.updateIdBackImage(profileId, image);
        return ResponseEntity.ok(updatedProfile);
    }

    @GetMapping("/public/profiles/images/{fileName}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String fileName) throws IOException {
        InputStream imageStream = profileService.getIdentificationImage(fileName);

        // Tự động nhận diện loại ảnh (png, jpg, jpeg)
        MediaType mediaType = MediaType.IMAGE_JPEG; // Mặc định
        if (fileName.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType); 
        // "inline" giúp ảnh hiện trực tiếp trên trình duyệt thay vì bị bắt tải về
        headers.setContentDisposition(ContentDisposition.inline().filename(fileName).build());
        return ResponseEntity.ok()
                .headers(headers)
                .body(new InputStreamResource(imageStream));
    }

}