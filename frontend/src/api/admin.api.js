import api from "./axios";

export const adminGetProducts = () => api.get("/admin/products").then((r) => r.data);
export const createProductApi = (data) => api.post("/admin/products", data).then((r) => r.data);
export const updateProductApi = (id, data) => api.put(`/admin/products/${id}`, data).then((r) => r.data);
export const deleteProductApi = (id) => api.delete(`/admin/products/${id}/permanent`).then((r) => r.data);
export const adminGetLevels = () => api.get("/admin/mystery/levels").then((r) => r.data.levels);
export const updateLevelApi = (id, data) =>
  api.put(`/admin/mystery/levels/${id}`, data).then((r) => r.data);
export const addPrizeApi = (data) => api.post("/admin/mystery/pool", data).then((r) => r.data);
export const updatePrizeApi = (id, weight) =>
  api.put(`/admin/mystery/pool/${id}`, { weight }).then((r) => r.data);
export const deletePrizeApi = (id) => api.delete(`/admin/mystery/pool/${id}`).then((r) => r.data);