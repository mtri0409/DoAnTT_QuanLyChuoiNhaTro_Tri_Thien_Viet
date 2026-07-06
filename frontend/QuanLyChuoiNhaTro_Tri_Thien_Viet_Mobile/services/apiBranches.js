// apiBranches.js
import axiosInstance from "./axios";
const apiBranches = {
  getAllBranches: (pageNumber = 1, pageSize = 100) =>
    axiosInstance
      .get("/admin/branches", {
        params: { pageNumber, pageSize, sortBy: "branchId", sortOrder: "asc" },
      })
      .then((res) => res.data),
};
export default apiBranches;
