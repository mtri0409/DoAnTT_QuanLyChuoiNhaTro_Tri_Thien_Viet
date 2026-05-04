import axiosInstance from "./axios";

const apiMeterReading = {
  // Nhập chỉ số điện/nước (có thể upload ảnh)
  saveReading: (roomId, serviceId, newValue, month, year, image = null) => {
    const formData = new FormData();
    formData.append("roomId", roomId);
    formData.append("serviceId", serviceId);
    formData.append("newValue", newValue);
    formData.append("month", month);
    formData.append("year", year);
    if (image) formData.append("image", image);

    return axiosInstance.post("/admin/meter-readings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Chi tiết 1 bản ghi
  getById: (readingId) =>
    axiosInstance.get(`/admin/meter-readings/${readingId}`),

  // Lịch sử chỉ số theo phòng (phân trang)
  getByRoom: (
    roomId,
    pageNumber = 1,
    pageSize = 10,
    sortBy = "periodYear",
    sortOrder = "desc",
  ) =>
    axiosInstance.get(`/admin/meter-readings/room/${roomId}`, {
      params: { pageNumber, pageSize, sortBy, sortOrder },
    }),

  // Chỉ số theo phòng + kỳ
  getByRoomAndPeriod: (roomId, month, year) =>
    axiosInstance.get(`/admin/meter-readings/room/${roomId}/period`, {
      params: { month, year },
    }),

  // Chỉ số kỳ trước (để hiển thị oldValue)
  getPrevious: (roomId, serviceId, month, year) =>
    axiosInstance.get(`/admin/meter-readings/room/${roomId}/previous`, {
      params: { serviceId, month, year },
    }),

  // Xóa bản ghi
  delete: (readingId) =>
    axiosInstance.delete(`/admin/meter-readings/${readingId}`),

  ocrWater: (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile); // Tên field phải đúng với backend
    
    return axiosInstance.post(`/admin/ocr/water`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  };

export default apiMeterReading;
