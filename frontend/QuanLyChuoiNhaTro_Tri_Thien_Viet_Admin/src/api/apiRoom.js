import axiosInstance from "./axios";

const apiRoom = {
    getAllRooms: (
        pageNumber = 0,
        pageSize = 10,
        sortBy = 'roomName',
        sortOrder = 'asc',
        floorId = null,
        branchId = null,
        search = '',
        status = null,
        maxPeople = null
    ) => {
        const url = `/rooms`;
        return axiosInstance.get(url, {
            params: {
                pageNumber: pageNumber,
                pageSize: pageSize,
                sortBy: sortBy,
                sortOrder: sortOrder,
                ...(floorId && { floorId: floorId }),
                ...(branchId && { branchId: branchId }),
                ...(search && { search: search }),
                ...(status && { status: status }),
                ...(maxPeople && { maxPeople: maxPeople }),
            }
        });
    },

    getRoomById: (roomId) => {
        const url = `/rooms/${roomId}`;
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