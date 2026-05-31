import axiosInstance from "./axios";
const apiProfile = {
  getAllProfiles: (
    pageNumber,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "asc",
    branchId = "",
    status = true,
  ) => {
    const url = `/admin/profiles`;
    return axiosInstance.get(url, {
      params: {
        pageNumber: pageNumber, // Gửi 1, 2, 3...
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
        branchId: branchId,
        status: status,
      },
    });
  },
  searchProfiles: (
    keyword,
    pageNumber,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "asc",
    branchId,
    status,
  ) => {
    const url = `/admin/profiles/search`;
    return axiosInstance.get(url, {
      params: {
        keyword,
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
        branchId: branchId,
        status: status,
      },
    });
  },
  getInternalProfile: (
    pageNumber,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "asc",
    status = true,
  ) => {
    const url = `/admin/profiles/internal`;
    return axiosInstance.get(url, {
      params: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
        status: status,
      },
    });
  },
  searchInternalProfiles: (
    keyword,
    pageNumber,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "asc",
    status,
  ) => {
    const url = `/admin/profiles/internal/search`;
    return axiosInstance.get(url, {
      params: {
        keyword,
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
        status: status,
      },
    });
  },
  getProfileWithoutAccount: () =>
    axiosInstance.get("/admin/profiles/unassigned"),
  createProfile: (data) => axiosInstance.post("/admin/profiles", data),

  updateProfile: (id, data) =>
    axiosInstance.put(`/admin/profiles/${id}`, data),

  deleteProfile: (id) => axiosInstance.delete(`/admin/profiles/${id}`),

  getProfileById: (id) => {
    return axiosInstance.get(`/admin/profiles/${id}`);
  },
  restoreProfile: (id) => axiosInstance.patch(`/admin/profile/restore/${id}`),
   uploadFrontImage: (id, formData) => {
    return axiosInstance.put(`/admin/profiles/${id}/idfrontimage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Ép kiểu dữ liệu là form-data
      },
    });
  },
  
  uploadBackImage: (id, formData) => {
    return axiosInstance.put(`/admin/profiles/${id}/idbackimage`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
export default apiProfile;
