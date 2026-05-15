// services/apiUser.js
import axiosInstance from "./axios";

const apiUser = {
  loginUser: (data) =>
    axiosInstance.post("/auth/login", data).then((res) => res.data),
};
export default apiUser;
