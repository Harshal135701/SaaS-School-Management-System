import axios from "axios";

const api = axios.create({
  baseURL: "https://saas-school-management-system.onrender.com/api",
});

api.interceptors.request.use((config) => {
  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;