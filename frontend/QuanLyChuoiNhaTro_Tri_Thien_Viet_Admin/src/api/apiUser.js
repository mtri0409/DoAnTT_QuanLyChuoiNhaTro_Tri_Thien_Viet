import axiosInstance from "./axios";
const apiUser = {


  loginUser: (data) => {
    return axiosInstance.post("/auth/login", data);
  },
  
  getAllUsers: (pageNumber = 1, pageSize = 10, sortBy = "userId", sortOrder = "asc") => {
      return axiosInstance.get(`/admin/users`, {
        params: { pageNumber, pageSize, sortBy, sortOrder }
      });
    },
    deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
    // Cập nhật Role cho User
    updateRole: (id, role) => axiosInstance.put(`/admin/users/${id}/role`, { role })
};
export default apiUser;
