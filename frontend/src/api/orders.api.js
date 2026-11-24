import api from "./axios";

export const fetchOrderConfig = () => api.get("/orders/config").then((r) => r.data);
export const createOrderApi = (data) => api.post("/orders", data).then((r) => r.data);
export const fetchMyOrders = () => api.get("/orders/mine").then((r) => r.data.orders);
export const fetchOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data);
export const cancelOrderApi = (id, reason) =>
  api.post(`/orders/${id}/cancel`, { reason }).then((r) => r.data);
export const payTestApi = (id) => api.post(`/orders/${id}/dev-pay`).then((r) => r.data);