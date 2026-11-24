import api from "./axios";

export const fetchProducts = (params) =>
  api.get("/products", { params }).then((r) => r.data);

export const fetchProduct = (id) =>
  api.get(`/products/${id}`).then((r) => r.data);

export const fetchProductReviews = (id, params) =>
  api.get(`/products/${id}/reviews`, { params }).then((r) => r.data);
export const fetchProductsByIds = (ids) =>
  api.get("/products/by-ids", { params: { ids: ids.join(",") } }).then((r) => r.data.items);