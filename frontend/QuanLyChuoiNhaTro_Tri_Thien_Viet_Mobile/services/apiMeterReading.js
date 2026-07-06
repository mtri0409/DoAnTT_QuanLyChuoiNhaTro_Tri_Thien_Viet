// services/apiMeterReading.js
import axiosInstance from "./axios";

const apiMeterReading = {
  // Nhập chỉ số điện/nước (có thể upload ảnh)
  // oldValue truyền rõ ràng để backend không tự tính sai (phòng mới có isInitial)
  saveReading: (
    roomId,
    serviceId,
    newValue,
    month,
    year,
    imageUri = null,
    isInitial = false,
    oldValue = null,
  ) => {
    const formData = new FormData();
    formData.append("roomId", String(roomId));
    formData.append("serviceId", String(serviceId));
    formData.append("newValue", String(newValue));
    formData.append("month", String(month));
    formData.append("year", String(year));
    formData.append("isInitial", String(isInitial));
    if (oldValue !== null && oldValue !== undefined) {
      formData.append("oldValue", String(oldValue));
    }
    if (imageUri) {
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
    formData.append("file", {
      uri: imageUri,
      name: filename || `meter_${Date.now()}.${ext}`,
      type: `image/${ext === "jpg" ? "jpeg" : ext}`,
    });
    return axiosInstance.post("/admin/ocr/water", formData, {
      headers: { "Content-Type": "multipart/form-data" },
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
    });
    return axiosInstance.post("/admin/ocr/electricity", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export default apiMeterReading;
