import axiosClient from "./axios";

const apiMaintenanceRequest = {
  // ========== TENANT ==========

  // Tạo yêu cầu sửa chữa mới
  createRequest: (roomId, description, assetId = null) => {
    const params = { roomId, description };
    if (assetId) params.assetId = assetId;
    return axiosClient.post("tenant/maintenance", null, { params });
  },

  // Upload ảnh cho yêu cầu (tối đa 5 ảnh)
  uploadImages: (requestId, images) => {
    const formData = new FormData();
    images.forEach((img) => formData.append("images", img));
    return axiosClient.post(
      `tenant/maintenance/${requestId}/images`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
  },

  // Lấy danh sách yêu cầu của tenant
  getMyRequests: (params = {}) => {
    return axiosClient.get("tenant/maintenance", { params });
  },

  // Hủy yêu cầu (chỉ khi PENDING)
  cancelRequest: (requestId) => {
    return axiosClient.patch(`tenant/maintenance/${requestId}/cancel`);
  },

  // ========== DÙNG CHUNG ==========

  // Xem chi tiết 1 yêu cầu
  getRequestById: (requestId) => {
    return axiosClient.get(`public/maintenance/${requestId}`);
  },
};

export default apiMaintenanceRequest;
