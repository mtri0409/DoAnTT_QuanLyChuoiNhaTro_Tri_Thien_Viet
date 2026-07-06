package com.trithienviet.qlchuoiphongtro.repo;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.trithienviet.qlchuoiphongtro.entity.Post;
import com.trithienviet.qlchuoiphongtro.entity.PostPublishStatus;
import com.trithienviet.qlchuoiphongtro.entity.PostType;

@Repository
public interface PostRepo extends JpaRepository<Post, Integer> {

    /** Kiểm tra slug đã tồn tại chưa (dùng khi tạo/cập nhật). */
    boolean existsBySlug(String slug);

    /** Kiểm tra slug đã tồn tại ngoại trừ bài đăng hiện tại. */
    boolean existsBySlugAndPostIdNot(String slug, Integer postId);

    /** Lấy bài đăng theo slug (dùng cho trang chi tiết SEO-friendly). */
    Optional<Post> findBySlug(String slug);

    // ------------------------------------------------------------------ //
    // Admin: xem tất cả bài đăng, lọc theo type / status / category //
    // ------------------------------------------------------------------ //

    /**
     * Danh sách bài đăng cho admin — lọc tuỳ chọn theo type, status, categoryId.
     * Truyền null để bỏ qua điều kiện tương ứng.
     */
    @Query("""
            SELECT p FROM Post p
            WHERE (:type IS NULL OR p.type = :type)
              AND (:status IS NULL OR p.publishStatus = :status)
              AND (:categoryId IS NULL OR p.category.categoryId = :categoryId)
            """)
    Page<Post> findAllByFilters(
            @Param("type") PostType type,
            @Param("status") PostPublishStatus status,
            @Param("categoryId") Integer categoryId,
            Pageable pageable);

    /**
     * Tìm kiếm bài đăng theo keyword (title hoặc summary) + lọc.
     */
    @Query("""
            SELECT p FROM Post p
            WHERE (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                    OR LOWER(p.summary) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:type IS NULL OR p.type = :type)
              AND (:status IS NULL OR p.publishStatus = :status)
              AND (:categoryId IS NULL OR p.category.categoryId = :categoryId)
            """)
    Page<Post> searchByFilters(
            @Param("keyword") String keyword,
            @Param("type") PostType type,
            @Param("status") PostPublishStatus status,
            @Param("categoryId") Integer categoryId,
            Pageable pageable);

    // ------------------------------------------------------------------ //
    // Public: chỉ lấy bài PUBLISHED //
    // ------------------------------------------------------------------ //

    /**
     * Danh sách bài đã PUBLISHED cho người dùng xem — lọc theo type / category.
     */
    @Query("""
            SELECT p FROM Post p
            WHERE p.publishStatus = 'PUBLISHED'
              AND (:type IS NULL OR p.type = :type)
              AND (:categoryId IS NULL OR p.category.categoryId = :categoryId)
            ORDER BY p.pinned DESC, p.publishedAt DESC
            """)
    Page<Post> findPublished(
            @Param("type") PostType type,
            @Param("categoryId") Integer categoryId,
            Pageable pageable);

    /**
     * Tìm kiếm bài PUBLISHED theo keyword.
     */
    @Query("""
            SELECT p FROM Post p
            WHERE p.publishStatus = 'PUBLISHED'
              AND (:keyword IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                                    OR LOWER(p.summary) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND (:categoryId IS NULL OR p.category.categoryId = :categoryId)
            ORDER BY p.pinned DESC, p.publishedAt DESC
            """)
    Page<Post> searchPublished(
            @Param("keyword") String keyword,
            @Param("categoryId") Integer categoryId,
            Pageable pageable);
}