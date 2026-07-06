// services/apiRoomMedia.js
import axiosInstance from "./axios";

const apiRoomMedia = {
  // Lấy danh sách media của phòng (public endpoint)
  getMediaByRoomId: (roomId) =>
    axiosInstance.get(`/public/rooms/${roomId}/medias`),
};

export default apiRoomMedia;
