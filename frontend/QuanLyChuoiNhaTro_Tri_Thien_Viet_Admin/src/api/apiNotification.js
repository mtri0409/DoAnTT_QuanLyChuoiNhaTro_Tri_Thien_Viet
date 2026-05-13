import axiosInstance from "./axios";
const apiNotification = {
  getAllNotifications: (pageNumber, pageSize = 10,sortBy="id",sortOrder="asc") => {
    const url = `/admin/notification`;
    return axiosInstance.get(url, {
      params: {
        pageNumber: pageNumber, // Gửi 1, 2, 3...
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder
      }
    });
  },
  createManualNotification:(profileId=0,branchId=0,data) => {
    return axiosInstance.post(`/notification/send-manual`, data, {
      params: {
        profileId: profileId || 0, // Nếu không có thì gửi 0
        branchId: branchId || 0    // Nếu không có thì gửi 0
      }
    });
  },
  getNotificationById:(userId) => axiosInstance.get(`/public/notification/user/${userId}`)
  
}
export default apiNotification;