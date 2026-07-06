import axiosInstance from "./axios";

const apiVehicle = {
  // getVehilceByIdOwner :(id)=> axiosInstance.get(`/public/vehicle/${id}`),
  // FIX Bug 3: Sửa typo "vehice" → "vehicle"
  getVehicleById: (id) => axiosInstance.get(`/user/vehicle/${id}`),
  // Xóa xe
  deleteVehicle: (id) => axiosInstance.delete(`/user/vehicles/${id}`),
  // Cập nhật (Sử dụng cho trang Update)
  updateVehicle: (id, data) => axiosInstance.put(`/user/vehicles/${id}`, data),

  createVehicle: (profileId, data) =>
    axiosInstance.post(`/user/vehicles/${profileId}`, data),
};
export default apiVehicle;
