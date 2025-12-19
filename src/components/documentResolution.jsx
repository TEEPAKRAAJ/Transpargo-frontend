// DocumentResolution.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosClient";
import { uploadDocument, getDocuments, deleteDocument } from "../api/documentApi";

export default function DocumentResolution() {
  const navigate = useNavigate();
  const { type = "Sender", shipmentId } = useParams(); // type: sender | receiver (case-insensitive)

  const [loading, setLoading] = useState(true);
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [requiredDocs, setRequiredDocs] = useState([]); // filtered docs for this type

  // selectedFiles: { [docName]: File | { id, url, document_name } }
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadStatus, setUploadStatus] = useState({}); // idle | pending | success | error
  const [uploading, setUploading] = useState(false);
  const [errorList, setErrorList] = useState([]);

  // refs for file inputs
  const inputRefs = useRef({});

  // --- Helpers: load reason (required docs + details) ---
  useEffect(() => {
    async function loadReasonAndDocs() {
      setLoading(true);
      try {
        // 1) Fetch shipment reason + required_docs
        const res = await api.get(`/user/reason/${shipmentId}`);
        const data = res.data;

        const details = {
          shipment_id: data.shipment_id,
          status: data.status,
          reason: data.reason,
          origin: data.origin,
          destination: data.destination,
        };
        setShipmentDetails(details);

        // 2) Filter required_docs by requested_for === type (case-insensitive)
        const docsArr = Array.isArray(data.required_docs) ? data.required_docs : [];
        const filtered = docsArr.filter(
          (d) =>
            d &&
            d.requested_for &&
            d.requested_for.toString().toLowerCase() === type.toString().toLowerCase()
        );

        // keep original order
        setRequiredDocs(filtered);

      } catch (err) {
        console.error("Error loading reason:", err);
        setShipmentDetails(null);
        setRequiredDocs([]);
      } finally {
        setLoading(false);
      }
    }

    loadReasonAndDocs();
  }, [shipmentId, type]);

  // --- Load already uploaded documents (DB rows) and map into selectedFiles + status ---
  useEffect(() => {
    async function loadUploadedDocs() {
      try {
        const res = await getDocuments(shipmentId);
        const docs = Array.isArray(res.data) ? res.data : [];

        const selected = {};
        const status = {};

        docs.forEach((doc) => {
          // doc.document_name should match the doc.name in requiredDocs
          selected[doc.document_name] = {
            id: doc.id,
            url: doc.document_url,
            document_name: doc.document_name,
          };
          status[doc.document_name] = "success";
        });

        // merge with current selection but prefer DB values (so reload doesn't overwrite local files)
        setSelectedFiles((prev) => ({ ...prev, ...selected }));
        setUploadStatus((prev) => ({ ...prev, ...status }));
      } catch (err) {
        console.error("Error loading uploaded docs:", err);
      }
    }

    // Only run after we know requiredDocs (so UI shows correct rows) — but safe to always call
    loadUploadedDocs();
  }, [shipmentId]);

  // --- File input trigger ---
  const handleUploadClick = (docName) => {
    if (uploading) return;
    if (uploadStatus[docName] === "success") return;
    const el = inputRefs.current[docName];
    if (el) el.click();
  };

  // --- When user chooses file locally (before uploading) ---
  const handleFileChange = (docName, file) => {
    if (!file) return;
    setSelectedFiles((prev) => ({ ...prev, [docName]: file }));
    setUploadStatus((prev) => ({ ...prev, [docName]: "idle" }));
  };

  // --- Remove local file before upload ---
  const removeFile = (docName) => {
    if (uploading) return;
    if (uploadStatus[docName] === "success") return; // cannot remove after uploaded (use delete)
    setSelectedFiles((prev) => {
      const updated = { ...prev };
      delete updated[docName];
      return updated;
    });
    setUploadStatus((prev) => {
      const updated = { ...prev };
      delete updated[docName];
      return updated;
    });
  };

  // --- Delete uploaded document (server + storage) by document name ---
  const removeUploaded = async (docName) => {
    if (uploading) return;
    try {
      await deleteDocument(shipmentId, encodeURIComponent(docName));
      // refresh uploaded docs list
      const res = await getDocuments(shipmentId);
      const docs = Array.isArray(res.data) ? res.data : [];

      const selected = {};
      const status = {};
      docs.forEach((doc) => {
        selected[doc.document_name] = {
          id: doc.id,
          url: doc.document_url,
          document_name: doc.document_name,
        };
        status[doc.document_name] = "success";
      });

      setSelectedFiles((prev) => {
        // remove local file too
        const updated = { ...prev };
        delete updated[docName];
        return { ...updated, ...selected };
      });

      setUploadStatus((prev) => {
        const updated = { ...prev };
        delete updated[docName];
        return { ...updated, ...status };
      });

    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("Failed to delete document");
    }
  };

  // --- View document ---
  const handleView = async (docName) => {
    const item = selectedFiles[docName];
    if (!item) return;

    // If it's a File (client-side) -> createObjectURL
    if (item instanceof File) {
      const url = URL.createObjectURL(item);
      window.open(url, "_blank");
      return;
    }

    // If it's from server: item.url holds path in bucket, request signed-url
    try {
      // backend route: GET /user/{shipmentId}/documents/signed-url?path=<path>
      const res = await api.get(`/user/${shipmentId}/documents/signed-url`, {
        params: { path: item.url },
      });

      // backend may return { signedURL } or { signed_url } or other; check keys
      const data = res.data || {};
      const signed = data.signedURL || data.signed_url || data.signed || data.url;
      if (signed) {
        window.open(signed, "_blank");
      } else {
        // if backend returned JSON of the signed-url wrapper, try parse
        // fallback: open raw data as text
        const asText = typeof data === "string" ? data : JSON.stringify(data);
        const blob = new Blob([asText], { type: "application/json" });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      }
    } catch (err) {
      console.error("Failed to fetch signed url:", err);
      alert("Unable to open document (signed url failed).");
    }
  };

  // --- Upload single file (and refresh uploaded docs after) ---
  const uploadSingle = async (docName, file) => {
    try {
      setUploadStatus((prev) => ({ ...prev, [docName]: "pending" }));
      await uploadDocument(shipmentId, docName, file);

      // Refresh DB list so we capture id + url saved by backend
      const res = await getDocuments(shipmentId);
      const docs = Array.isArray(res.data) ? res.data : [];

      const selected = {};
      const status = {};
      docs.forEach((doc) => {
        selected[doc.document_name] = {
          id: doc.id,
          url: doc.document_url,
          document_name: doc.document_name,
        };
        status[doc.document_name] = "success";
      });

      setSelectedFiles((prev) => ({ ...prev, ...selected }));
      setUploadStatus((prev) => ({ ...prev, ...status }));

      return true;
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadStatus((prev) => ({ ...prev, [docName]: "error" }));
      setErrorList((prev) => [...prev, { doc: docName, error: err?.message || "Upload error" }]);
      return false;
    }
  };

  // --- Upload All (sequential) for the currently displayed requiredDocs ---
  const handleUploadAll = async () => {
    // pick entries only for required docs (we only show those on this page)
    const entries = requiredDocs.map(d => d.name)
      .map(name => [name, selectedFiles[name]])
      .filter(([name, file]) => !!file && file instanceof File); // only local files

    if (entries.length === 0) {
      alert("No selected files to upload.");
      return;
    }

    setUploading(true);
    setErrorList([]);

    for (const [docName, file] of entries) {
      // skip those already uploaded
      if (uploadStatus[docName] === "success") continue;
      await uploadSingle(docName, file);
    }

    setUploading(false);
  };

  
  // Count ONLY documents relevant to this page
const docNamesOnThisPage = requiredDocs.map(d => d.name);

// Uploaded = how many of these docs have status = "success"
const uploaded = docNamesOnThisPage.filter(
  (name) => uploadStatus[name] === "success"
).length;

// Total = number of docs required for this sender/receiver page
const total = requiredDocs.length;


  // --- Render ---
  if (loading) {
    return <p className="text-center text-deepBlue mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6]">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-4">Document Resolution & Actions</h1>

        {/* Shipment details */}
        <div className="bg-white/80 rounded-lg shadow p-6 mb-6 border">
          <h2 className="text-xl font-semibold text-[#3D52A0] mb-3">Shipment Hold Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div><span className="font-semibold">Shipment ID:</span> {shipmentDetails?.shipment_id}</div>
            <div>
              <span className="font-semibold">Status:</span>{" "}
              <span className="text-red-600 font-semibold">{shipmentDetails?.status}</span>
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold">Reason for Hold:</span> {shipmentDetails?.reason}
            </div>
            <div><span className="font-semibold">Origin:</span> {shipmentDetails?.origin}</div>
            <div><span className="font-semibold">Destination:</span> {shipmentDetails?.destination}</div>
          </div>
        </div>

        {/* Required Documents */}
<div className="bg-white/80 rounded-lg shadow p-6 mb-6 border">
  <h2 className="text-xl font-semibold text-[#3D52A0] mb-4">
    Required Documents
  </h2>

  {/* If NO documents for this type → show message and STOP */}
  {requiredDocs.length === 0 && (
    <p className="text-gray-600 text-lg font-medium">
      No documents requested for <span className="font-semibold text-[#3D52A0]">{type}</span>.
    </p>
  )}

  {/* Document Rows */}
  <div className="space-y-4">
    {requiredDocs.map((doc, idx) => {
      const dn = doc.name;
      const item = selectedFiles[dn];
      const status = uploadStatus[dn];
      const fileUploaded = status === "success";

      return (
        <div
          key={idx}
          className="
            bg-mistWhite rounded-lg p-3 border
            flex flex-col md:flex-row md:items-center md:justify-between
            gap-4
          "
        >
          {/* LEFT SIDE */}
          <div>
            <p className="font-medium">{dn}</p>

            {/* Show attached file name (LOCAL or UPLOADED) */}
            {item && (
              <p className="text-xs text-green-600 font-semibold mt-1">
                 {item.name || item.document_name}
              </p>
            )}

            {doc.notes && <p className="text-xs text-gray-500">{doc.notes}</p>}
            {fileUploaded && <p className="text-xs text-green-600">Uploaded</p>}
            {!fileUploaded && status === "pending" && <p className="text-xs text-gray-600">Uploading…</p>}
            {status === "error" && <p className="text-xs text-red-600">Upload failed</p>}
          </div>

          {/* RIGHT SIDE BUTTONS — RESPONSIVE FIX */}
          <div className="flex flex-wrap gap-3 justify-end">

            {/* Upload Button */}
            <button
              className={`px-4 py-2 rounded-lg text-white font-semibold ${
                fileUploaded ? "bg-gray-400 cursor-not-allowed" : "bg-[#7091E6] hover:bg-[#3D52A0]"
              }`}
              disabled={uploading || fileUploaded}
              onClick={() => handleUploadClick(dn)}
            >
              Upload
            </button>

            {/* View File */}
            {item && (
              <button
                className="px-3 py-2 bg-[#8697C4] text-white rounded-lg"
                onClick={() => handleView(dn)}
              >
                View
              </button>
            )}

            {/* Remove Before Upload */}
            {item && !fileUploaded && (
              <button
                className="px-3 py-2 bg-red-500 text-white rounded-lg"
                onClick={() => removeFile(dn)}
                disabled={uploading}
              >
                Remove
              </button>
            )}

            {/* Delete After Upload */}
            {fileUploaded && (
              <button
                className="px-3 py-2 bg-red-600 text-white rounded-lg"
                onClick={() => removeUploaded(dn)}
                disabled={uploading}
              >
                Delete
              </button>
            )}

            {/* HIDDEN FILE INPUT */}
            <input
              ref={(el) => (inputRefs.current[dn] = el)}
              type="file"
              className="hidden"
              onChange={(e) => handleFileChange(dn, e.target.files?.[0])}
            />
          </div>
        </div>
      );
    })}
  </div>
</div>

{/* === HIDE PROGRESS + BUTTONS IF NO DOCS === */}
{requiredDocs.length > 0 && (
  <div className="bg-white/80 rounded-lg shadow p-6 mb-6 border">
    <div className="flex items-center justify-between mb-3">
      <div className="font-semibold text-[#3D52A0]">
        {uploading ? "Uploading..." : "Upload Progress"}
      </div>
      <div className="font-semibold text-[#7091E6]">{uploaded} / {total}</div>
    </div>

    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="h-3 rounded-full transition-all"
        style={{
          width: `${total === 0 ? 0 : Math.round((uploaded / total) * 100)}%`,
          backgroundColor: "#7091E6"
        }}
      />
    </div>

    <div className="flex gap-4 mt-6">
      <button
        onClick={handleUploadAll}
        disabled={uploading}
        className={`flex-1 py-3 text-white rounded-lg font-bold ${
          uploading ? "bg-gray-400" : "bg-[#7091E6] hover:bg-[#3D52A0]"
        }`}
      >
        {uploading ? "Uploading..." : "Upload All"}
      </button>

      <button
        onClick={() => navigate(`/user/tracking/${type}/${shipmentId}`)}
        className="flex-1 py-3 text-white rounded-lg font-bold bg-green-600 hover:bg-green-700"
      >
        Submit
      </button>
    </div>
  </div>
)}

{/* Other Resolution Options — ONLY FOR SENDER */}
{type.toLowerCase() === "sender" && shipmentDetails.status === "Import Clearance" &&(
  <div className="bg-white/80 rounded-lg shadow p-6 border mb-6">
    <h2 className="text-2xl font-bold text-[#3D52A0] mb-4">
      Other Resolution Options
    </h2>

    <div className="space-y-4">

      {/* Request Return of Shipment */}
      <button
        className="
          w-full py-3 border border-[#ADBBD4]
          rounded-lg font-semibold text-[#3D52A0]
          bg-white hover:bg-[#EDE8F5]
          transition
        "
        onClick={async () => {
          if (!window.confirm("Returns Charges are more than usual shipping cost (they include Return Handling Fee, Storage or Warehousing fee, Destination Customs Fees, Re-export Documentation Fee, Demurrage or Detention fee, Other Local Charges )\n\nConfirm: Request return of shipment?")) return;

          try {
            const numeric = shipmentId.replace("SHP", "");
            await api.put(`/api/shipments/${numeric}/status-return-request`);

            alert("Return request submitted successfully.");

            navigate(`/user/tracking/${type}/${shipmentId}`);
          } catch (err) {
            console.error("Return request failed:", err);
            alert("Failed to submit return request.");
          }
        }}
      >
        Request Return of Shipment (Fees Apply)
      </button>

      {/* Approve Destruction */}
      <button
        className="
          w-full py-3 border border-red-400 rounded-lg
          font-semibold text-red-600 bg-red-50
          hover:bg-red-100 transition
        "
        onClick={async () => {
          if (!window.confirm("Warning: Approving destruction is irreversible. Continue?")) return;

          try {
            const numeric = shipmentId.replace("SHP", "");
            await api.put(`/api/shipments/${numeric}/status-destruction-request`);

            alert("Destruction request submitted successfully.");

            navigate(`/user/tracking/${type}/${shipmentId}`);
          } catch (err) {
            console.error("Destruction request failed:", err);
            alert("Failed to submit destruction request.");
          }
        }}
      >
        Rquest Destruction (Fees Apply)
      </button>

    </div>

    <p className="text-xs text-gray-500 mt-3">
      Choosing Return / Destruction may incur additional handling fees.
    </p>
  </div>
)}


        {/* Errors (if any) */}
        {errorList.length > 0 && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">
            <strong>Upload errors:</strong>
            <ul className="mt-2 list-disc ml-5">
              {errorList.map((e, i) => <li key={i}>{e.doc}: {e.error}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
