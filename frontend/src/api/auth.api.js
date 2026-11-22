import api from "./axios";

export const signupApi = (data) => api.post("/auth/signup", data).then((r) => r.data);
export const loginApi = (data) => api.post("/auth/login", data).then((r) => r.data);
export const getMeApi = () => api.get("/auth/me").then((r) => r.data);