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
}
export default apiNotification;