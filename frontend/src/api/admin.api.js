import api from "./axios";

export const adminGetProducts = () => api.get("/admin/products").then((r) => r.data);
export const createProductApi = (data) => api.post("/admin/products", data).then((r) => r.data);
export const updateProductApi = (id, data) => api.put(`/admin/products/${id}`, data).then((r) => r.data);