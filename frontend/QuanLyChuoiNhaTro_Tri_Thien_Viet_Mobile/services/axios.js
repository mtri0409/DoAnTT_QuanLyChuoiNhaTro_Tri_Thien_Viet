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
  return config;
});

export default axiosInstance;
