import axiosInstance from "./axios";

const apiRoomMedia = {
    createRoomMedia: (file, roomId, isThumbnail = false) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('roomId', roomId);
        formData.append('isThumbnail', isThumbnail);

        return axiosInstance.post('/admin/room-media', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    getMediaByRoomId: (roomId) => {
        return axiosInstance.get(`/public/room-media/room/${roomId}`);
    },

    deleteRoomMedia: (mediaId) => {
        return axiosInstance.delete(`/admin/room-media/${mediaId}`);
    }
};

export default apiRoomMedia;