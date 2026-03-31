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
   searchUsers: (pageNumber = 1, pageSize = 10, sortBy = "userId", sortOrder = "asc") => {
    return axiosInstance.get(`/admin/users/search`, {
      params: { pageNumber, pageSize, sortBy, sortOrder }
    });
  },
  createAccount:(profileId,data)=> axiosInstance.post(`/auth/create-account/${profileId}`,data),
  generareAcount:(profileId)=> axiosInstance.post(`/auth/create-account/${profileId}`),

   deleteUser: (id) => axiosInstance.delete(`/admin/users/${id}`),
  // Cập nhật Role cho User
  updateRole: (id, role) => axiosInstance.patch(`/admin/users/${id}/role`, { role }),
  changeStatus:(id)=>axiosInstance.patch(`/admin/user/${id}/changeStatus`),
  resetPassword:(id)=>axiosInstance.patch(`/admin/user/${id}/reset-password`)

};
export default apiUser;
