import axiosInstance from "./axios";

const apiRoomMedia = {
    getAllRoomMedias: (pageNumber = 0, pageSize = 10, sortBy = 'mediaId', sortOrder = 'asc') => {
        const url = `/admin/room-medias`;
        return axiosInstance.get(url, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                sortBy: sortBy,
                sortOrder: sortOrder
            }
        });
    },

    getRoomMediaById: (mediaId) => {
        const url = `/public/room-medias/${mediaId}`;
        return axiosInstance.get(url);
    },

    getMediaByRoomId: (roomId) => {
        const url = `/public/rooms/${roomId}/medias`;
        return axiosInstance.get(url);
    },

    createRoomMedia: (roomMediaDTO) => {
        const url = `/admin/room-medias`;
        return axiosInstance.post(url, roomMediaDTO);
    },

    updateRoomMedia: (mediaId, roomMediaDTO) => {
        const url = `/admin/room-medias/${mediaId}`;
        return axiosInstance.put(url, roomMediaDTO);
    },

    deleteRoomMedia: (mediaId) => {
        const url = `/admin/room-medias/${mediaId}`;
        return axiosInstance.delete(url);
    }
};

export default apiRoomMedia;