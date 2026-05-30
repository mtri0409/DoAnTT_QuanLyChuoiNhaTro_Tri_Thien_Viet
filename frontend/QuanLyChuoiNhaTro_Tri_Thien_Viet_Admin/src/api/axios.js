import axios from 'axios';
import { apiURL } from './config';

/**
 * axiosClient - HTTP client toàn cục
 *
 * baseURL = "http://host:8080/api/"
 * → config.url trong interceptors là phần path SAU baseURL
 *   VD: GET /api/admin/contracts → config.url = "/admin/contracts"
 */
const axiosClient = axios.create({
    baseURL: apiURL, 
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// =========================================================
// INTERCEPTOR 1: Đính kèm JWT Token vào mọi request
// =========================================================
axiosClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// =========================================================
// INTERCEPTOR 2: Xử lý Response Error toàn cục
//
// ⚠️ KHÔNG dùng Permission Guard ở frontend nữa.
//    Backend SecurityConfig đã cấu hình phân quyền chính xác
//    qua STAFF_URLS / ADMIN_URLS / PUBLIC_URLS.
//    Frontend chỉ cần xử lý response 401/403 từ backend.
// =========================================================
axiosClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        // 401: Token hết hạn / không hợp lệ → logout
        if (error.response?.status === 401) {
            console.error('[AUTH] Token hết hạn, đang logout...');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login?expired=true';
            }
        }

        // 403: Không đủ quyền → chỉ log, KHÔNG redirect
        if (error.response?.status === 403) {
            console.warn('[AUTH] 403 Forbidden:', error.config?.url);
        }

        return Promise.reject(error);
    }
);

export default axiosClient;