import api from "./axiosClient";

export const signupUser = (data) => api.post("/auth/signup", data);
export const loginUser = (data) => api.post("/auth/login", data);