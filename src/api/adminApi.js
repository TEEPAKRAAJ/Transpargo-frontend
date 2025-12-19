import api from "./axiosClient";

export const getPendingUsers = () => api.get("/admin/pending");
export const approveUser = (id) => api.post(`/admin/approve/${id}`);
export const rejectUser = (id) => api.delete(`/admin/reject/${id}`);
export const getAllUsers = () => api.get("/admin/users");
export const deleteUser = (email) => api.delete(`/admin/delete/${email}`);
