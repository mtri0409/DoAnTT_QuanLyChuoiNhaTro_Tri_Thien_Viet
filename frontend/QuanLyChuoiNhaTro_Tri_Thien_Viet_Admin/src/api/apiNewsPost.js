import axiosInstance from "./axios";

const apiNewsPost = {
  // ── ADMIN — Danh sách & tìm kiếm ─────────────────────────────────────

  getAllPosts: (params = {}) => {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      type,
      status,
      categoryId,
    } = params;
    return axiosInstance.get("/admin/posts", {
      params: {
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        type: type || undefined,
        status: status || undefined,
        categoryId: categoryId || undefined,
      },
    });
  },

  searchPosts: (params = {}) => {
    const {
      keyword,
      pageNumber = 1,
      pageSize = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      type,
      status,
      categoryId,
    } = params;
    return axiosInstance.get("/admin/posts/search", {
      params: {
        keyword: keyword || undefined,
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        type: type || undefined,
        status: status || undefined,
        categoryId: categoryId || undefined,
      },
    });
  },

  getPostById: (postId) => axiosInstance.get(`/admin/posts/${postId}`),

  // ── ADMIN — CRUD ──────────────────────────────────────────────────────

  createPost: (data, authorId) =>
    axiosInstance.post(`/admin/posts?authorId=${authorId}`, data),

  updatePost: (postId, data) =>
    axiosInstance.put(`/admin/posts/${postId}`, data),

  deletePost: (postId) => axiosInstance.delete(`/admin/posts/${postId}`),

  // ── ADMIN — Trạng thái ────────────────────────────────────────────────

  publishPost: (postId) =>
    axiosInstance.patch(`/admin/posts/${postId}/publish`),

  archivePost: (postId) =>
    axiosInstance.patch(`/admin/posts/${postId}/archive`),

  revertToDraft: (postId) =>
    axiosInstance.patch(`/admin/posts/${postId}/draft`),

  // ── ADMIN — Ảnh ──────────────────────────────────────────────────────

  addImage: (postId, formData) =>
    axiosInstance.post(`/admin/posts/${postId}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteImage: (postId, imageId) =>
    axiosInstance.delete(`/admin/posts/${postId}/images/${imageId}`),

  setPrimaryImage: (postId, imageId) =>
    axiosInstance.patch(`/admin/posts/${postId}/images/${imageId}/primary`),

  // ── ADMIN — Danh mục ─────────────────────────────────────────────────

  getAllCategories: () => axiosInstance.get("/admin/post-categories"),

  getActiveCategories: () => axiosInstance.get("/public/post-categories"),

  createCategory: (data) => axiosInstance.post("/admin/post-categories", data),

  updateCategory: (categoryId, data) =>
    axiosInstance.put(`/admin/post-categories/${categoryId}`, data),

  deleteCategory: (categoryId) =>
    axiosInstance.delete(`/admin/post-categories/${categoryId}`),
};

export default apiNewsPost;
