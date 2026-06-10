import axiosInstance from "./axios";

const apiPost = {
  // ── PUBLIC ────────────────────────────────────────────────────────────
  getActivePosts: (
    pageNumber = 0,
    pageSize = 10,
    roomId = null,
    branchId = null,
  ) => {
    const params = { pageNumber, pageSize };
    if (roomId) params.roomId = roomId;
    if (branchId) params.branchId = branchId;
    return axiosInstance.get("/public/roommate-posts", { params });
  },

  getPostById: (postId) =>
    axiosInstance.get(`/public/roommate-posts/${postId}`),

  // Lấy chi tiết bài đăng của chính mình (kể cả CLOSED/EXPIRED)
  getMyPostById: (postId) =>
    axiosInstance.get(`/user/roommate-posts/${postId}`),

  // ── USER ──────────────────────────────────────────────────────────────
  createPost: (data) => axiosInstance.post("/user/roommate-posts", data),

  updatePost: (postId, data) =>
    axiosInstance.put(`/user/roommate-posts/${postId}`, data),

  deletePost: (postId) =>
    axiosInstance.delete(`/user/roommate-posts/${postId}`),

  getMyPosts: (pageNumber = 0, pageSize = 10, status = null) => {
    const params = { pageNumber, pageSize };
    if (status) params.status = status;
    return axiosInstance.get("/user/roommate-posts/my", { params });
  },

  closePost: (postId) =>
    axiosInstance.put(`/user/roommate-posts/${postId}`, { status: "CLOSED" }),

  repost: (postId) =>
    axiosInstance.post(`/user/roommate-posts/${postId}/repost`),
};

export default apiPost;
