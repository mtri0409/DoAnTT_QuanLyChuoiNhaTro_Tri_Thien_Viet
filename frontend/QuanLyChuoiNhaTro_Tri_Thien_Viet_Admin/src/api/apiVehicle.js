import axiosInstance from "./axios";
const apiVehicle = {
  // Lấy tất cả có phân trang & sort
  getAllVehicles: (pageNumber = 1, pageSize = 10, sortBy = "userId", sortOrder = "asc") => 
    axiosInstance.get(`/admin/vehicles`, { 
        params: {
           pageNumber,pageSize,sortBy,sortOrder
        }
     }),

  // Tìm kiếm theo keyword
  searchVehicles: (keyword,pageNumber = 1, pageSize = 10, sortBy = "userId", sortOrder = "asc") => 
    axiosInstance.get(`/admin/vehicles/search`, { 
        params: {
            keyword,
           pageNumber,
           pageSize,
           sortBy,
           sortOrder
        }
     }),
  // Xóa xe
  deleteVehicle: (id) => axiosInstance.delete(`/vehicles/${id}`),

  // Cập nhật (Sử dụng cho trang Update)
  updateVehicle: (id, data) => axiosInstance.put(`/vehicles/${id}`, data)
};

export default apiVehicle;