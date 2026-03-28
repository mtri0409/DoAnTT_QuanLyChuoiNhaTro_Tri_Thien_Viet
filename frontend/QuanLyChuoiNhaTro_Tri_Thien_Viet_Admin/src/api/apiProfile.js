import axiosInstance from "./axios";
const apiProfile = {
 
   getAllProfiles: (pageNumber, pageSize = 5) => {
    const url = `/admin/profiles`;
    return axiosInstance.get(url, {
      params: {
        pageNumber: pageNumber, // Gửi 1, 2, 3...
        pageSize: pageSize,
        sortBy: 'id',
        sortOrder: 'asc'
      }
    });
  }
};
export default apiProfile;