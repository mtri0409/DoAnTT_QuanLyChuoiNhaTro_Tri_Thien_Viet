import axiosInstance from "./axios";

const apiFloor = {

  getAllFloors: () => {
    const url = `/public/floors`;
    return axiosInstance.get(url);
  },

  createFloor: (data) => axiosInstance.post("/admin/floors", data),

  updateFloor: (id, data) => axiosInstance.put(`/public/floors/${id}`, data),

  deleteFloor: (id) => axiosInstance.delete(`/admin/floors/${id}`),

  getFloorById: (id) => axiosInstance.get(`/public/floors/${id}`),
};

export default apiFloor;