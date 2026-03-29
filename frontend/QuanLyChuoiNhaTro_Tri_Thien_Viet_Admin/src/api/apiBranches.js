import axiosInstance from "./axios";
const apiBranches = {
 
   getAllBranches: (pageNumber, pageSize = 5) => {
    const url = `/admin/branches`;
    return axiosInstance.get(url, {
      params: {
        pageNumber: pageNumber, // Gửi 1, 2, 3...
        pageSize: pageSize,
        sortBy: 'branchId',
        sortOrder: 'asc'
      }
    });
  }
};
export default apiBranches;