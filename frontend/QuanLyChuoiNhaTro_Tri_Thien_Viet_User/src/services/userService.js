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

  getAllRooms: (pageNumber = 0, pageSize = 10, sortBy = 'roomName', sortOrder = 'asc', branchId = null, search = '') => {
    return axiosClient.get('/rooms', {
      params: {
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
        ...(branchId && { branchId }),
        ...(search && { search }),
      },
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