import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";
import JSZip from "jszip";
import { saveAs } from "file-saver";


export default function NotifyPage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();
  const [showReasonPopup, setShowReasonPopup] = useState(false);

  const [shipment, setShipment] = useState(null);
  const [documents, setDocuments] = useState([]);

  const [emailInput, setEmailInput] = useState("");
  const [issueText, setIssueText] = useState("");

  const [showDocPopup, setShowDocPopup] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  const [shippingBreakup, setShippingBreakup] = useState(null);

  const loadShippingCostPreview = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${id}/shipping-cost-preview`
      );
      if (!res.ok) return;


      const data = await res.json();


      if (!data.cancelled) {
        setShippingBreakup({
          base: data.baseShipping,
          fine: data.fine,
          total: data.total,
          days: data.daysPassed
        });
      }


    } catch (err) {
      console.error("Shipping preview error", err);
    }
  };



  const loadPaymentStatus = async (id) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${id}/payment-status`
      );
      if (!res.ok) return;
  
      const data = await res.json();
      setPaymentStatus(data.paymentStatus || "Pending");
    } catch (err) {
      console.error("Error loading payment status:", err);
    }
  };

  const notifyUser = async (sender,receiver,message,info) => {
    const payload1 = {
      to: sender,
      shipmentId: shipment.id,
      message: message
    };
  
    const res1 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/email/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload1),
    });

    const payload2 = {
      to: receiver,
      shipmentId: shipment.id,
      message: message
    };
  
    const res2 = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/email/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload2),
    });
  
    if (res1.ok && res2.ok) {
      alert(info+" Notification email sent!");
    } else {
      alert("Failed to send notification email");
    }
  };

  
  // ---------------- LOAD SHIPMENT ----------------
  useEffect(() => {
    const loadData = async () => {
      const all = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shipments`);
      const allData = await all.json();
  
      const numeric = parseInt(shipmentId);
      const found = allData.find(
        (s) => parseInt(String(s.id).replace("SHP", "")) === numeric
      );
  
      setShipment(found);
  
      // 🔥 load payment status from backend
      await loadPaymentStatus(numeric);
      await loadShippingCostPreview(numeric);
  
      if (
        found?.status === "Document Approved" ||
        found?.status === "Payment Successful" ||
        found?.status === "Arrived at Customs" ||
        found?.status === "Additional Document Required"
      ) {
        loadDocuments(numeric);
      }
    };
  
    loadData();
  }, [shipmentId]);
  

  // 🔥 REALTIME SHIPMENT STATUS + LOG UPDATES
  useEffect(() => {
    const numeric = parseInt(shipmentId);
  
    const channel = supabase
      .channel("notify-shipment-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Shipment",
          filter: `s_id=eq.${numeric}`,
        },
        async () => {
          console.log("Realtime Shipment Update");
  
          const all = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shipments`);
          const allData = await all.json();
  
          const updated = allData.find(
            (s) => parseInt(String(s.id).replace("SHP", "")) === numeric
          );
  
          setShipment(updated);
  
          // 🔥 recompute payment status from logs
          await loadPaymentStatus(numeric);
  
          if (
            updated?.status === "Document Approved" ||
            updated?.status === "Payment Successful" ||
            updated?.status === "Arrived at Customs" ||
            updated?.status === "Additional Document Required"
          ) {
            loadDocuments(numeric);
          }
        }
      )
      .subscribe();
  
    return () => supabase.removeChannel(channel);
  }, [shipmentId]);
  

// 🔥 REALTIME DOCUMENT UPLOAD / DELETE
useEffect(() => {
  const numeric = parseInt(shipmentId);

  const docChannel = supabase
    .channel("notify-document-updates")
    .on(
      "postgres_changes",
      {
        event: "*", // INSERT, UPDATE, DELETE
        schema: "public",
        table: "Document",
        filter: `s_id=eq.${numeric}`,
      },
      async () => {
        console.log("Realtime Document Change");
        loadDocuments(numeric);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(docChannel);
}, [shipmentId]);


  // ---------------- LOAD DOCUMENTS ----------------
  const loadDocuments = async (id) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${id}/docapproval`
    );
    if (res.ok) setDocuments(await res.json());
  };

  const downloadDocument = async (url, filename) => {
    try {
      const response = await fetch(url, { mode: "cors" });
      const blob = await response.blob();
  
  
      const blobUrl = window.URL.createObjectURL(blob);
  
  
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      a.click();
  
  
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  };
  

  const previewDocument = (url) => window.open(url, "_blank");

  const deleteDocument = async (title) => {
    if (!window.confirm(`Delete "${title}" permanently?`)) return;

    const encoded = encodeURIComponent(title);
    const numeric = parseInt(shipmentId);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/${encoded}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      alert("Document deleted");
      loadDocuments(numeric);
    }
  };

  //download all
  const downloadAllDocuments = async (shipmentId, documents) => {
    if (!documents || documents.length === 0) {
      alert("No documents to download");
      return;
    }
  
  
    const zip = new JSZip();
    const folder = zip.folder(shipmentId);  // Folder inside the ZIP
  
  
    // Loop through each document and download its content as a blob
    for (const doc of documents) {
      const fileUrl = doc.publicUrl;
      const fileName = `${doc.title}_${shipmentId}.${getExtension(fileUrl)}`;
  
  
      const fileBlob = await fetch(fileUrl).then(res => res.blob());
      folder.file(fileName, fileBlob); // Add file to the ZIP
    }
  
  
    // Generate zip and download
    const zipBlob = await zip.generateAsync({ type: "blob" });
    saveAs(zipBlob, `${shipmentId}.zip`);
  };
  
  
  // Helper: extract file extension
  const getExtension = (url) => {
    return url.split(".").pop().split("?")[0];
  };
  

  // ---------------- SEND EMAIL ----------------
  const sendMail = async () => {
    if (!emailInput || !issueText) {
      alert("Select email & enter issue text");
      return;
    }
    const payload = {
      to: emailInput,
      issue: issueText,
      shipmentId: "SHP" + shipmentId,
    };

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/email/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Email sent!");
      setIssueText("");
    }
  };

  // ---------------- UPDATE STATUS WITH CONFIRM ----------------
  const markAdditionalDocRequired = async () => {
    if (!window.confirm("Mark shipment as 'Additional Document Required'?"))
      return;

    const numeric = parseInt(shipmentId);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/status-addition-doc`,
      { method: "PUT", headers: { "Content-Type": "application/json" } }
    );

    if (res.ok) {
      alert("Status updated: Additional Document Required");

      // Update UI status
      setShipment((prev) => ({ ...prev, status: "Additional Document Required" }));

      // ⭐ AUTO OPEN POPUP ONE TIME ⭐
      setShowDocPopup(true);
    }
  };

  const markExportApproved = async () => {
    if (!window.confirm("Approve Export Clearance?")) return;

    const numeric = parseInt(shipmentId);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/status-export`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify("Export Approved"),
      }
    );

    if (res.ok) {
      notifyUser(shipment.senderEmail,shipment.receiverEmail,"Your shipment is exported successfully!","Approve Export");
      alert("Export Approved Successfully!");
      setShipment((prev) => ({ ...prev, status: "In Transit" }));
    }
  };

  if (!shipment) return <div className="p-10 text-xl">Loading...</div>;

  // ---------------- CONDITIONS ----------------

  const status = shipment.status;

  // Request Docs button enabled ONLY when status = Additional Document Required
  const requestDocsEnabled = status === "Additional Document Required" || status === "Import Clearance";

  // Additional Document Required button enabled only on Payment Successful or Arrived at Customs
  const additionalDocRequiredEnabled =
    status === "Payment Successful" || status === "Arrived at Customs";

  // Export Approve button enabled on Payment Successful or Additional Document Required
  const exportApproveEnabled =
    status === "Payment Successful" || status === "Additional Document Required";

  const paymentStatusText = paymentStatus;
  
  const approveImportEnabled =
  status === "Arrived at Customs" || status === "Import Clearance";

  const reachedCustomsEnabled = status === "In Transit";

  const markReachedCustoms = async () => {
    if (!window.confirm("Mark shipment as 'Reached Customs'?")) return;
  
    const numeric = parseInt(shipmentId);
  
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/status-reached-customs`,
      { method: "PUT" }
    );
  
    if (res.ok) {
      notifyUser(shipment.senderEmail,shipment.receiverEmail,"Your shipment has arrived at destination customs!","Arrived at Customs");
      setShipment((prev) => ({ ...prev, status: "Arrived at Customs" }));
    }
  };
  
  const markApproveImport = async () => {
    if (!window.confirm("Approve Import Clearance?")) return;
  
    const numeric = parseInt(shipmentId);
  
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/status-approve-import`,
      { method: "PUT" }
    );
  
    if (res.ok) {
      notifyUser(shipment.senderEmail,shipment.receiverEmail,"Your shipment has cleared customs successfully!\n\nPay the duty within the next 5 days to avoid a fine. If delayed for more than 90 days, the shipment will be aborted\n\n(Duty Mode 'DDP' Sender to pay duty, Duty Mode 'DAP' Receiver to pay duty)","Approve Import");
      alert("Import Approved");
      setShipment((prev) => ({ ...prev, status: "Import Approved" }));
      navigate(`/Shipping_agency/shipment/${shipmentId}/done`);
    }
  };

    const submitReasonAndRequestDocs = async (reasonText) => {
      const numeric = parseInt(shipmentId);
    
      // 1️⃣ SAVE REASON
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/reason`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reasonText)
      });
    
      // 2️⃣ UPDATE STATUS → Additional Document Required
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/status-addition-doc`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" }
        }
      );
    
      if (res.ok) {
        alert("Additional Documents Requested — Reason Updated");
    
        // Update UI
        setShipment((prev) => ({
          ...prev,
          status: "Additional Document Required"
        }));
    
        // 3️⃣ Auto-open the document request popup
        setShowDocPopup(true);
      }
    
      setShowReasonPopup(false);
    };
    
    
    

  return (
    <div
      className="min-h-screen px-10 py-10"
      style={{
        background:
          "linear-gradient(135deg,#FFFFFF,#EDE8F5,#ADBBD4,#8697C4,#7091E6)",
      }}
    >
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10 border">
        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/Shipping_agency")}
          className="text-lg text-red-600 mb-6"
        >
          ← Back to Dashboard
        </button>

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-2">
          Status: {shipment.status}
        </h1>
        <h2 className="text-2xl text-[#3D52A0] font-semibold mb-6">
          Shipment: {shipment.id}
        </h2>

        {/* SHIPPING DETAILS */}
        <div className="grid grid-cols-2 gap-6 bg-[#EDE8F5] p-6 rounded-2xl border border-[#ADBBD4] mb-8">

          {/* LEFT SIDE – SENDER */}
          <div>
            <p className="font-bold text-xl text-[#3D52A0]">Origin</p>
            <p className="text-lg">{shipment.origin}</p>

            <p className="font-bold text-xl text-[#3D52A0] mt-4">
              Sender HS Code
            </p>
            <p className="text-lg">
              {shipment.senderHs || "Not provided"}
            </p>

            <p className="font-bold text-xl text-[#3D52A0] mt-4">
              Declared Value
            </p>
            <p>{shipment.declaredValue}</p>
          </div>

          {/* RIGHT SIDE – RECEIVER */}
          <div>
            <p className="font-bold text-xl text-[#3D52A0]">Destination</p>
            <p className="text-lg">{shipment.destination}</p>

            <p className="font-bold text-xl text-[#3D52A0] mt-4">
              Receiver HS Code
            </p>
            <p className="text-lg">
              {shipment.hs || "Not provided"}
            </p>
          </div>

        </div>

        {/* PRODUCT DETAILS */}
        <div className="bg-white border rounded-2xl p-6 shadow mb-8">
          <h3 className="text-2xl font-semibold text-[#3D52A0] mb-4">
            Product Details
          </h3>
          <p>
            <strong>Description:</strong> {shipment.description}
          </p>
          <p className="mt-2">
            <strong>Category:</strong> {shipment.category}
          </p>
          <p className="mt-2">
            <strong>Type:</strong> {shipment.type}
          </p>
        </div>

        {/* PAYMENT DETAILS */}
        <div className="p-6 bg-[#EDE8F5] rounded-2xl border mb-8">
          <h3 className="text-2xl font-semibold text-[#3D52A0] mb-4">
            Payment Details
          </h3>
          <p>
          {shippingBreakup ? (
            <div className="space-y-1">
              <p>
                <strong>Base Shipping:</strong> ₹{shippingBreakup.base}
              </p>


              {shippingBreakup.fine > 0 && (
                <p className="text-red-600">
                  <strong>Late Fine:</strong> ₹{Math.round(shippingBreakup.fine)}
                </p>
              )}


              <hr className="my-2" />


              <p className="text-lg font-semibold">
                {shippingBreakup && (
                  <p className="text-lg font-semibold">
                    Total Payable: ₹
                    {Math.round(
                      Number(shippingBreakup.base || 0) +
                      Number(shippingBreakup.fine || 0)
                    )}
                  </p>
                )}


              </p>
            </div>
          ) : (
            <p>
              <strong>Shipping Cost:</strong> {shipment.shippingcost}
            </p>
          )}


          </p>

          <p className="mt-2">
            <strong>Payment Status:</strong>{" "}
            <span
  className={
    paymentStatusText === "PAID"
      ? "text-green-600"
      : "text-red-600"
  }
>
  {paymentStatusText === "PAID" ? "Shipping Charges Paid" : "Pending"}
</span>

          </p>
        </div>

        {/* DOCUMENT VIEW */}
        {(status === "Document Approved" ||
          status === "Payment Successful" ||
          status === "Arrived at Customs" ||
          status === "Additional Document Required") && (
          <div className="p-6 bg-white border rounded-2xl shadow mb-8">
            <h3 className="text-2xl font-semibold text-[#3D52A0] mb-4">
              Documents Submitted
            </h3>


            {documents.length === 0 ? (
              <p>No documents available</p>
            ) : (
              documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center p-4 bg-[#EDE8F5] rounded-xl mb-3"
                >
                  <span>{doc.title}</span>


                  <div className="flex gap-3">
                    <button
                      onClick={() => previewDocument(doc.publicUrl)}
                      className="px-4 py-2 bg-[#7091E6] text-white rounded-lg"
                    >
                      Preview
                    </button>


                  <button
                      onClick={() => downloadDocument(doc.publicUrl, `${doc.title}_${shipment.id}`)}


                      className="px-4 py-2 bg-green-600 text-white rounded-lg"
                          >
                          Download
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.title)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
            <div className="flex justify-center mt-4">
  <button
    onClick={() => downloadAllDocuments(shipmentId, documents)}
    className={`px-6 py-2 rounded-lg text-white ${
      documents.length === 0
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#7091E6] hover:bg-[#3D52A0]"
    }`}
    disabled={documents.length === 0}
  >
    Download All
  </button>
</div>


          </div>
        )}


        {/* EMAIL + REQUEST DOC SECTION */}
        <div className="p-6 bg-white rounded-2xl border shadow mb-8">
          <h3 className="text-xl font-semibold mb-4 text-[#3D52A0]">
            Email & Additional Documents
          </h3>

          <select
            className="w-full p-4 border rounded-xl mb-4"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          >
            <option value="">Select Email</option>

            {shipment.senderEmail && (
              <option value={shipment.senderEmail}>
                Sender ({shipment.senderEmail})
              </option>
            )}

            {shipment.receiverEmail && (
              <option value={shipment.receiverEmail}>
                Receiver ({shipment.receiverEmail})
              </option>
            )}
          </select>

          <textarea
            placeholder="Enter issue"
            className="w-full p-4 border rounded-xl mb-4"
            rows={4}
            value={issueText}
            onChange={(e) => setIssueText(e.target.value)}
          />

          <button
            onClick={sendMail}
            className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
          >
            Send Email
          </button>

          {/* Request Additional Documents */}
          <button
            disabled={!requestDocsEnabled}
            className={`w-full py-3 mt-4 rounded-xl text-white ${
              requestDocsEnabled
                ? "bg-[#3D52A0] hover:bg-[#27326d]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            onClick={() => setShowDocPopup(true)}
          >
            Request Additional Documents
          </button>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex gap-4 mt-6">
          {/* Additional Document Required */}
          <button
  disabled={!additionalDocRequiredEnabled}
  onClick={() => setShowReasonPopup(true)}
  className={`px-6 py-3 rounded-xl text-white ${
    additionalDocRequiredEnabled
      ? "bg-red-500 hover:bg-red-600"
      : "bg-gray-400 cursor-not-allowed"
  }`}
>
  Additional Document Required
</button>

          {/* Export Approve */}
          <button
            disabled={!exportApproveEnabled}
            onClick={markExportApproved}
            className={`px-6 py-3 rounded-xl text-white ${
              exportApproveEnabled
                ? "bg-[#7091E6] hover:bg-[#3D52A0]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Approve Export 
          </button>

          {/* Reached Customs */}
<button
  disabled={!reachedCustomsEnabled}
  onClick={markReachedCustoms}
  className={`px-6 py-3 rounded-xl text-white ${
    reachedCustomsEnabled
      ? "bg-orange-500 hover:bg-orange-600"
      : "bg-gray-400 cursor-not-allowed"
  }`}
>
  Reached Customs
</button>

{/* Approve Import */}
<button
  disabled={!approveImportEnabled}
  onClick={markApproveImport}
  className={`px-6 py-3 rounded-xl text-white ${
    approveImportEnabled
      ? "bg-green-600 hover:bg-green-700"
      : "bg-gray-400 cursor-not-allowed"
  }`}
>
  Approve Import
</button>

        </div>
      </div>

      {showReasonPopup && (
  <ReasonPopup
    onClose={() => setShowReasonPopup(false)}
    onSubmit={submitReasonAndRequestDocs}
  />
)}

      {/* ---- POPUP COMPONENT ---- */}
      {showDocPopup && (
        <MultiDocRequestModal
          onClose={() => setShowDocPopup(false)}
          onSubmit={async (docs, requestedFor,message) => {
            const numeric = shipmentId.replace("SHP", "");

            const payload = docs.map((d) => ({
              name: d.name,
              notes: d.notes,
              requested_for: requestedFor,
            }));

            await fetch(
              `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/set-docs`,
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              }
            );
            
            const to =
            requestedFor === "Sender"
              ? shipment.senderEmail
              : shipment.receiverEmail;
      
              await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/email/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  to,
                  shipmentId: numeric,
                  message
                }),
              });

            alert("Request sent!");
            setShowDocPopup(false);
          }}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------
   MULTI-DOCUMENT REQUEST POPUP (Copied exactly from earlier version)
---------------------------------------------------------------- */

function MultiDocRequestModal({ onClose, onSubmit }) {
  const [count, setCount] = useState(1);
  const [docs, setDocs] = useState([{ name: "", notes: "" }]);
  const [requestedFor, setRequestedFor] = useState("");

  useEffect(() => {
    setDocs(Array.from({ length: count }, () => ({ name: "", notes: "" })));
  }, [count]);

  const updateDoc = (index, field, value) => {
    const updated = [...docs];
    updated[index][field] = value;
    setDocs(updated);
  };

  const handleSubmit = () => {
    if (!requestedFor) {
      alert("Choose Sender or Receiver");
      return;
    }

    if (docs.some((d) => !d.name)) {
      alert("Each document must have a name");
      return;
    }

    const message =
    "The following documents are required:\n\n" +
    docs.map((d, i) => `${i + 1}. ${d.name}`).join("\n");

    onSubmit(docs, requestedFor,message);
    
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div 
        className="
          bg-white rounded-2xl shadow-xl p-8 w-[550px]
          max-h-[85vh] overflow-y-auto
        "
      >
        <h2 className="text-2xl font-semibold text-[#3D52A0] mb-4">
          Request Additional Documents
        </h2>

        <label className="font-semibold">Number of documents</label>
        <input
          type="number"
          min="1"
          className="w-full border rounded-xl p-3 mt-2 mb-6"
          value={count}
          onChange={(e) => setCount(parseInt(e.target.value))}
        />

        {/* SCROLLABLE DOCUMENT LIST */}
        <div className="max-h-[45vh] overflow-y-auto pr-2">
          {docs.map((doc, i) => (
            <div key={i} className="border p-4 bg-gray-100 rounded-xl mb-4">
              <p className="font-semibold mb-2">Document {i + 1}</p>

              <input
                type="text"
                placeholder="Document Name"
                className="w-full border rounded-xl p-2 mb-3"
                value={doc.name}
                onChange={(e) => updateDoc(i, "name", e.target.value)}
              />

              <textarea
                placeholder="Notes (Optional)"
                className="w-full border rounded-xl p-2"
                value={doc.notes}
                onChange={(e) => updateDoc(i, "notes", e.target.value)}
              />
            </div>
          ))}
        </div>

        <label className="font-semibold">Request For *</label>
        <select
          className="w-full border rounded-xl p-3 mt-2 mb-6"
          value={requestedFor}
          onChange={(e) => setRequestedFor(e.target.value)}
        >
          <option value="">Select Who Must Provide</option>
          <option value="Sender">Sender</option>
          <option value="Receiver">Receiver</option>
        </select>

        <div className="flex justify-end gap-4 sticky bottom-0 bg-white pt-4 pb-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded-xl"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-[#7091E6] text-white rounded-xl"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>

    </div>
  );
}

function ReasonPopup({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Please enter a reason");
      return;
    }
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-[420px] rounded-2xl shadow-xl">
        <h2 className="text-2xl font-semibold text-[#3D52A0] mb-4">
          Reason for Additional Documents
        </h2>

        <textarea
          className="w-full border rounded-xl p-3 mb-4"
          rows={4}
          placeholder="Enter the reason for requesting additional documents..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-4">
          <button className="px-4 py-2 bg-gray-300 rounded-xl" onClick={onClose}>
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-[#7091E6] text-white rounded-xl"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
