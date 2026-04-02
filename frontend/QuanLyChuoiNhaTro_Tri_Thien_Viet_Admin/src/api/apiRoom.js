import axiosInstance from "./axios";

const apiRoom = {
    getAllRooms: (
        pageNumber = 0,
        pageSize = 10,
        sortBy = 'roomName',
        sortOrder = 'asc',
        floorId = null,
        branchId = null,
        search = ''
    ) => {
        const url = `/admin/rooms`;
        return axiosInstance.get(url, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                sortBy: sortBy,
                sortOrder: sortOrder,
                ...(floorId && { floorId: floorId }),      // ← Chỉ thêm nếu có
                ...(branchId && { branchId: branchId }),   // ← Chỉ thêm nếu có
                ...(search && { search: search })           // ← Chỉ thêm nếu có
            }
        });
    },

    getRoomById: (roomId) => {
        const url = `/public/rooms/${roomId}`;
        return axiosInstance.get(url);
    },

    createRoom: (roomDTO) => {
        const url = `/admin/rooms`;
        return axiosInstance.post(url, roomDTO);
    },

    updateRoom: (roomId, roomDTO) => {
        const url = `/public/rooms/${roomId}`;
        return axiosInstance.put(url, roomDTO);
    },

    deleteRoom: (roomId) => {
        const url = `/admin/rooms/${roomId}`;
        return axiosInstance.delete(url);
    }
};

export default apiRoom;