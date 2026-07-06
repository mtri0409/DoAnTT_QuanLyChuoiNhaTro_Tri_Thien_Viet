package com.trithienviet.qlchuoiphongtro.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
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

        // ── Đồng bộ Room status → SHARED khi bài ACTIVE ──────────────────
        syncRoomStatusOnPostActive(room);

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

            PostStatus oldStatus = post.getStatus();
            post.setStatus(dto.getStatus());
            log.info("Bài [{}] cập nhật trạng thái -> {}", postId, dto.getStatus());

            // ── Đồng bộ Room status khi bài chuyển trạng thái ────────────
            Room room = post.getRoom();
            if (dto.getStatus() == PostStatus.ACTIVE && oldStatus != PostStatus.ACTIVE) {
                // Bài được mở lại → room SHARED
                syncRoomStatusOnPostActive(room);
            } else if (dto.getStatus() != PostStatus.ACTIVE && oldStatus == PostStatus.ACTIVE) {
                // Bài bị đóng (CLOSED) → kiểm tra còn bài ACTIVE khác không
                syncRoomStatusOnPostInactive(room);
            }
        }
        return mapToDTO(postRepo.save(post));
    }

    // ── Xóa bài ───────────────────────────────────────────────────────────

    @Override
    @Transactional
    public String deletePost(Integer postId, Long callerId, boolean isAdmin) {
        RoommatePost post = findPostOrThrow(postId);
        checkOwnership(post, callerId, isAdmin);

        Room room = post.getRoom();
        boolean wasActive = post.getStatus() == PostStatus.ACTIVE;

        postRepo.delete(post);
        log.info("Bài [{}] đã bị xóa bởi [{}]", postId, callerId);

        // ── Đồng bộ Room status khi xóa bài đang ACTIVE ──────────────────
        if (wasActive) {
            syncRoomStatusOnPostInactive(room);
        }

        return "Bài đăng #" + postId + " đã được xóa thành công.";
    }

    // ── Đọc ───────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public RoommatePostDTO getPostById(Integer postId) {
        RoommatePost post = findPostOrThrow(postId);
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
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
        return buildPageResponse(postRepo.findByAuthor(authorId, pageable));
    }

    // ── Scheduled job ─────────────────────────────────────────────────────

    /**
     * Chạy lúc 00:05 mỗi ngày, expire bài quá hạn và đồng bộ lại Room status.
     */
    @Override
    @Transactional
    public void expireOldPosts() {
        // Lấy danh sách bài sắp bị expire trước khi bulk-update để còn biết room nào
        List<RoommatePost> toExpire = postRepo.findByStatusAndExpiresAtBefore(
                PostStatus.ACTIVE, LocalDateTime.now());

        int count = postRepo.expireOldPosts(LocalDateTime.now());

        if (count > 0) {
            log.info("[Scheduler] Đã expire {} bài đăng tìm bạn ghép.", count);

            // Đồng bộ Room status cho từng phòng bị ảnh hưởng
            toExpire.stream()
                    .map(RoommatePost::getRoom)
                    .distinct()
                    .forEach(room -> {
                        // Sau khi expire, nếu không còn bài ACTIVE nào → revert room status
                        syncRoomStatusOnPostInactive(room);
                    });
        }
    }

    // ── Repost ────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public RoommatePostDTO repostFromExpired(Integer originalPostId, Long callerId) {
        RoommatePost original = findPostOrThrow(originalPostId);

        if (!original.getProfile().getProfileId().equals(callerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Không có quyền repost bài này.");
        }
        if (original.getStatus() == PostStatus.ACTIVE) {
            throw new APIException("Bài đang ACTIVE, không cần repost.");
        }

        checkDailyLimit(callerId);

        if (postRepo.countActivePostsByRoom(original.getRoom().getRoomId()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Phòng này đã có bài đăng đang mở.");
        }

        RoommatePost newPost = new RoommatePost();
        newPost.setDescription(original.getDescription());
        newPost.setStatus(PostStatus.ACTIVE);
        newPost.setRoom(original.getRoom());
        newPost.setProfile(original.getProfile());
        newPost.setExpiresAt(LocalDateTime.now().plusDays(expireDays));

        RoommatePost saved = postRepo.save(newPost);

        // ── Đồng bộ Room status → SHARED ─────────────────────────────────
        syncRoomStatusOnPostActive(original.getRoom());

        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoommatePostDTO> getMyPosts(Long authorId, int pageNumber, int pageSize, PostStatus status) {
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());
        return buildPageResponse(postRepo.findByAuthorAndStatus(authorId, status, pageable));
    }

    // ── Room status sync helpers ───────────────────────────────────────────

    /**
     * Gọi khi có bài đăng chuyển sang ACTIVE.
     * Nếu phòng chưa phải SHARED → đổi thành SHARED.
     */
    private void syncRoomStatusOnPostActive(Room room) {
        if (room.getStatus() != RoomStatus.SHARED) {
            RoomStatus previous = room.getStatus();
            room.setStatus(RoomStatus.SHARED);
            roomRepo.save(room);
            log.info("Phòng [{}] đổi trạng thái {} → SHARED (có bài tìm người ghép)",
                    room.getRoomId(), previous);
        }
    }

    /**
     * Gọi khi bài đăng bị đóng / xóa / hết hạn.
     * Nếu phòng không còn bài ACTIVE nào → revert về OCCUPIED (hoặc trạng thái
     * phù hợp dựa theo currentPeople / maxPeople).
     */
    private void syncRoomStatusOnPostInactive(Room room) {
        // Kiểm tra còn bài ACTIVE nào của phòng này không
        long remaining = postRepo.countActivePostsByRoom(room.getRoomId());
        if (remaining > 0) {
            // Vẫn còn bài khác đang mở → giữ SHARED
            return;
        }

        // Không còn bài → revert dựa theo số người hiện tại
        RoomStatus reverted = resolveRoomStatus(room);
        if (room.getStatus() != reverted) {
            RoomStatus previous = room.getStatus();
            room.setStatus(reverted);
            roomRepo.save(room);
            log.info("Phòng [{}] đổi trạng thái {} → {} (không còn bài tìm người ghép)",
                    room.getRoomId(), previous, reverted);
        }
    }

    /**
     * Tính trạng thái phù hợp của phòng dựa trên số người hiện tại.
     *
     * - currentPeople == 0 → AVAILABLE
     * - 0 < currentPeople < maxPeople → OCCUPIED (đang có người ở, không cần tìm
     * ghép nữa)
     * - currentPeople >= maxPeople → OCCUPIED (đầy phòng)
     *
     * Nếu phòng đang MAINTENANCE hoặc DEPOSITED thì giữ nguyên trạng thái đó,
     * không ghi đè bởi logic bài đăng.
     */
    private RoomStatus resolveRoomStatus(Room room) {
        RoomStatus current = room.getStatus();

        // Không động vào các trạng thái đặc biệt
        if (current == RoomStatus.MAINTENANCE || current == RoomStatus.DEPOSITED) {
            return current;
        }

        int people = room.getCurrentPeople() != null ? room.getCurrentPeople() : 0;
        if (people == 0) {
            return RoomStatus.AVAILABLE;
        }
        return RoomStatus.OCCUPIED;
    }

    // ── Internal helpers ──────────────────────────────────────────────────

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

    private void checkOwnership(RoommatePost post, Long callerId, boolean isAdmin) {
        if (!isAdmin && !post.getProfile().getProfileId().equals(callerId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thực hiện hành động này.");
        }
    }

    private RoommatePostDTO mapToDTO(RoommatePost post) {
        return RoommatePostDTO.builder()
                .postId(post.getPostId())
                .roomId(post.getRoom().getRoomId())
                .roomName(post.getRoom().getRoomName())
                .branchName(post.getRoom().getFloor().getBranch().getBranchName())
                .branchAddress(post.getRoom().getFloor().getBranch().getAddress())
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