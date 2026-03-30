import axiosInstance from "./axios";

const apiRoom = {
    getAllRooms: (pageNumber, pageSize = 10, sortBy = "roomName", sortOrder = "asc", floorId = null, branchId = null, search = "") => {
        return axiosInstance.get("/admin/rooms", {
            params: {
                pageNumber,
                pageSize,
                sortBy,
                sortOrder,
                floorId: floorId || null,
                branchId: branchId || null,
                search
            }
        });
    },

    createRoom: (data) => axiosInstance.post("/admin/rooms", data),
    updateRoom: (id, data) => axiosInstance.put(`/public/rooms/${id}`, data),
    deleteRoom: (id) => axiosInstance.delete(`/admin/rooms/${id}`),
    getRoomById: (id) => axiosInstance.get(`/public/rooms/${id}`)
};

export default apiRoom;