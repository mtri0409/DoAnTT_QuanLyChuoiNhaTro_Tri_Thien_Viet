// services/axios.js
import axios from "axios";
import { apiURL } from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const axiosInstance = axios.create({
  baseURL: apiURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Tự động đính token vào mọi request
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("authToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Log SAU khi gắn token
  // console.log("🌐 URL:", config.url);
  // console.log("👤 Auth:", config.headers.Authorization);
  return config;
});
// 2. RESPONSE INTERCEPTOR: Xử lý response v1 ApiResponse
axiosInstance.interceptors.response.use(
  (response) => {
    const resData = response.data;
    if (
      resData &&
      typeof resData === "object" &&
      "success" in resData &&
      "data" in resData
    ) {
      response.data = resData.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default axiosInstance;
