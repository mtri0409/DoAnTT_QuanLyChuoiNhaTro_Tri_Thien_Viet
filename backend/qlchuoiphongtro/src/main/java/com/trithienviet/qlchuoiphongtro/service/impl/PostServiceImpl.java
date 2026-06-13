package com.trithienviet.qlchuoiphongtro.service.impl;

import java.io.IOException;
import java.text.Normalizer;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import java.io.File;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.trithienviet.qlchuoiphongtro.entity.Post;
import com.trithienviet.qlchuoiphongtro.entity.PostCategory;
import com.trithienviet.qlchuoiphongtro.entity.PostImage;
import com.trithienviet.qlchuoiphongtro.entity.PostPublishStatus;
import com.trithienviet.qlchuoiphongtro.entity.PostType;
import com.trithienviet.qlchuoiphongtro.entity.User;
import com.trithienviet.qlchuoiphongtro.exceptions.ResourceNotFoundException;
import com.trithienviet.qlchuoiphongtro.payloads.PageResponse;
import com.trithienviet.qlchuoiphongtro.payloads.PostCategoryDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostDetailDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostImageDTO;
import com.trithienviet.qlchuoiphongtro.payloads.PostRequestDTO;
import com.trithienviet.qlchuoiphongtro.repo.PostCategoryRepo;
import com.trithienviet.qlchuoiphongtro.repo.PostRepo;
import com.trithienviet.qlchuoiphongtro.repo.UserRepo;
import com.trithienviet.qlchuoiphongtro.service.FileService;
import com.trithienviet.qlchuoiphongtro.service.PostService;

@Service
@Transactional
public class PostServiceImpl implements PostService {

    @Autowired
    private PostRepo postRepo;

    @Autowired
    private PostCategoryRepo categoryRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private FileService fileService;

    /**
     * Thư mục lưu ảnh bài đăng — cấu hình trong application.properties.
     * Ví dụ: project.image.post=images/posts
     */
    @Value("${path.images.post}")
    private String postImagePath;

    // ================================================================== //
    // CRUD bài đăng //
    // ================================================================== //

    @Override
    public PostDetailDTO createPost(PostRequestDTO request, Long authorId) {
        User author = userRepo.findById(authorId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", authorId));

        Post post = new Post();
        mapRequestToEntity(request, post);
        post.setAuthor(author);
        post.setPublishStatus(PostPublishStatus.DRAFT);

        Post saved = postRepo.save(post);
        return toDetailDTO(saved);
    }

    @Override
    public PostDetailDTO updatePost(Integer postId, PostRequestDTO request) {
        Post post = findPostOrThrow(postId);
        mapRequestToEntity(request, post);
        return toDetailDTO(postRepo.save(post));
    }

    @Override
    @Transactional(readOnly = true)
    public PostDetailDTO getPostById(Integer postId) {
        return toDetailDTO(findPostOrThrow(postId));
    }

    @Override
    @Transactional(readOnly = true)
    public PostDetailDTO getPostBySlug(String slug) {
        Post post = postRepo.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "slug", slug));
        return toDetailDTO(post);
    }

    @Override
    public String deletePost(Integer postId) {
        Post post = findPostOrThrow(postId);
        // Xoá file ảnh khỏi disk trước khi xoá bản ghi
        post.getImages().forEach(img -> {
            try {
                // FIX: tách tên file thật ra khỏi prefix "/images/posts/"
                String fileName = extractFileName(img.getImageUrl());
                File file = new File(postImagePath + File.separator + fileName);
                if (file.exists())
                    file.delete();
            } catch (Exception ignored) {
                // Nếu file không tồn tại vẫn tiếp tục xoá bản ghi
            }
        });
        postRepo.delete(post);
        return "Đã xoá bài đăng có ID: " + postId;
    }

    // ================================================================== //
    // Quản lý trạng thái //
    // ================================================================== //

    @Override
    public PostDetailDTO publishPost(Integer postId) {
        Post post = findPostOrThrow(postId);
        post.publish();
        return toDetailDTO(postRepo.save(post));
    }

    @Override
    public PostDetailDTO archivePost(Integer postId) {
        Post post = findPostOrThrow(postId);
        post.archive();
        return toDetailDTO(postRepo.save(post));
    }

    @Override
    public PostDetailDTO revertToDraft(Integer postId) {
        Post post = findPostOrThrow(postId);
        post.setPublishStatus(PostPublishStatus.DRAFT);
        return toDetailDTO(postRepo.save(post));
    }

    // ================================================================== //
    // Danh sách — Admin //
    // ================================================================== //

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostDTO> getAllPosts(
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder,
            PostType type, PostPublishStatus status, Integer categoryId) {

        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Post> page = postRepo.findAllByFilters(type, status, categoryId, pageable);
        return toPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostDTO> searchPosts(
            String keyword,
            Integer pageNumber, Integer pageSize,
            String sortBy, String sortOrder,
            PostType type, PostPublishStatus status, Integer categoryId) {

        Pageable pageable = buildPageable(pageNumber, pageSize, sortBy, sortOrder);
        Page<Post> page = postRepo.searchByFilters(keyword, type, status, categoryId, pageable);
        return toPageResponse(page);
    }

    // ================================================================== //
    // Danh sách — Public //
    // ================================================================== //

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostDTO> getPublishedPosts(
            Integer pageNumber, Integer pageSize,
            PostType type, Integer categoryId) {

        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        Page<Post> page = postRepo.findPublished(type, categoryId, pageable);
        return toPageResponse(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PostDTO> searchPublishedPosts(
            String keyword,
            Integer pageNumber, Integer pageSize,
            Integer categoryId) {

        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        Page<Post> page = postRepo.searchPublished(keyword, categoryId, pageable);
        return toPageResponse(page);
    }

    // ================================================================== //
    // Quản lý ảnh //
    // ================================================================== //

    @Override
    public PostImageDTO addImage(Integer postId, MultipartFile image, Boolean isPrimary, String altText)
            throws IOException {
        Post post = findPostOrThrow(postId);

        String fileName = fileService.uploadImage(postImagePath, image);
        String imageUrl = "/images/posts/" + fileName;

        if (Boolean.TRUE.equals(isPrimary)) {
            post.getImages().forEach(img -> img.setIsPrimary(false));
        }

        int nextOrder = post.getImages().size();
        PostImage postImage = PostImage.builder()
                .imageUrl(imageUrl)
                .altText(altText)
                .displayOrder(nextOrder)
                .isPrimary(Boolean.TRUE.equals(isPrimary))
                .post(post)
                .build();

        post.getImages().add(postImage);

        // FIX: saveAndFlush để Hibernate gán imageId ngay lập tức,
        // sau đó reload post để lấy postImage đã có ID từ DB.
        Post savedPost = postRepo.saveAndFlush(post);

        // Tìm lại ảnh vừa thêm từ entity đã được flush (có imageId đầy đủ)
        PostImage savedImage = savedPost.getImages().stream()
                .filter(img -> imageUrl.equals(img.getImageUrl()))
                .reduce((first, second) -> second) // lấy phần tử cuối cùng (mới nhất)
                .orElse(postImage);

        return toImageDTO(savedImage);
    }

    @Override
    public String deleteImage(Integer postId, Integer imageId) {
        Post post = findPostOrThrow(postId);
        PostImage target = post.getImages().stream()
                .filter(img -> img.getImageId().equals(imageId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PostImage", "id", imageId));

        try {
            // FIX: tách tên file thật ra khỏi prefix "/images/posts/"
            String fileName = extractFileName(target.getImageUrl());
            File file = new File(postImagePath + File.separator + fileName);
            if (file.exists())
                file.delete();
        } catch (Exception ignored) {
        }

        post.getImages().remove(target);
        postRepo.save(post);
        return "Đã xoá ảnh có ID: " + imageId;
    }

    @Override
    public PostImageDTO setPrimaryImage(Integer postId, Integer imageId) {
        Post post = findPostOrThrow(postId);
        post.getImages().forEach(img -> img.setIsPrimary(img.getImageId().equals(imageId)));
        postRepo.save(post);

        return post.getImages().stream()
                .filter(img -> img.getImageId().equals(imageId))
                .map(this::toImageDTO)
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PostImage", "id", imageId));
    }

    // ================================================================== //
    // Danh mục (PostCategory) //
    // ================================================================== //

    @Override
    public PostCategoryDTO createCategory(PostCategoryDTO dto) {
        if (categoryRepo.existsBySlug(dto.getSlug())) {
            throw new IllegalArgumentException("Slug '" + dto.getSlug() + "' đã tồn tại");
        }
        PostCategory category = PostCategory.builder()
                .name(dto.getName())
                .slug(dto.getSlug())
                .description(dto.getDescription())
                .displayOrder(dto.getDisplayOrder() != null ? dto.getDisplayOrder() : 0)
                .active(dto.getActive() != null ? dto.getActive() : true)
                .build();
        return toCategoryDTO(categoryRepo.save(category));
    }

    @Override
    public PostCategoryDTO updateCategory(Integer categoryId, PostCategoryDTO dto) {
        PostCategory category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("PostCategory", "id", categoryId));

        if (categoryRepo.existsBySlugAndCategoryIdNot(dto.getSlug(), categoryId)) {
            throw new IllegalArgumentException("Slug '" + dto.getSlug() + "' đã được dùng bởi danh mục khác");
        }

        category.setName(dto.getName());
        category.setSlug(dto.getSlug());
        category.setDescription(dto.getDescription());
        if (dto.getDisplayOrder() != null)
            category.setDisplayOrder(dto.getDisplayOrder());
        if (dto.getActive() != null)
            category.setActive(dto.getActive());

        return toCategoryDTO(categoryRepo.save(category));
    }

    @Override
    public String deleteCategory(Integer categoryId) {
        PostCategory category = categoryRepo.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("PostCategory", "id", categoryId));
        categoryRepo.delete(category);
        return "Đã xoá danh mục có ID: " + categoryId;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostCategoryDTO> getAllCategories() {
        return categoryRepo.findAll(Sort.by("displayOrder")).stream()
                .map(this::toCategoryDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PostCategoryDTO> getActiveCategories() {
        return categoryRepo.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toCategoryDTO)
                .collect(Collectors.toList());
    }

    // ================================================================== //
    // Helper — mapping & utilities //
    // ================================================================== //

    private Post findPostOrThrow(Integer postId) {
        return postRepo.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post", "id", postId));
    }

    /**
     * Tách tên file thực tế từ imageUrl đã có prefix "/images/posts/".
     * Ví dụ: "/images/posts/abc123.jpg" → "abc123.jpg"
     */
    private String extractFileName(String imageUrl) {
        if (imageUrl == null)
            return "";
        // Xóa prefix "/images/posts/" nếu có, giữ lại tên file thuần
        return imageUrl.replaceFirst("^/images/posts/", "")
                .replaceFirst("^images/posts/", "");
    }

    /**
     * Áp dụng dữ liệu từ PostRequestDTO vào entity Post.
     * Dùng chung cho create và update.
     */
    private void mapRequestToEntity(PostRequestDTO request, Post post) {
        post.setTitle(request.getTitle());
        post.setType(request.getType());
        post.setPinned(request.getPinned() != null ? request.getPinned() : false);

        // Sinh slug nếu không truyền
        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? request.getSlug()
                : generateSlug(request.getTitle());

        // Đảm bảo slug unique
        String uniqueSlug = ensureUniqueSlug(slug, post.getPostId());
        post.setSlug(uniqueSlug);

        if (request.getSummary() != null)
            post.setSummary(request.getSummary());
        if (request.getContent() != null)
            post.setContent(request.getContent());

        if (request.getCategoryId() != null) {
            PostCategory category = categoryRepo.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("PostCategory", "id", request.getCategoryId()));
            post.setCategory(category);
        } else {
            post.setCategory(null);
        }
    }

    /**
     * Sinh slug từ tiêu đề tiếng Việt: loại bỏ dấu, chuyển thường, thay space bằng
     * '-'.
     */
    private String generateSlug(String title) {
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(normalized)
                .replaceAll("")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .trim()
                .replaceAll("\\s+", "-");
    }

    /** Đảm bảo slug không bị trùng bằng cách thêm hậu tố số nếu cần. */
    private String ensureUniqueSlug(String baseSlug, Integer currentPostId) {
        String slug = baseSlug;
        int count = 1;
        while (currentPostId == null
                ? postRepo.existsBySlug(slug)
                : postRepo.existsBySlugAndPostIdNot(slug, currentPostId)) {
            slug = baseSlug + "-" + count++;
        }
        return slug;
    }

    private Pageable buildPageable(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        return PageRequest.of(pageNumber, pageSize, sort);
    }

    // ------------------------------------------------------------------ //
    // Mapping Entity → DTO //
    // ------------------------------------------------------------------ //

    private PostDTO toDTO(Post post) {
        return PostDTO.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .summary(post.getSummary())
                .thumbnailUrl(post.getThumbnailUrl())
                .type(post.getType())
                .publishStatus(post.getPublishStatus())
                .pinned(post.getPinned())
                .createdAt(post.getCreatedAt())
                .publishedAt(post.getPublishedAt())
                .authorName(post.getAuthor() != null ? post.getAuthor().getUserName() : null)
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : null)
                .categorySlug(post.getCategory() != null ? post.getCategory().getSlug() : null)
                .build();
    }

    private PostDetailDTO toDetailDTO(Post post) {
        return PostDetailDTO.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .summary(post.getSummary())
                .content(post.getContent())
                .type(post.getType())
                .publishStatus(post.getPublishStatus())
                .pinned(post.getPinned())
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .publishedAt(post.getPublishedAt())
                .authorId(post.getAuthor() != null ? post.getAuthor().getUserId() : null)
                .authorName(post.getAuthor() != null ? post.getAuthor().getUserName() : null)
                .category(post.getCategory() != null ? toCategoryDTO(post.getCategory()) : null)
                .images(post.getImages().stream()
                        .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
                        .map(this::toImageDTO)
                        .collect(Collectors.toList()))
                .build();
    }

    private PostImageDTO toImageDTO(PostImage image) {
        return PostImageDTO.builder()
                .imageId(image.getImageId())
                .imageUrl(image.getImageUrl())
                .altText(image.getAltText())
                .displayOrder(image.getDisplayOrder())
                .isPrimary(image.getIsPrimary())
                .build();
    }

    private PostCategoryDTO toCategoryDTO(PostCategory category) {
        return PostCategoryDTO.builder()
                .categoryId(category.getCategoryId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .displayOrder(category.getDisplayOrder())
                .active(category.getActive())
                .build();
    }

    private PageResponse<PostDTO> toPageResponse(Page<Post> page) {
        List<PostDTO> content = page.getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());

        PageResponse<PostDTO> response = new PageResponse<>();
        response.setContent(content);
        response.setPageNumber(page.getNumber() + 1);
        response.setPageSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setLastPage(page.isLast());
        return response;
    }
}