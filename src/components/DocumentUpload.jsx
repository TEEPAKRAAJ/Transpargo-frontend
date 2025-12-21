import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getShipmentDetails } from "../api/userApi";
import { uploadDocument, getDocuments, deleteDocument, updateDocumentStatus } from "../api/documentApi";

export default function DocumentUpload() {
  const { type, id: shipmentId } = useParams();
  const navigate = useNavigate();

  const [selectedFiles, setSelectedFiles] = useState({});
  const [shipmentDetails, setShipmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({});
  const [errorList, setErrorList] = useState([]);

  // ---------------- AI GENERATED REQUIRED DOCUMENTS ONLY ----------------
  const [requiredDocs, setRequiredDocs] = useState([]);

  // ----------- Load Shipment details -----------
  useEffect(() => {
    async function loadDetails() {
      try {
        const res = await getShipmentDetails(shipmentId);
        setShipmentDetails(res.data);
      } catch (err) {
        console.error("Error loading shipment details:", err);
      }
      setLoading(false);
    }
    loadDetails();
  }, [shipmentId]);
console.log(shipmentDetails);
  // ----------- Fetch Required Docs From AI Backend -----------
  useEffect(() => {
    async function fetchAIRequiredDocs() {
      if (!shipmentDetails?.hs_code) return;

      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/user/${shipmentId}/documents/required-docs/${shipmentDetails.rec_hs_code}`
        );

        const data = await res.json();

        if (Array.isArray(data?.required_documents)) {
          setRequiredDocs(data.required_documents);
        } else setRequiredDocs([]);
      } catch {
        setRequiredDocs([]);
      }
    }

    fetchAIRequiredDocs();
  }, [shipmentDetails]);

console.log(shipmentDetails);
  // ----------- Load Already Uploaded Docs -----------
  useEffect(() => {
    async function loadUploadedDocs() {
      try {
        const res = await getDocuments(shipmentId);

        const docs = Array.isArray(res.data) ? res.data : [];
        const selected = {}, status = {};

        docs.forEach(doc => {
          selected[doc.document_name] = {
            name: doc.document_name,
            url: doc.document_url,
            id: doc.id
          };
          status[doc.document_name] = "success";
        });

        setSelectedFiles(p => ({ ...p, ...selected }));
        setUploadStatus(p => ({ ...p, ...status }));
      } catch { }
    }
    loadUploadedDocs();
  }, [shipmentId]);


  // -------- File Handling ----------
  const uploadFileClick = (doc) => {
    if (uploading || uploadStatus[doc] === "success") return;
    document.getElementById(doc)?.click();
  };

  const handleFileChange = (doc, file) => {
    setSelectedFiles(prev => ({ ...prev, [doc]: file }));
    setUploadStatus(prev => ({ ...prev, [doc]: "idle" }));
  };

  const removeFile = (doc) => {
    if (uploading || uploadStatus[doc] === "success") return;
    const f = { ...selectedFiles }; delete f[doc]; setSelectedFiles(f);
    const s = { ...uploadStatus }; delete s[doc]; setUploadStatus(s);
  };

  const removeUploaded = async (doc) => {
    try {
      await deleteDocument(shipmentId, doc);
      const f = { ...selectedFiles }; delete f[doc]; setSelectedFiles(f);
      const s = { ...uploadStatus }; delete s[doc]; setUploadStatus(s);
    } catch { alert("Delete failed"); }
  };


  // -------- Upload All ----------
  const handleUploadAll = async () => {
    const entries = Object.entries(selectedFiles);
    if (entries.length === 0) return alert("Select documents before uploading.");

    setUploading(true); setErrorList([]);

    for (const [docName, file] of entries) {
      if (uploadStatus[docName] === "success") continue;

      setUploadStatus(prev => ({ ...prev, [docName]: "pending" }));

      try {
        await uploadDocument(shipmentId, docName, file);
        setUploadStatus(prev => ({ ...prev, [docName]: "success" }));
      } catch (err) {
        setUploadStatus(prev => ({ ...prev, [docName]: "error" }));
        setErrorList(prev => [...prev, { doc: docName, error: err.message }]);
      }
    }
    setUploading(false);
  };


  const handleFinalSubmit = () => {
    updateDocumentStatus(shipmentId);
    navigate(`/user/tracking/${type}/${shipmentId}`);
  };


  if (loading) return <p className="text-center mt-10">Loading shipment...</p>;

  // ------------ Only RequiredDocs considered now ------------
  const docsOnScreen = [...requiredDocs]; 
  const uploadedCount = docsOnScreen.filter(d => uploadStatus[d] === "success").length;


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6] p-6">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-3xl font-bold text-[#3D52A0] mb-8">Document Upload</h1>

        <ShipmentDetailsCard shipment={shipmentDetails} />

        {/* ONLY REQUIRED DOCUMENTS NOW */}
        <DocSection title="Required Documents" docs={requiredDocs}
          selectedFiles={selectedFiles} uploadFileClick={uploadFileClick} handleFileChange={handleFileChange}
          removeFile={removeFile} uploading={uploading} uploadStatus={uploadStatus} shipmentId={shipmentId}
          removeUploaded={removeUploaded}
        />

        <UploadProgress uploaded={uploadedCount} total={requiredDocs.length} uploading={uploading} />

        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button onClick={handleUploadAll} disabled={uploading}
            className={`w-full md:w-1/2 py-3 text-white rounded-lg font-bold ${
              uploading ? "bg-gray-400" : "bg-[#7091E6] hover:bg-[#3D52A0]"
            }`}>
            {uploading ? "Uploading..." : "Upload All"}
          </button>

          <button onClick={handleFinalSubmit}
            className="w-full md:w-1/2 py-3 text-white rounded-lg font-bold bg-green-600 hover:bg-green-700">
            Submit Documents
          </button>
        </div>

      </div>
    </div>
  );
}


/* ------------------- COMPONENTS (UNCHANGED) ------------------- */

function ShipmentDetailsCard({ shipment }) {
  return (
    <div className="bg-white/80 rounded-lg shadow p-6 border mb-8">
      <h2 className="text-2xl font-bold text-[#3D52A0] mb-4">Shipment Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Shipment ID" value={shipment.shipment_id} />
        <DetailItem label="Product Name" value={shipment.product_name} />
        <DetailItem label="Origin → Destination" value={`${shipment.origin} → ${shipment.destination}`} />
        <DetailItem label="Product Category" value={shipment.product_category} />
        <DetailItem label="Declared Value" value={`₹${shipment.declared_value}`} />
        <DetailItem label="Weight" value={`${shipment.weight} kg`} />
        <DetailItem label="Sender HS Code" value={shipment.hs_code} />
        <DetailItem label="Receiver HS Code" value={shipment.rec_hs_code} />
      </div>
    </div>
  );
}


function DocSection({ title, docs, selectedFiles, uploadFileClick, handleFileChange,
  removeFile, uploading, uploadStatus, shipmentId, removeUploaded }) {

  return (
    <div className="bg-white/80 rounded-lg shadow p-6 border mb-8">
      <h2 className="text-2xl font-bold text-[#3D52A0] mb-4">{title}</h2>

      <div className="space-y-4">
        {docs.length > 0 ? docs.map((doc, i) =>
          <DocRow key={i} doc={doc} selectedFiles={selectedFiles} uploadFileClick={uploadFileClick}
            handleFileChange={handleFileChange} removeFile={removeFile} uploading={uploading}
            status={uploadStatus[doc]} shipmentId={shipmentId} removeUploaded={removeUploaded} />
        ) :
          <p className="text-gray-500 italic">AI is generating required documents...</p>}
      </div>
    </div>
  );
}



function DocRow({ doc, selectedFiles, uploadFileClick, handleFileChange,
  removeFile, uploading, status, shipmentId, removeUploaded }) {

  const fileUploaded = status === "success";

  return (
    <div className="bg-white p-4 rounded-lg border-l-4 border-[#7091E6] shadow-sm
      flex flex-col md:flex-row md:justify-between md:items-center gap-4">

      <div className="flex items-center gap-3">
        <span className="text-2xl">📄</span>
        <span className="font-medium text-[#3D52A0]">{doc}</span>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-end">
        {selectedFiles[doc] && <span className="text-green-600 font-medium">
            ✓ {selectedFiles[doc]?.name || selectedFiles[doc]?.document_name}
        </span>}

        {status === "pending" && <span className="text-sm text-gray-600">Uploading…</span>}
        {status === "success" && <span className="text-sm text-green-600">Uploaded</span>}
        {status === "error" && <span className="text-sm text-red-600">Error</span>}

        <button
          className={`px-5 py-2 rounded-lg font-semibold text-white ${
            fileUploaded ? "bg-gray-400" : "bg-[#7091E6] hover:bg-[#3D52A0]"
          }`}
          disabled={uploading || fileUploaded}
          onClick={() => uploadFileClick(doc)}
        >
          Upload
        </button>

        {selectedFiles[doc] && !fileUploaded && (
          <button className="px-4 py-2 bg-[#8697C4] text-white rounded-lg"
            onClick={() => window.open(URL.createObjectURL(selectedFiles[doc]), "_blank")}>
            View
          </button>
        )}

        {selectedFiles[doc] && !fileUploaded && (
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg"
            onClick={() => removeFile(doc)} disabled={uploading}>
            Remove
          </button>
        )}

        {fileUploaded && (
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg"
            onClick={() => removeUploaded(doc)}>
            Delete
          </button>
        )}
      </div>

      <input id={doc} type="file" className="hidden"
        onChange={(e) => handleFileChange(doc, e.target.files[0])}
        aria-label={`Upload for ${doc}`} title={`Upload for ${doc}`} />
    </div>
  );
}


function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-semibold text-[#3D52A0]">{value}</p>
    </div>
  );
}


function UploadProgress({ uploaded, total, uploading }) {
  const percent = total > 0 ? Math.round((uploaded / total) * 100) : 0;

  return (
    <div className="bg-white/80 p-4 rounded-lg shadow border mb-6">
      <div className="flex justify-between mb-1">
        <span className="font-semibold text-[#3D52A0]">
          {uploading ? "Uploading..." : "Upload Progress"}
        </span>
        <span className="font-semibold text-[#7091E6]">{uploaded} / {total}</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-3">
        <div className="bg-[#7091E6] h-3 rounded-full transition-all"
          style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}
