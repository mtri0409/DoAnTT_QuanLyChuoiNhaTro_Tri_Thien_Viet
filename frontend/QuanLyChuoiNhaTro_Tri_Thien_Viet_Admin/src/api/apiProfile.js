import axiosInstance from "./axios";
const apiProfile = {
 
   getAllProfiles: (pageNumber, pageSize = 10,sortBy="id",sortOrder="asc",branchId="",status = true) => {
    const url = `/admin/profiles`;
    return axiosInstance.get(url, {
      params: {
        pageNumber: pageNumber, // Gửi 1, 2, 3...
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
        branchId:branchId,
        status:status
      }
    });
  },
    searchProfiles: (keyword,pageNumber, pageSize = 10,sortBy="id",sortOrder="asc",branchId,status) => {
    const url = `/admin/profiles/search`;
    return axiosInstance.get(url, {
      params: {
        keyword,
        pageNumber: pageNumber, 
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
        branchId:branchId,
        status:status
      }
    });
  },
  getProfileWithoutAccount:()=> axiosInstance.get('/admin/profiles/unassigned'),
  createProfile:(data)=> axiosInstance.post("/admin/profiles",data),

  updateProfile: (id, data) => axiosInstance.put(`/public/profiles/${id}`, data),

  deleteProfile:(id)=> axiosInstance.delete(`/admin/profiles/${id}`),

  getProfileById: (id) => {
    return axiosInstance.get(`/public/profiles/${id}`);
  },
  restoreProfile :(id) => axiosInstance.patch( `/admin/profile/restore/${id}`)
};
export default apiProfile;