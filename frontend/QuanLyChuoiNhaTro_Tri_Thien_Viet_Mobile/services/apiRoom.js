import axiosInstance from "./axios";

const apiRoom = {
  getAllRooms: (
    pageNumber = 0,
    pageSize = 10,
    sortBy = "roomName",
    sortOrder = "asc",
    floorId = null,
    branchId = null,
    search = "",
  ) => {
    return axiosInstance.get(`/admin/rooms`, {
      params: {
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        ...(floorId && { floorId }),
        ...(branchId && { branchId }),
        ...(search && { search }),
      },
    });
  },

  // Tìm phòng theo tên – dùng cho tenant (public endpoint)
  searchByName: (search = "", pageNumber = 0, pageSize = 10) =>
    axiosInstance.get(`/public/rooms`, {
      params: { search, pageNumber, pageSize },
    }),
  getRoomById: (roomId) => axiosInstance.get(`/rooms/${roomId}`),

  // Lấy danh sách phòng mà tenant đang ở
  // Interceptor tự unwrap: response.data = resData.data
  getMyRooms: () => axiosInstance.get("/user/my-rooms"),

  createRoom: (roomDTO) => axiosInstance.post(`/admin/rooms`, roomDTO),

  updateRoom: (roomId, roomDTO) =>
    axiosInstance.put(`/public/rooms/${roomId}`, roomDTO),

  deleteRoom: (roomId) => axiosInstance.delete(`/admin/rooms/${roomId}`),
};

export default apiRoom;
