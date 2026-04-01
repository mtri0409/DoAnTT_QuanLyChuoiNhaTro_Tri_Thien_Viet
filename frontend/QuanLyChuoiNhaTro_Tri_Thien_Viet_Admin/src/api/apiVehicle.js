import CreateVehicle from "../pages/proflie/CreateVehicle";
import axiosInstance from "./axios";
const apiVehicle = {
  // Lấy tất cả có phân trang & sort
  getAllVehicles: (pageNumber = 1, pageSize = 10, sortBy = "userId", sortOrder = "asc") => 
    axiosInstance.get(`/admin/vehicles`, { 
        params: {
           pageNumber,pageSize,sortBy,sortOrder
        }
     }),
   getAllVehiclesDeleted: (pageNumber = 1, pageSize = 10, sortBy = "userId", sortOrder = "asc") => 
    axiosInstance.get(`/admin/vehicles/history`, { 
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
   getVehicleById : (id) => axiosInstance.get(`/public/vehice/${id}`),
  // Xóa xe
  deleteVehicle: (id) => axiosInstance.delete(`/public/vehicles/${id}`),

  // Cập nhật (Sử dụng cho trang Update)
  updateVehicle: (id, data) => axiosInstance.put(`/public/vehicles/${id}`, data),

  createVehicle : (profileId,data) => axiosInstance.post(`/public/vehicles/${profileId}`,data),

  restoreVehicle :(id) => axiosInstance.patch(`/admin/vehicles/restore/${id}`)
};

export default apiVehicle;