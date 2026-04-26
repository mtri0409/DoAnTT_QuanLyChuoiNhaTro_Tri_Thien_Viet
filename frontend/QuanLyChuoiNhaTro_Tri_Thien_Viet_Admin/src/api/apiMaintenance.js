import axiosInstance from "./axios";

const apiMaintenance = {
  // Lấy tất cả yêu cầu (lọc status, branchId, phân trang)
  getAllRequests: (params = {}) => {
    return axiosInstance.get("/admin/maintenance", { params });
  },

  // Lấy yêu cầu theo phòng
  getRequestsByRoom: (roomId, params = {}) => {
    return axiosInstance.get(`/admin/maintenance/room/${roomId}`, { params });
  },

  // Xem chi tiết
  getRequestById: (requestId) => {
    return axiosInstance.get(`/public/maintenance/${requestId}`);
  },

  // Cập nhật trạng thái
  updateStatus: (requestId, status) => {
    return axiosInstance.patch(`/admin/maintenance/${requestId}/status`, null, {
      params: { status },
    });
  },

  // Xóa yêu cầu
  deleteRequest: (requestId) => {
    return axiosInstance.delete(`/admin/maintenance/${requestId}`);
  },
};

export default apiMaintenance;
