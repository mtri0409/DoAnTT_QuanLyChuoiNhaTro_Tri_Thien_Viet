import axios from 'axios';
import { apiURL } from './config';

const axiosClient = axios.create({
    baseURL: apiURL, 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// 1. REQUEST INTERCEPTOR: Tự động đính kèm Token
axiosClient.interceptors.request.use(
    (config) => {
        console.log("🚀 ĐANG GỬI REQUEST TỚI:", config.url);
        // PHẢI KHỚP với key "authToken" trong AuthProvider của Tri
        const token = localStorage.getItem('authToken'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. RESPONSE INTERCEPTOR: Xử lý lỗi hệ thống toàn cục
axiosClient.interceptors.response.use(
   
    (response) => {
        const resData = response.data;
        if (resData && typeof resData === 'object' && 'success' in resData && 'data' in resData) {
            return resData.data;
        }
        return resData; 
    },
    (error) => {
        console.log("LỖI PHẢN HỒI: ", error.response);

        // Kiểm tra xem có response từ server không
        if (error.response) {
            const status = error.response.status;

            // Nếu 401 hoặc 403 và người dùng KHÔNG phải đang ở trang login
            if ((status === 401 || status === 403) && window.location.pathname !== '/login') {
                console.error("Phiên đăng nhập hết hạn hoặc không có quyền!");
                
                localStorage.removeItem('authToken'); // Chỉ xóa token cần thiết
                // localStorage.clear(); // Hoặc xóa hết nếu bạn muốn sạch sẽ hoàn toàn

                // Dùng replace để người dùng không bấm "Back" quay lại được trang lỗi
                window.location.replace('/login'); 
                return new Promise(() => {}); // "Cắt đứt" luồng xử lý phía sau để tránh crash app
            }
        } else if (error.request) {
            // Lỗi không nhận được phản hồi từ server (Network Error)
            console.error("Không thể kết nối đến máy chủ!");
        }

        return Promise.reject(error);
    }
);
export default axiosClient;