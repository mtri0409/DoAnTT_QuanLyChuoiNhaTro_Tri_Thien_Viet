package com.trithienviet.qlchuoiphongtro.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.entity.PostPublishStatus;
import com.trithienviet.qlchuoiphongtro.entity.PostType;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.PostCategoryDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostDetailDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostImageDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostRequestDTO;

import java.util.List;

public interface PostService {

    PostDetailDTO createPost(PostRequestDTO request, Long authorId);

    PostDetailDTO updatePost(Integer postId, PostRequestDTO request);

    PostDetailDTO getPostById(Integer postId);

    PostDetailDTO getPostBySlug(String slug);

    String deletePost(Integer postId);

    PostDetailDTO publishPost(Integer postId);

    PostDetailDTO archivePost(Integer postId);

    PostDetailDTO revertToDraft(Integer postId);

    PageResponse<PostDTO> getAllPosts(
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder,
            PostType type, PostPublishStatus status, Integer categoryId);

    PageResponse<PostDTO> searchPosts(
            String keyword,
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder,
            PostType type, PostPublishStatus status, Integer categoryId);

    PageResponse<PostDTO> getPublishedPosts(
            Integer pageNumber, Integer pageSize,
            PostType type, Integer categoryId);

    PageResponse<PostDTO> searchPublishedPosts(
            String keyword,
            Integer pageNumber, Integer pageSize,
            Integer categoryId);

    PostImageDTO addImage(Integer postId, MultipartFile image, Boolean isPrimary, String altText) throws IOException;

    String deleteImage(Integer postId, Integer imageId);

    PostImageDTO setPrimaryImage(Integer postId, Integer imageId);

    PostCategoryDTO createCategory(PostCategoryDTO dto);

    PostCategoryDTO updateCategory(Integer categoryId, PostCategoryDTO dto);

    String deleteCategory(Integer categoryId);

    List<PostCategoryDTO> getAllCategories();

    List<PostCategoryDTO> getActiveCategories();
}