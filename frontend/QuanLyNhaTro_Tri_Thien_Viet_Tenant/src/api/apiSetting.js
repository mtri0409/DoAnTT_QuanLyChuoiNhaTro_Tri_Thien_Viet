import axiosInstance from "./axios";

const apiSetting = {
    getSetting:()=>  axiosInstance.get("/public/settings"),
}
export default apiSetting;