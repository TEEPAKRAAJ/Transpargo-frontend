import api from "./axiosClient";

// Create a new shipment
export const createShipment = async (payload) => {
  return api.post("/createshipment", payload);
};