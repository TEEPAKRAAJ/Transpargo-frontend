import api from "./axiosClient";


export const getAnalyticsSummary = () => api.get("/analytics/summary");
