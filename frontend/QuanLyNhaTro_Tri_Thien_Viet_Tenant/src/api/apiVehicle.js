import axiosInstance from "./axios";

const apiVehicle ={
    // getVehilceByIdOwner :(id)=> axiosInstance.get(`/public/vehicle/${id}`),
    getVehicleById : (id) => axiosInstance.get(`/public/vehice/${id}`),
  // Xóa xe
    deleteVehicle: (id) => axiosInstance.delete(`/public/vehicles/${id}`),
  // Cập nhật (Sử dụng cho trang Update)
    updateVehicle: (id, data) => axiosInstance.put(`/public/vehicles/${id}`, data),

    createVehicle : (profileId,data) => axiosInstance.post(`/public/vehicles/${profileId}`,data)
}
export default apiVehicle;