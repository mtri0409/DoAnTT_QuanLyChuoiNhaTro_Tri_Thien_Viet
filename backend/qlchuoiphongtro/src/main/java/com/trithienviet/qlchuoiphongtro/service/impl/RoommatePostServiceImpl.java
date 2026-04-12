package com.trithienviet.qlchuoiphongtro.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.trithienviet.qlchuoiphongtro.entity.*;
import com.trithienviet.qlchuoiphongtro.exceptions.APIException;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.RoommatePostDTO;
import com.trithienviet.qlchuoiphongtro.repo.*;
import com.trithienviet.qlchuoiphongtro.service.RoommatePostService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoommatePostServiceImpl implements RoommatePostService {

    private final RoommatePostRepo postRepo;
    private final RoomRepo roomRepo;
    private final ProfileRepo profileRepo;

    @Value("${roommate.post.daily-limit:3}")
    private int dailyLimit;

    @Value("${roommate.post.expire-days:30}")
    private int expireDays;

    // ── Tạo bài ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoommatePostDTO createPost(RoommatePostDTO dto, Long authorId) {

        if (dto.getRoomId() == null) {
            throw new APIException("roomId không được để trống.");
        }
        if (dto.getDescription() == null || dto.getDescription().isBlank()) {
            throw new APIException("Mô tả không được để trống.");
        }
        if (dto.getDescription().length() < 20) {
            throw new APIException("Mô tả phải có ít nhất 20 ký tự.");
        }

        Profile author = profileRepo.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", "id", authorId));

        Room room = roomRepo.findById(dto.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Phòng", "id", dto.getRoomId()));

        // Kiểm tra người đăng có đang ở phòng đó không
        if (postRepo.countActiveRoomMember(authorId, dto.getRoomId()) == 0) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không phải thành viên đang ở phòng " + room.getRoomName()
                            + ". Chỉ thành viên trong phòng mới được đăng bài.");
        }

        // FIX #1: Truyền Long thay vì Integer vào checkDailyLimit
        checkDailyLimit(authorId);

        if (postRepo.countActivePostsByRoom(room.getRoomId()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Phòng " + room.getRoomName() + " đã có bài đăng đang mở. "
                            + "Vui lòng đóng bài cũ trước khi đăng bài mới.");
        }

        RoommatePost post = new RoommatePost();
        post.setDescription(dto.getDescription());
        post.setStatus(PostStatus.ACTIVE);
        post.setRoom(room);
        post.setProfile(author);
        post.setExpiresAt(LocalDateTime.now().plusDays(expireDays));

        RoommatePost saved = postRepo.save(post);
        log.info("Tác giả [{}] tạo bài đăng [{}] cho phòng [{}]",
                authorId, saved.getPostId(), room.getRoomId());
        return mapToDTO(saved);
    }

    // ── Cập nhật bài ──────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoommatePostDTO updatePost(Integer postId, RoommatePostDTO dto,
            Long callerId, boolean isAdmin) {
        RoommatePost post = findPostOrThrow(postId);
        checkOwnership(post, callerId, isAdmin);

        if (post.getStatus() == PostStatus.EXPIRED) {
            throw new APIException("Bài đăng #" + postId + " đã hết hạn, không thể chỉnh sửa.");
        }
        if (dto.getDescription() != null && !dto.getDescription().isBlank()) {
            if (dto.getDescription().length() < 20) {
                throw new APIException("Mô tả phải có ít nhất 20 ký tự.");
            }
            post.setDescription(dto.getDescription());
        }
        if (dto.getStatus() != null) {
            if (dto.getStatus() == PostStatus.EXPIRED) {
                throw new APIException("Không thể tự đặt trạng thái EXPIRED. Bài sẽ tự động hết hạn.");
            }
            post.setStatus(dto.getStatus());
            log.info("Bài [{}] cập nhật trạng thái -> {}", postId, dto.getStatus());
        }
        return mapToDTO(postRepo.save(post));
    }

    // ── Xóa bài ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public String deletePost(Integer postId, Long callerId, boolean isAdmin) {
        RoommatePost post = findPostOrThrow(postId);
        checkOwnership(post, callerId, isAdmin);
        postRepo.delete(post);
        log.info("Bài [{}] đã bị xóa bởi [{}]", postId, callerId);
        return "Bài đăng #" + postId + " đã được xóa thành công.";
    }

    // ── Đọc ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public RoommatePostDTO getPostById(Integer postId) {
        RoommatePost post = findPostOrThrow(postId);
        // FIX #2: Chặn truy cập public vào bài EXPIRED hoặc CLOSED
        if (post.getStatus() != PostStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Bài đăng #" + postId + " không còn hiển thị.");
        }
        return mapToDTO(post);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoommatePostDTO> getActivePosts(int pageNumber, int pageSize,
            Long roomId, Long branchId) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
        return buildPageResponse(postRepo.findActivePostsFiltered(roomId, branchId, pageable));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoommatePostDTO> getMyPosts(Long authorId, int pageNumber, int pageSize) {
        // FIX #1: Nhận Long thay vì Integer
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
        return buildPageResponse(postRepo.findByAuthor(authorId, pageable));
    }

    // ── Scheduled job ─────────────────────────────────────────────────────

    @Override
    @Scheduled(cron = "0 5 0 * * *")
    @Transactional
    public void expireOldPosts() {
        int count = postRepo.expireOldPosts(LocalDateTime.now());
        if (count > 0) {
            log.info("[Scheduler] Đã expire {} bài đăng tìm bạn ghép.", count);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────

    // FIX #1: Đổi param thành Long để khớp với Profile.profileId và repo query
    private void checkDailyLimit(Long authorId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        long count = postRepo.countPostsByAuthorAndDate(authorId, startOfDay, endOfDay);
        if (count >= dailyLimit) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Bạn đã đạt giới hạn " + dailyLimit + " bài đăng mỗi ngày. "
                            + "Vui lòng thử lại vào ngày mai.");
        }
    }

    private RoommatePost findPostOrThrow(Integer postId) {
        return postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài đăng", "id", postId));
    }

    // FIX #1: Đổi callerId thành Long để tránh ép kiểu ngầm
    private void checkOwnership(RoommatePost post, Long callerId, boolean isAdmin) {
        if (!isAdmin && !post.getProfile().getProfileId().equals(callerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thực hiện hành động này.");
        }
    }

    // FIX #3: Bổ sung branchName vào mapToDTO
    private RoommatePostDTO mapToDTO(RoommatePost post) {
        return RoommatePostDTO.builder()
                .postId(post.getPostId())
                .roomId(post.getRoom().getRoomId())
                .roomName(post.getRoom().getRoomName())
                .branchName(post.getRoom().getFloor().getBranch().getBranchName())
                .description(post.getDescription())
                .status(post.getStatus())
                .authorId(post.getProfile().getProfileId())
                .authorName(post.getProfile().getFullName())
                .authorPhone(post.getProfile().getPhone())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .expiresAt(post.getExpiresAt())
                .build();
    }

    private PageResponse<RoommatePostDTO> buildPageResponse(Page<RoommatePost> page) {
        List<RoommatePostDTO> content = page.getContent().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
        return PageResponse.<RoommatePostDTO>builder()
                .content(content)
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .lastPage(page.isLast())
                .build();
    }
}