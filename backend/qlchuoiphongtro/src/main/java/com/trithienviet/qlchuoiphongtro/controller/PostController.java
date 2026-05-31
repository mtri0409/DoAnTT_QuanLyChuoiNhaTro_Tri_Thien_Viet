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
import com.trithienviet.qlchuoiphongtro.payloads.ApiResponse;
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

    // ================================================================== //
    // CRUD bài đăng — Admin / Staff //
    // ================================================================== //

    /**
     * POST /api/v1/admin/posts?authorId={id}
     * Tạo bài đăng mới (mặc định DRAFT). Chỉ ADMIN hoặc STAFF.
     */
    @PostMapping("/admin/posts")
    public ResponseEntity<ApiResponse<PostDetailDTO>> createPost(
            @Valid @RequestBody PostRequestDTO request,
            @RequestParam Long authorId) {
        PostDetailDTO created = postService.createPost(request, authorId);
        return new ResponseEntity<>(ApiResponse.success(created), HttpStatus.CREATED);
    }

    /**
     * PUT /api/v1/admin/posts/{postId}
     * Cập nhật nội dung bài đăng.
     */
    @PutMapping("/admin/posts/{postId}")
    public ResponseEntity<ApiResponse<PostDetailDTO>> updatePost(
            @PathVariable Integer postId,
            @Valid @RequestBody PostRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(postService.updatePost(postId, request)));
    }

    /**
     * DELETE /api/v1/admin/posts/{postId}
     * Xoá bài đăng (xoá cả ảnh liên quan).
     */
    @DeleteMapping("/admin/posts/{postId}")
    public ResponseEntity<ApiResponse<String>> deletePost(@PathVariable Integer postId) {
        return ResponseEntity.ok(ApiResponse.success(postService.deletePost(postId)));
    }

    // ================================================================== //
    // Quản lý trạng thái xuất bản — Admin / Staff //
    // ================================================================== //

    /**
     * PATCH /api/v1/admin/posts/{postId}/publish
     * Xuất bản bài đăng (DRAFT → PUBLISHED).
     */
    @PatchMapping("/admin/posts/{postId}/publish")
    public ResponseEntity<ApiResponse<PostDetailDTO>> publishPost(@PathVariable Integer postId) {
        return ResponseEntity.ok(ApiResponse.success(postService.publishPost(postId)));
    }

    /**
     * PATCH /api/v1/admin/posts/{postId}/archive
     * Lưu trữ bài đăng (PUBLISHED → ARCHIVED).
     */
    @PatchMapping("/admin/posts/{postId}/archive")
    public ResponseEntity<ApiResponse<PostDetailDTO>> archivePost(@PathVariable Integer postId) {
        return ResponseEntity.ok(ApiResponse.success(postService.archivePost(postId)));
    }

    /**
     * PATCH /api/v1/admin/posts/{postId}/draft
     * Kéo bài đăng về DRAFT để chỉnh sửa lại.
     */
    @PatchMapping("/admin/posts/{postId}/draft")
    public ResponseEntity<ApiResponse<PostDetailDTO>> revertToDraft(@PathVariable Integer postId) {
        return ResponseEntity.ok(ApiResponse.success(postService.revertToDraft(postId)));
    }

    // ================================================================== //
    // Danh sách & tìm kiếm — Admin //
    // ================================================================== //

    /**
     * GET /api/v1/admin/posts
     * Lấy tất cả bài đăng (admin), lọc theo type / status / category.
     */
    @GetMapping("/admin/posts")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> getAllPosts(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(required = false) PostType type,
            @RequestParam(required = false) PostPublishStatus status,
            @RequestParam(required = false) Integer categoryId) {

        return ResponseEntity.ok(ApiResponse.success(postService.getAllPosts(
                Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder,
                type, status, categoryId)));
    }

    /**
     * GET /api/v1/admin/posts/search?keyword=...
     * Tìm kiếm bài đăng theo keyword (admin).
     */
    @GetMapping("/admin/posts/search")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> searchPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(defaultValue = "createdAt", required = false) String sortBy,
            @RequestParam(defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder,
            @RequestParam(required = false) PostType type,
            @RequestParam(required = false) PostPublishStatus status,
            @RequestParam(required = false) Integer categoryId) {

        return ResponseEntity.ok(ApiResponse.success(postService.searchPosts(
                keyword,
                Math.max(0, pageNumber - 1), pageSize, sortBy, sortOrder,
                type, status, categoryId)));
    }

    // ================================================================== //
    // Xem bài đăng — Public & Admin //
    // ================================================================== //

    /**
     * GET /api/v1/public/posts/{postId}
     * Lấy chi tiết bài đăng theo ID (admin xem bất kỳ trạng thái).
     */
    @GetMapping("/admin/posts/{postId}")
    public ResponseEntity<ApiResponse<PostDetailDTO>> getPostById(@PathVariable Integer postId) {
        return ResponseEntity.ok(ApiResponse.success(postService.getPostById(postId)));
    }

    /**
     * GET /api/v1/public/posts/slug/{slug}
     * Lấy chi tiết bài đăng theo slug (SEO-friendly, chỉ PUBLISHED).
     */
    @GetMapping("/public/posts/slug/{slug}")
    public ResponseEntity<ApiResponse<PostDetailDTO>> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(postService.getPostBySlug(slug)));
    }

    /**
     * GET /api/v1/public/posts
     * Danh sách bài đăng đã PUBLISHED — dùng cho trang tin tức người dùng.
     * Hỗ trợ lọc theo type (ARTICLE / BANNER) và category.
     */
    @GetMapping("/public/posts")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> getPublishedPosts(
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(required = false) PostType type,
            @RequestParam(required = false) Integer categoryId) {

        return ResponseEntity.ok(ApiResponse.success(postService.getPublishedPosts(
                Math.max(0, pageNumber - 1), pageSize, type, categoryId)));
    }

    /**
     * GET /api/v1/public/posts/search?keyword=...&categoryId=...
     * Tìm kiếm bài đăng PUBLISHED (người dùng tìm trên trang tin tức).
     */
    @GetMapping("/public/posts/search")
    public ResponseEntity<ApiResponse<PageResponse<PostDTO>>> searchPublishedPosts(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(required = false) Integer categoryId) {

        return ResponseEntity.ok(ApiResponse.success(postService.searchPublishedPosts(
                keyword,
                Math.max(0, pageNumber - 1), pageSize, categoryId)));
    }

    // ================================================================== //
    // Quản lý ảnh bài đăng — Admin / Staff //
    // ================================================================== //

    /**
     * POST /api/v1/admin/posts/{postId}/images
     * Upload thêm ảnh cho bài đăng.
     * isPrimary=true → đặt làm ảnh đại diện (thumbnail / banner chính).
     */
    @PostMapping("/admin/posts/{postId}/images")
    public ResponseEntity<ApiResponse<PostImageDTO>> addImage(
            @PathVariable Integer postId,
            @RequestParam("image") MultipartFile image,
            @RequestParam(defaultValue = "false") Boolean isPrimary,
            @RequestParam(required = false) String altText) throws IOException {

        PostImageDTO result = postService.addImage(postId, image, isPrimary, altText);
        return new ResponseEntity<>(ApiResponse.success(result), HttpStatus.CREATED);
    }

    /**
     * DELETE /api/v1/admin/posts/{postId}/images/{imageId}
     * Xoá một ảnh khỏi bài đăng.
     */
    @DeleteMapping("/admin/posts/{postId}/images/{imageId}")
    public ResponseEntity<ApiResponse<String>> deleteImage(
            @PathVariable Integer postId,
            @PathVariable Integer imageId) {
        return ResponseEntity.ok(ApiResponse.success(postService.deleteImage(postId, imageId)));
    }

    /**
     * PATCH /api/v1/admin/posts/{postId}/images/{imageId}/primary
     * Đặt ảnh này làm ảnh đại diện (primary) của bài đăng.
     */
    @PatchMapping("/admin/posts/{postId}/images/{imageId}/primary")
    public ResponseEntity<ApiResponse<PostImageDTO>> setPrimaryImage(
            @PathVariable Integer postId,
            @PathVariable Integer imageId) {
        return ResponseEntity.ok(ApiResponse.success(postService.setPrimaryImage(postId, imageId)));
    }

    // ================================================================== //
    // Quản lý danh mục (PostCategory) //
    // ================================================================== //

    /**
     * POST /api/v1/admin/post-categories
     * Tạo danh mục mới (Xu hướng, Cảnh báo, ...).
     */
    @PostMapping("/admin/post-categories")
    public ResponseEntity<ApiResponse<PostCategoryDTO>> createCategory(
            @Valid @RequestBody PostCategoryDTO dto) {
        return new ResponseEntity<>(ApiResponse.success(postService.createCategory(dto)), HttpStatus.CREATED);
    }

    /**
     * PUT /api/v1/admin/post-categories/{categoryId}
     * Cập nhật danh mục.
     */
    @PutMapping("/admin/post-categories/{categoryId}")
    public ResponseEntity<ApiResponse<PostCategoryDTO>> updateCategory(
            @PathVariable Integer categoryId,
            @Valid @RequestBody PostCategoryDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(postService.updateCategory(categoryId, dto)));
    }

    /**
     * DELETE /api/v1/admin/post-categories/{categoryId}
     * Xoá danh mục.
     */
    @DeleteMapping("/admin/post-categories/{categoryId}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Integer categoryId) {
        return ResponseEntity.ok(ApiResponse.success(postService.deleteCategory(categoryId)));
    }

    /**
     * GET /api/v1/admin/post-categories
     * Lấy tất cả danh mục (kể cả inactive) — dành cho admin quản lý.
     */
    @GetMapping("/admin/post-categories")
    public ResponseEntity<ApiResponse<List<PostCategoryDTO>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(postService.getAllCategories()));
    }

    /**
     * GET /api/v1/public/post-categories
     * Lấy danh mục active — dùng để render menu lọc tin tức (Tất cả | Xu hướng |
     * ...).
     */
    @GetMapping("/public/post-categories")
    public ResponseEntity<ApiResponse<List<PostCategoryDTO>>> getActiveCategories() {
        return ResponseEntity.ok(ApiResponse.success(postService.getActiveCategories()));
    }
}