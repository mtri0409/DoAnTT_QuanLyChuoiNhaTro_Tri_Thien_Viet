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

  // ── USER ──────────────────────────────────────────────────────────────
  createPost: (data) => axiosInstance.post("/user/roommate-posts", data),

  updatePost: (postId, data) =>
    axiosInstance.put(`/user/roommate-posts/${postId}`, data),

  deletePost: (postId) =>
    axiosInstance.delete(`/user/roommate-posts/${postId}`),

  getMyPosts: (pageNumber = 0, pageSize = 10) =>
    axiosInstance.get("/user/roommate-posts/my", {
      params: { pageNumber, pageSize },
    }),

  closePost: (postId) =>
    axiosInstance.put(`/user/roommate-posts/${postId}`, { status: "CLOSED" }),
};

export default apiPost;
