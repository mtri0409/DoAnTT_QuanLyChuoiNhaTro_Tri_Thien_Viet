import axiosClient from "./axiosInstanceUser";

const userService = {
  getAllBranches: (pageNumber = 1, pageSize = 50, sortBy = 'branchId', sortOrder = 'asc', search = '') => {
    return axiosClient.get('/branches', {
      params: { pageNumber, pageSize, sortBy, sortOrder, search },
    });
  },

  getAllAmenities: (pageNumber = 0, pageSize = 50, sortBy = 'amenityName', sortOrder = 'asc') => {
    return axiosClient.get('/amenities', {
      params: { pageNumber, pageSize, sortBy, sortOrder },
    });
  },

  getAllRooms: (
        pageNumber = 0,
        pageSize = 10,
        sortBy = 'roomName',
        sortOrder = 'asc',
        floorId = null,
        branchId = null,
        search = ''
    ) => {
        const url = `/rooms`;
        return axiosClient.get(url, {
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
    return axiosClient.get(`/rooms/${roomId}`);
  },

  getMediaByRoomId: (roomId) => {
    return axiosClient.get(`/room-media/room/${roomId}`);
  },
  
};

export default userService;