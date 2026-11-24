import api from "./axios";

export const fetchLevels = () => api.get("/mystery/levels").then((r) => r.data.levels);