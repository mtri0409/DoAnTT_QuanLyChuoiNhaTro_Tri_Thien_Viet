// services/apiMeterReading.js
import axiosInstance from "./axios";

const apiMeterReading = {
  saveReading: (roomId, serviceId, newValue, month, year, imageUri = null) => {
    const formData = new FormData();
    formData.append("roomId", String(roomId));
    formData.append("serviceId", String(serviceId));
    formData.append("newValue", String(newValue));
    formData.append("month", String(month));
    formData.append("year", String(year));
    if (imageUri) {
      // React Native FormData cần object { uri, name, type }
      const filename = imageUri.split("/").pop();
      const ext = filename?.split(".").pop()?.toLowerCase() || "jpg";
      formData.append("image", {
        uri: imageUri,
        name: filename || `meter_${Date.now()}.${ext}`,
        type: `image/${ext === "jpg" ? "jpeg" : ext}`,
      });
    }
    return axiosInstance.post("/admin/meter-readings", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getByRoomAndPeriod: (roomId, month, year) =>
    axiosInstance
      .get(`/admin/meter-readings/room/${roomId}/period`, {
        params: { month, year },
      })
      .then((res) => res.data),

  getPrevious: (roomId, serviceId, month, year) =>
    axiosInstance
      .get(`/admin/meter-readings/room/${roomId}/previous`, {
        params: { serviceId, month, year },
      })
      .then((res) => res.data),

  ocrWater: (imageUri) => {
    const formData = new FormData();
    const filename = imageUri.split("/").pop();
    const ext = filename?.split(".").pop()?.toLowerCase() || "jpg";

    // Bước 1: Chỉ append thông tin file vào FormData (hàm append chỉ nhận tối đa 3 tham số: key, value, filename)
    formData.append("file", {
      uri: imageUri,
      name: filename || `meter_${Date.now()}.${ext}`,
      type: `image/${ext === "jpg" ? "jpeg" : ext}`,
    }); // Đóng ngoặc hàm append tại đây

    // Bước 2: Truyền headers vào tham số thứ 3 của hàm axiosInstance.post
    return axiosInstance.post("/admin/ocr/water", formData, {
      headers: { 
        "Content-Type": "multipart/form-data" 
      },
    });
  },

  ocrElectricity: (imageUri) => {
    const formData = new FormData();
    const filename = imageUri.split("/").pop();
    const ext = filename?.split(".").pop()?.toLowerCase() || "jpg";
    formData.append("file", {
      uri: imageUri,
      name: filename || `meter_${Date.now()}.${ext}`,
      type: `image/${ext === "jpg" ? "jpeg" : ext}`,
    }),
     {
        headers: { "Content-Type": "multipart/form-data" },
      };
    return axiosInstance.post("/admin/ocr/electricity", formData);
  },
};
export default apiMeterReading;
