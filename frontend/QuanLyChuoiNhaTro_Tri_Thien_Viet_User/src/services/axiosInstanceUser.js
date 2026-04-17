import axios from "axios";
import { apiURL } from "./userConfig";

const axiosClient = axios.create({
  baseURL: apiURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. REQUEST INTERCEPTOR: Tự động đính kèm Token
axiosClient.interceptors.request.use(
  (config) => {
    // PHẢI KHỚP với key "authToken" trong AuthProvider của Tri
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 2. RESPONSE INTERCEPTOR: Xử lý lỗi hệ thống toàn cục
axiosClient.interceptors.response.use(
  (response) => {
    // Trả về thẳng data để khi dùng Tri không cần .data nữa
    return response.data;
  },
  (error) => {
    // Nếu Server trả về 401 (Hết hạn token) hoặc 403 (Không có quyền)
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      localStorage.clear();
    }
    return Promise.reject(error); // Để component tự xử lý lỗi
  },
);

export default axiosClient;
