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
    sortBy = "roomName",
    sortOrder = "asc",
    floorId = null,
    branchId = null,
    search = "",
    status = null,
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
      },
    });
  },

  getRoomById: (roomId) => {
    return axiosClient.get(`/rooms/${roomId}`);
  },

  getMediaByRoomId: (roomId) => {
    return axiosClient.get(`/room-media/room/${roomId}`);
  },
  getActivePosts: (
    pageNumber = 0,
    pageSize = 10,
    roomId = null,
    branchId = null,
  ) => {
    return axiosClient.get("/public/roommate-posts", {
      params: {
        pageNumber,
        pageSize,
        ...(roomId && { roomId }),
        ...(branchId && { branchId }),
      },
    });
  },
  getPostById: (postId) => {
    return axiosClient.get(`/public/roommate-posts/${postId}`);
  },
  getAllFloors: () => {
    return axiosClient.get("/floors");
  },
};

export default userService;
