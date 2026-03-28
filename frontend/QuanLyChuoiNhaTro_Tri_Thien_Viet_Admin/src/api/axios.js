import axios from 'axios';
import { apiURL } from './config';

const axiosClient = axios.create({
    baseURL: apiURL, // Địa chỉ Backend của bạn
    timeout:10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Tự động đính kèm Token nếu bạn có làm bảo mật JWT sau này
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;