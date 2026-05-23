import axiosInstance from "./axios";
const apiFloor = {
  getAllFloors: () => axiosInstance.get("/floors").then((res) => res.data),
};
export default apiFloor;
