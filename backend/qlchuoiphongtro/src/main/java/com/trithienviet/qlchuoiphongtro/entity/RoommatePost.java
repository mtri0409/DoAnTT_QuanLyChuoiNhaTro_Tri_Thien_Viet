package com.trithienviet.qlchuoiphongtro.entity;

import java.time.LocalDateTime;

import com.trithienviet.qlchuoiphongtro.entity.PostStatus;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "roommate_posts", indexes = {
        @Index(name = "idx_rp_author_created", columnList = "author_id, created_at"),
        @Index(name = "idx_rp_room_status", columnList = "room_id, status")
})
public class RoommatePost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer postId;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    @Size(min = 20, message = "Mô tả phải có ít nhất 20 ký tự")
    private String description;

    /**
     * Trạng thái bài đăng – lưu dưới dạng String để dễ đọc trong DB.
     * Mặc định ACTIVE khi tạo mới.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PostStatus status = PostStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Thời điểm bài tự động hết hạn.
     * Được tính khi tạo: createdAt + MAX_DAYS_ACTIVE ngày.
     */
    @Column(name = "expires_at", nullable = false) //
    private LocalDateTime expiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    private Profile profile;

    /* ------------------------------------------------------------------ */
    /* JPA lifecycle hooks */
    /* ------------------------------------------------------------------ */

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}