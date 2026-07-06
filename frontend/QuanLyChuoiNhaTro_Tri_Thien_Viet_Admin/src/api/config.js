// Lấy hostname hiện tại (có thể là 'localhost' hoặc '192.168.1.15',...)
const host = window.location.hostname;

// Các giá trị mặc định chạy local
const defaultApiUrl = `http://${host}:8080/api/v1`;  // Bỏ /api/v1 để tránh double prefix
const defaultImgUrl = `http://${host}:8080`;
const defaultSocketUrl = `http://${host}:8080/ws`;

// Đọc từ biến môi trường (Vite), fallback về giá trị local nếu không khai báo
export const apiURL = import.meta.env.VITE_API_BASE_URL || defaultApiUrl;
export const imgURL = import.meta.env.VITE_IMG_BASE_URL || defaultImgUrl;
export const socketURL = import.meta.env.VITE_WS_PARKING_URL || defaultSocketUrl;

console.log("Current API URL:", apiURL);
console.log("Current Image URL:", imgURL);
console.log("Current Socket URL:", socketURL);console.log('API URL:', import.meta.env.VITE_API_BASE_URL || 'http://' + window.location.hostname + ':8080/')
