import axiosInstance from "./axios";

const apiPost = {
  // ── PUBLIC ────────────────────────────────────────────────────────────

  getActivePosts: (
    pageNumber = 0,
    pageSize = 10,
    roomId = "",
    branchId = "",
  ) => {
    return axiosInstance.get("/public/roommate-posts", {
      params: {
        pageNumber,
        pageSize,
        roomId: roomId || undefined,
        branchId: branchId || undefined,
      },
    });
  },

  getPostById: (postId) => {
    return axiosInstance.get(`/public/roommate-posts/${postId}`);
  },

  // ── USER ──────────────────────────────────────────────────────────────

  getMyPosts: (pageNumber = 0, pageSize = 10, status = "") => {
    return axiosInstance.get("/user/roommate-posts/my", {
      params: { pageNumber, pageSize, status: status || undefined },
    });
  },

  createPost: (data) => axiosInstance.post("/user/roommate-posts", data),

  updatePost: (postId, data) =>
    axiosInstance.put(`/user/roommate-posts/${postId}`, data),

  deletePost: (postId) =>
    axiosInstance.delete(`/user/roommate-posts/${postId}`),

  repost: (postId) =>
    axiosInstance.post(`/user/roommate-posts/${postId}/repost`),

  // ── ADMIN ─────────────────────────────────────────────────────────────

  adminUpdatePost: (postId, data) =>
    axiosInstance.put(`/admin/roommate-posts/${postId}`, data),

  adminDeletePost: (postId) =>
    axiosInstance.delete(`/admin/roommate-posts/${postId}`),
};

export default apiPost;
