import axiosInstance from "./axios";

import { imgURL } from "./config";
export { imgURL };

const apiRoomMedia = {
  createRoomMedia: (file, roomId, isThumbnail = false) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('roomId', roomId);
    formData.append('isThumbnail', isThumbnail);

    return axiosInstance.post('/admin/room-medias', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // ← Sửa endpoint cho khớp controller
  getMediaByRoomId: (roomId) => {
    return axiosInstance.get(`/public/rooms/${roomId}/medias`);
  },

  deleteRoomMedia: (mediaId) => {
    return axiosInstance.delete(`/admin/room-medias/${mediaId}`);
  },
};

export default apiRoomMedia;