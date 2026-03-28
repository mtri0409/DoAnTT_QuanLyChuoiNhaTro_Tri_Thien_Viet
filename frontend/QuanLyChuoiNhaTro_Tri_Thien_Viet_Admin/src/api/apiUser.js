import axiosInstance from "./axios";
const apiUser = {
  createUser: (data) => {
    return axiosInstance.post("/auth/local/register", data);
  },

  loginUser: (data) => {
    return axiosInstance.post("/auth/login", data);
  },
  getAll: () => {
    return axiosInstance.get("/users").then((res) => res.data);
  },
  getUserById: (id) => {
    return axiosInstance
      .get(`users?filters[documentId][$eq]=${id}`)
      .then((res) => res.data);
  },
};
export default apiUser;
