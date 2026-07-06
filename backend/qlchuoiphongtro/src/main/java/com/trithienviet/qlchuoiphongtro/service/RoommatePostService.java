package com.trithienviet.qlchuoiphongtro.service;

import com.trithienviet.qlchuoiphongtro.entity.PostStatus;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoommatePostDTO;

public interface RoommatePostService {

    RoommatePostDTO createPost(RoommatePostDTO dto, Long authorId);

    RoommatePostDTO updatePost(Integer postId, RoommatePostDTO dto, Long callerId, boolean isAdmin);

    String deletePost(Integer postId, Long callerId, boolean isAdmin);

    RoommatePostDTO getPostById(Integer postId);

    PageResponse<RoommatePostDTO> getActivePosts(int pageNumber, int pageSize,
            Long roomId, Long branchId);

    PageResponse<RoommatePostDTO> getMyPosts(Long authorId, int pageNumber, int pageSize);

    RoommatePostDTO repostFromExpired(Integer originalPostId, Long callerId);

    PageResponse<RoommatePostDTO> getMyPosts(Long authorId, int pageNumber, int pageSize, PostStatus status);

    void expireOldPosts();
}