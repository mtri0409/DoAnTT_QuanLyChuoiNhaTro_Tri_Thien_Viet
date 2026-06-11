import axiosInstance from "./axios";
const apiFloor = {
  getAllFloors: () =>
    axiosInstance.get("/admin/floors").then((res) => res.data),
};
export default apiFloor;
