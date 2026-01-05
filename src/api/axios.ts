import axios from "axios";
import { useAuthStore } from "../store/authStore"; // adjust path if needed

const api = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

// 🔐 ATTACH JWT TO EVERY REQUEST
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
