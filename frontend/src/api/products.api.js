import api from "./axios";

export const fetchProducts = (params) =>
  api.get("/products", { params }).then((r) => r.data);

export const fetchProduct = (id) =>
  api.get(`/products/${id}`).then((r) => r.data);