package com.trithienviet.qlchuoiphongtro.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoommatePostDTO;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.service.RoommatePostService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RoommatePostController {

    private final RoommatePostService roommatePostService;
    private final UserRepo userRepo;

    private Long getCurrentProfileId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userRepo.findProfileIdByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "username", username));
    }

    private boolean isAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }

    // ── PUBLIC ────────────────────────────────────────────────────────────

    @GetMapping("/public/roommate-posts")
    public ResponseEntity<PageResponse<RoommatePostDTO>> getActivePosts(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(
                roommatePostService.getActivePosts(pageNumber, pageSize, roomId, branchId));
    }

    // FIX #2: getPostById public giờ sẽ trả 404 nếu bài EXPIRED/CLOSED (xử lý trong
    // service)
    @GetMapping("/public/roommate-posts/{postId}")
    public ResponseEntity<RoommatePostDTO> getPostById(@PathVariable Integer postId) {
        return ResponseEntity.ok(roommatePostService.getPostById(postId));
    }

    // ── USER ──────────────────────────────────────────────────────────────

    @GetMapping("/user/roommate-posts/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponse<RoommatePostDTO>> getMyPosts(
            @RequestParam(defaultValue = "0") int pageNumber,
            @RequestParam(defaultValue = "10") int pageSize) {
        Long profileId = getCurrentProfileId();
        // FIX #1: Truyền Long trực tiếp, bỏ .intValue()
        return ResponseEntity.ok(
                roommatePostService.getMyPosts(profileId, pageNumber, pageSize));
    }

    @PostMapping("/user/roommate-posts")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoommatePostDTO> createPost(
            @Valid @RequestBody RoommatePostDTO dto) {
        Long profileId = getCurrentProfileId();
        return new ResponseEntity<>(
                roommatePostService.createPost(dto, profileId), HttpStatus.CREATED);
    }

    @PutMapping("/user/roommate-posts/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<RoommatePostDTO> updatePost(
            @PathVariable Integer postId,
            @RequestBody RoommatePostDTO dto) {
        Long profileId = getCurrentProfileId();
        return ResponseEntity.ok(
                roommatePostService.updatePost(postId, dto, profileId, isAdmin()));
    }

    @DeleteMapping("/user/roommate-posts/{postId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> deletePost(@PathVariable Integer postId) {
        Long profileId = getCurrentProfileId();
        return ResponseEntity.ok(
                roommatePostService.deletePost(postId, profileId, isAdmin()));
    }

    // ── ADMIN ─────────────────────────────────────────────────────────────

    @DeleteMapping("/admin/roommate-posts/{postId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> adminDeletePost(@PathVariable Integer postId) {
        Long profileId = getCurrentProfileId();
        return ResponseEntity.ok(
                roommatePostService.deletePost(postId, profileId, true));
    }

    // FIX #4: Thêm endpoint admin update để admin không phải dùng endpoint /user
    @PutMapping("/admin/roommate-posts/{postId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RoommatePostDTO> adminUpdatePost(
            @PathVariable Integer postId,
            @RequestBody RoommatePostDTO dto) {
        Long profileId = getCurrentProfileId();
        return ResponseEntity.ok(
                roommatePostService.updatePost(postId, dto, profileId, true));
    }
}