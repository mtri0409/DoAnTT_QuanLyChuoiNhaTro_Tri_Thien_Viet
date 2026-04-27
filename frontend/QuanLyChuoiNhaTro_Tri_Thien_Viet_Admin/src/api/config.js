// Lấy hostname hiện tại (có thể là 'localhost' hoặc '192.168.1.15',...)
const host = window.location.hostname;

// Backend thường chạy ở port 8080
export const apiURL = `http://${host}:8080/api/`;
export const imgURL = `http://${host}:8080`;

console.log("Current API URL:", apiURL); // Để bạn dễ kiểm tra khi chạy