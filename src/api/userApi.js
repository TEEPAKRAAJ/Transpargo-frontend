import api from "./axiosClient";

export const getKnowledgeBase = async () => api.get("/user/knowledge");
export const getUserShipments = async (userId) => api.get(`/user/${userId}`);
export const getShipmentDetails = async (shippingId) => api.get(`/user/shipment/${shippingId}`);
export const getHoldDetails = async (shippingId) => api.get(`/user/reason/${shippingId}`);

export const getSenderTimeline = async (shipmentId) => api.get(`/user/get-sender/${shipmentId}`);
export const getReceiverTimeline = async (shipmentId) => api.get(`/user/get-receiver/${shipmentId}`);
export const verifyReceiver = (email, shipmentId) => api.get(`/user/verify-receiver/${email}/${shipmentId}`);