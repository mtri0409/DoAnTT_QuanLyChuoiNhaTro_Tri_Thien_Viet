package com.trithienviet.qlchuoiphongtro.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.config.AppConstants;
import com.trithienviet.qlchuoiphongtro.entity.PostPublishStatus;
import com.trithienviet.qlchuoiphongtro.entity.PostType;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.PostCategoryDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostDetailDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostImageDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostRequestDTO;
import com.trithienviet.qlchuoiphongtro.service.PostService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1")
@SecurityRequirement(name = "Manager Room Application")
public class PostController {

    @Autowired
    private PostService postService;

    @PostMapping("/admin/posts")
    public ResponseEntity<PostDetailDTO> createPost(
            @Valid @RequestBody PostRequestDTO request,
            @RequestParam Long authorId) {
        PostDetailDTO created = postService.createPost(request, authorId);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/admin/posts/{postId}")
    public ResponseEntity<PostDetailDTO> updatePost(
            @PathVariable Integer postId,
            @Valid @RequestBody PostRequestDTO request) {
        return ResponseEntity.ok(postService.updatePost(postId, request));
    }

    @DeleteMapping("/admin/posts/{postId}")
    public ResponseEntity<String> deletePost(@PathVariable Integer postId) {
        return ResponseEntity.ok(postService.deletePost(postId));
    }

    @PatchMapping("/admin/posts/{postId}/publish")
    public ResponseEntity<PostDetailDTO> publishPost(@PathVariable Integer postId) {
        return ResponseEntity.ok(postService.publishPost(postId));
    }

    @PatchMapping("/admin/posts/{postId}/archive")
    public ResponseEntity<PostDetailDTO> archivePost(@PathVariable Integer postId) {
        return ResponseEntity.ok(postService.archivePost(postId));
    }

    @PatchMapping("/admin/posts/{postId}/draft")
    public ResponseEntity<PostDetailDTO> revertToDraft(@PathVariable Integer postId) {
        return ResponseEntity.ok(postService.revertToDraft(postId));
    }

    @GetMapping("/admin/posts")
    public ResponseEntity<PageResponse<PostDTO>> getAllPosts(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(required = false) PostType type,
            @RequestParam(required = false) PostPublishStatus status,
            @RequestParam(required = false) Integer categoryId) {

        return ResponseEntity.ok(postService.getAllPosts(
                Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder,
                type, status, categoryId));
    }

    @GetMapping("/admin/posts/search")
    public ResponseEntity<PageResponse<PostDTO>> searchPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(required = false) PostType type,
            @RequestParam(required = false) PostPublishStatus status,
            @RequestParam(required = false) Integer categoryId) {

        return ResponseEntity.ok(postService.searchPosts(
                keyword,
                Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder,
                type, status, categoryId));
    }

    @GetMapping("/admin/posts/{postId}")
    public ResponseEntity<PostDetailDTO> getPostById(@PathVariable Integer postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }

    @GetMapping("/public/posts/slug/{slug}")
    public ResponseEntity<PostDetailDTO> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPostBySlug(slug));
    }

    @GetMapping("/public/posts")
    public ResponseEntity<PageResponse<PostDTO>> getPublishedPosts(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(required = false) PostType type,
            @RequestParam(required = false) Integer categoryId) {

        return ResponseEntity.ok(postService.getPublishedPosts(
                Math.max(0, pageNumber - 1), pageSize, type, categoryId));
    }

    @GetMapping("/public/posts/search")
    public ResponseEntity<PageResponse<PostDTO>> searchPublishedPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(required = false) Integer categoryId) {

        return ResponseEntity.ok(postService.searchPublishedPosts(
                keyword,
                Math.max(0, pageNumber - 1), pageSize, categoryId));
    }

    @PostMapping("/admin/posts/{postId}/images")
    public ResponseEntity<PostImageDTO> addImage(
            @PathVariable Integer postId,
            @RequestParam("image") MultipartFile image,
            @RequestParam(defaultValue = "false") Boolean isPrimary,
            @RequestParam(required = false) String altText) throws IOException {

        PostImageDTO result = postService.addImage(postId, image, isPrimary, altText);
        return new ResponseEntity<>(result, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/posts/{postId}/images/{imageId}")
    public ResponseEntity<String> deleteImage(
            @PathVariable Integer postId,
            @PathVariable Integer imageId) {
        return ResponseEntity.ok(postService.deleteImage(postId, imageId));
    }

    @PatchMapping("/admin/posts/{postId}/images/{imageId}/primary")
    public ResponseEntity<PostImageDTO> setPrimaryImage(
            @PathVariable Integer postId,
            @PathVariable Integer imageId) {
        return ResponseEntity.ok(postService.setPrimaryImage(postId, imageId));
    }

    @PostMapping("/admin/post-categories")
    public ResponseEntity<PostCategoryDTO> createCategory(
            @Valid @RequestBody PostCategoryDTO dto) {
        return new ResponseEntity<>(postService.createCategory(dto), HttpStatus.CREATED);
    }

    @PutMapping("/admin/post-categories/{categoryId}")
    public ResponseEntity<PostCategoryDTO> updateCategory(
            @PathVariable Integer categoryId,
            @Valid @RequestBody PostCategoryDTO dto) {
        return ResponseEntity.ok(postService.updateCategory(categoryId, dto));
    }

    @DeleteMapping("/admin/post-categories/{categoryId}")
    public ResponseEntity<String> deleteCategory(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(postService.deleteCategory(categoryId));
    }

    @GetMapping("/admin/post-categories")
    public ResponseEntity<List<PostCategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(postService.getAllCategories());
    }

    @GetMapping("/public/post-categories")
    public ResponseEntity<List<PostCategoryDTO>> getActiveCategories() {
        return ResponseEntity.ok(postService.getActiveCategories());
    }
}
