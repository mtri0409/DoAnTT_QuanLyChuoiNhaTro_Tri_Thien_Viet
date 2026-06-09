package com.trithienviet.qlchuoiphongtro.controller;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

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
import com.trithienviet.qlchuoiphongtro.payloads.ProfileRequestDTO;
import com.trithienviet.qlchuoiphongtro.service.ProfileService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PostMapping("/admin/profiles")
    public ResponseEntity<ProfileRequestDTO> createProfile(@Valid @RequestBody ProfileRequestDTO profile) {
        ProfileRequestDTO createdProfile = profileService.createProfile(profile);
        return new ResponseEntity<>(createdProfile, HttpStatus.CREATED);
    }

    @PutMapping({"/admin/profiles/{profileId}", "/user/profiles/{profileId}"})
    public ResponseEntity<ProfileRequestDTO> updateProfile(@Valid @RequestBody ProfileRequestDTO profile,
            @PathVariable Long profileId) {
        ProfileRequestDTO updateProfile = profileService.updateProfile(profile, profileId);
        return new ResponseEntity<>(updateProfile, HttpStatus.OK);
    }

    @GetMapping("/admin/profiles")
    public ResponseEntity<PageResponse<ProfileDTO>> getAllProfiles(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PROFILE_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(name = "branchId", required = false) Integer branchId,
            @RequestParam(name = "status", required = false) Boolean status) {

        PageResponse<ProfileDTO> profileResponse = profileService.getAllProfiles(
                Math.max(0, pageNumber - 1),
                pageSize, "id".equals(sortBy) ? "profileId" : sortBy,
                sortOrder,
                branchId,
                status);
        return new ResponseEntity<>(profileResponse, HttpStatus.OK);
    }

    @GetMapping("/admin/profiles/search")
    public ResponseEntity<PageResponse<ProfileDTO>> searchProfiles(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PROFILE_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(name = "branchId", required = false) Integer branchId,
            @RequestParam(name = "status", required = false) Boolean status) {

        PageResponse<ProfileDTO> profileResponse = profileService.searchProfiles(
                keyword,
                Math.max(0, pageNumber - 1),
                pageSize, "id".equals(sortBy) ? "profileId" : sortBy,
                sortOrder,
                branchId,
                status);

        return new ResponseEntity<>(profileResponse, HttpStatus.OK);
    }

    @GetMapping("/admin/profiles/internal")
    public ResponseEntity<PageResponse<ProfileDTO>> getAllInternalProfiles(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PROFILE_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(name = "status", required = false) Boolean status) {

        PageResponse<ProfileDTO> profileResponse = profileService.getInternalProfiles(
                Math.max(0, pageNumber - 1),
                pageSize, "id".equals(sortBy) ? "profileId" : sortBy,
                sortOrder,
                status);
        return new ResponseEntity<>(profileResponse, HttpStatus.OK);
    }

    @GetMapping("/admin/profiles/internal/search")
    public ResponseEntity<PageResponse<ProfileDTO>> searchInternalProfiles(
            @RequestParam(name = "keyword", required = false) String keyword,
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_PROFILE_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(name = "branchId", required = false) Integer branchId,
            @RequestParam(name = "status", required = false) Boolean status) {

        PageResponse<ProfileDTO> profileResponse = profileService.searchInternalProfiles(
                keyword,
                Math.max(0, pageNumber - 1),
                pageSize, "id".equals(sortBy) ? "profileId" : sortBy,
                sortOrder,
                status);
        return new ResponseEntity<>(profileResponse, HttpStatus.OK);
    }

    @GetMapping("/admin/profiles/unassigned")
    public ResponseEntity<List<ProfileDTO>> getUnassignedProfiles() {
        return new ResponseEntity<>(profileService.getProfilesWithoutAccount(), HttpStatus.OK);
    }

    @PutMapping({"/admin/profiles/{profileId}/idfrontimage", "/user/profiles/{profileId}/idfrontimage"})
    public ResponseEntity<ProfileImageDTO> updateIdFrontImage(
            @PathVariable Long profileId,
            @RequestParam("image") MultipartFile image) throws IOException {

        ProfileImageDTO updatedProfile = profileService.updateIdFrontImage(profileId, image);
        return new ResponseEntity<>(updatedProfile, HttpStatus.OK);
    }

    @PutMapping({"/admin/profiles/{profileId}/idbackimage", "/user/profiles/{profileId}/idbackimage"})
    public ResponseEntity<ProfileImageDTO> updateIdBackImage(
            @PathVariable Long profileId,
            @RequestParam("image") MultipartFile image) throws IOException {

        ProfileImageDTO updatedProfile = profileService.updateIdBackImage(profileId, image);
        return new ResponseEntity<>(updatedProfile, HttpStatus.OK);
    }

    @GetMapping("/public/profile/image/{fileName}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String fileName) throws IOException {
        InputStream imageStream = profileService.getIdentificationImage(fileName);

        MediaType mediaType = MediaType.IMAGE_JPEG;
        if (fileName.toLowerCase().endsWith(".png")) {
            mediaType = MediaType.IMAGE_PNG;
        }
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDisposition(ContentDisposition.inline().filename(fileName).build());
        return new ResponseEntity<>(new InputStreamResource(imageStream), headers, HttpStatus.OK);
    }

    @PatchMapping("/admin/profile/restore/{profileId}")
    public ResponseEntity<String> restoreProfile(@PathVariable Long profileId) {
        String message = profileService.restoreProfile(profileId);
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}
