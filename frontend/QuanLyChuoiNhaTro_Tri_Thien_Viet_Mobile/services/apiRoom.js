import axiosInstance from "./axios";
const apiRoom = {
  getAllRooms: (
    pageNumber = 0,
    pageSize = 100,
    sortBy = "roomName",
    sortOrder = "asc",
    floorId = null,
    branchId = null,
    search = "",
  ) =>
    axiosInstance
      .get("/rooms", {
        params: {
          pageNumber,
          pageSize,
          sortBy,
          sortOrder,
          floorId,
          branchId,
          search,
        },
      })
      .then((res) => res.data),
};
export default apiRoom;
