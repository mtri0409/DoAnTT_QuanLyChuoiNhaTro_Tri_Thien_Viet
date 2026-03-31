import axiosInstance from "./axios";
const apiProfile = {
 
   getAllProfiles: (pageNumber, pageSize = 10,sortBy="id",sortOrder="asc") => {
    const url = `/admin/profiles`;
    return axiosInstance.get(url, {
      params: {
        pageNumber: pageNumber, // Gửi 1, 2, 3...
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    });
  },
    searchProfiles: (keyword,pageNumber, pageSize = 10,sortBy="id",sortOrder="asc") => {
    const url = `/admin/profiles/search`;
    return axiosInstance.get(url, {
      params: {
        keyword,
        pageNumber: pageNumber, 
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    });
  },
  getProfileWithoutAccount:()=> axiosInstance.get('/admin/profiles/unassigned'),
  createProfile:(data)=> axiosInstance.post("/admin/profiles",data),

  updateProfile: (id, data) => axiosInstance.put(`/public/profiles/${id}`, data),

  deleteProfile:(id)=> axiosInstance.delete(`/admin/profiles/${id}`),

  getProfileById: (id) => {
    return axiosInstance.get(`/public/profiles/${id}`);
  }
};
export default apiProfile;