// export const API_HOST = "Dán ip tụi mày vô";
export const API_HOST = window.location.hostname;

export const API_PORT = "8080";
export const apiURL = `http://${API_HOST}:${API_PORT}/api/v1/`;
export const imgURL = `http://${API_HOST}:${API_PORT}`;

console.log("API URL:", API_HOST);
