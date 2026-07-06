import axiosInstance from "./axios";

const apiSetting = {
    getSetting:()=>  axiosInstance.get("/public/settings"),
    update:(data)=> axiosInstance.put("admin/settings",data),
    uploadLogo: (formData) => {
    return axiosInstance.put(`/admin/system/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Ép kiểu dữ liệu là form-data
      },
    });
  },
   uploadFavicon: (formData) => {
    return axiosInstance.put(`/admin/system/favicon`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Ép kiểu dữ liệu là form-data
      },
    });
  },
}
export default apiSetting;