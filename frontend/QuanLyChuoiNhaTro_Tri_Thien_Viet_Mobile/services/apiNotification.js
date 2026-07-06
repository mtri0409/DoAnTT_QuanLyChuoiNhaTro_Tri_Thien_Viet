import axiosInstance from "./axios";
const apiNotification = {
  getNotificationById:(userId) => axiosInstance.get(`/public/notification/user/${userId}`),
  markAsRead:(id)=>axiosInstance.put(`/public/notification/${id}/read`),
  getUnreadCount:(id) => axiosInstance.get(`/public/notification/unread-count/${id}`)
}
export default apiNotification;