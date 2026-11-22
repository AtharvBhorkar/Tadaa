import axios from "axios";

export const TOKEN_KEY = "tadaa_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) localStorage.removeItem(TOKEN_KEY);
    return Promise.reject(err);
  }
);

export const getErrorMessage = (err) =>
  err.response?.data?.message || "Something went wrong, try again";

export default api;