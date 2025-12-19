import api from "./axiosClient";

export async function uploadDocument(shipmentId, documentType, file) {
  const formData = new FormData();
  formData.append("File", file);
  formData.append("DocumentType", documentType);

  return api.post(`/user/${shipmentId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export async function getDocuments(shipmentId) {
  return api.get(`/user/${shipmentId}/documents`);
}

export async function deleteDocument(shipmentId, documentName) {
  return api.delete(`/user/${shipmentId}/documents/${documentName}`);
}

export async function updateDocumentStatus(shipmentId) {
  return api.put(`/user/${shipmentId}/documents/status`);
}