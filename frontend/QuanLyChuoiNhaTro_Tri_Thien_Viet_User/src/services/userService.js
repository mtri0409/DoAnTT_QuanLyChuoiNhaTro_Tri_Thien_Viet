import axiosClient from "./axiosInstanceUser";

const userService = {
  getAllBranches: (
    pageNumber = 1,
    pageSize = 50,
    sortBy = "branchId",
    sortOrder = "asc",
    search = "",
  ) => {
    return axiosClient.get("/branches", {
      params: { pageNumber, pageSize, sortBy, sortOrder, search },
    });
  },

  getAllAmenities: (
    pageNumber = 0,
    pageSize = 50,
    sortBy = "amenityName",
    sortOrder = "asc",
  ) => {
    return axiosClient.get("/amenities", {
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
    search = '',
    status = null
  ) => {
    const url = `/rooms`;
    return axiosClient.get(url, {
      params: {
        pageNumber: pageNumber,
        pageSize: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(floorId && { floorId: floorId }),
        ...(branchId && { branchId: branchId }),
        ...(search && { search: search }),
        ...(status && { status }),
      }
    });
  },

  getRoomById: (roomId) => {
    return axiosClient.get(`/rooms/${roomId}`);
  },

  getMediaByRoomId: (roomId) => {
    return axiosClient.get(`/room-media/room/${roomId}`);
  },
  getProfileById: (id) => {
    return axiosClient.get(`/profiles/${id}`);
  },
  getAllFloors: () => {
    const url = `/floors`;
    return axiosClient.get(url);
  },
  createManualNotification: (profileId = 0, branchId = 0, data) => {
    return axiosClient.post(`/notification/send-manual`, data, {
      params: {
        profileId: profileId || 0, // Nếu không có thì gửi 0
        branchId: branchId || 0    // Nếu không có thì gửi 0
      }
    });
  },

};

export default userService;
