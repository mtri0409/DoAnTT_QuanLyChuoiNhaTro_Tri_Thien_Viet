import axiosInstance from "./axios";

const unwrap = (r) => r?.data ?? r;

const apiProfile = {
  getAllProfiles: (
    pageNumber,
    pageSize = 10,
    sortBy = "id",
    sortOrder = "asc",
  ) => {
    return axiosInstance
      .get(`/admin/profiles`, {
        params: { pageNumber, pageSize, sortBy, sortOrder },
      })
      .then(unwrap);
  },

  getProfileWithoutAccount: () =>
    axiosInstance.get("/admin/profiles/unassigned").then(unwrap),

  createProfile: (data) =>
    axiosInstance.post("/admin/profiles", data).then(unwrap),

  // Backend: @PutMapping("/user/profiles/{profileId}")
  updateProfile: (id, data) =>
    axiosInstance.put(`/user/profiles/${id}`, data).then(unwrap),

  deleteProfile: (id) =>
    axiosInstance.delete(`/admin/profiles/${id}`).then(unwrap),

  // ✅ FIX: thêm .then(unwrap)
  getProfileById: (id) =>
    axiosInstance.get(`/public/profiles/${id}`).then(unwrap),

  uploadFrontImage: (id, formData) =>
    axiosInstance
      .put(`/public/profiles/${id}/idfrontimage`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrap),

  uploadBackImage: (id, formData) =>
    axiosInstance
      .put(`/public/profiles/${id}/idbackimage`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(unwrap),
};

export default apiProfile;
