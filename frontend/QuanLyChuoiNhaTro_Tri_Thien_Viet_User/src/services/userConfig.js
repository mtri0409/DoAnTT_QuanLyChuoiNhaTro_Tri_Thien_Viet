// Lấy hostname hiện tại (có thể là 'localhost' hoặc '192.168.1.15',...)
const host = window.location.hostname;

// Các giá trị mặc định chạy local
const defaultApiUrl = `http://${host}:8080/api/v1/`;
const defaultImgUrl = `http://${host}:8080`;

// Đọc từ biến môi trường (Vite), fallback về giá trị local nếu không khai báo
export const apiURL = import.meta.env.VITE_API_BASE_URL || defaultApiUrl;
export const imgURL = import.meta.env.VITE_IMG_BASE_URL || defaultImgUrl;
