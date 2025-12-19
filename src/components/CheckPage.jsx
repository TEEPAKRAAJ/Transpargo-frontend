// ✅ FINAL CLEAN VERSION – NO REQUEST DOCS, EMAIL FIXED

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";


export default function CheckPage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [submittedDocs, setSubmittedDocs] = useState([]);

  const [emailInput, setEmailInput] = useState("");
  const [issueText, setIssueText] = useState("");

  // ---------------- LOAD SHIPMENT ----------------
  useEffect(() => {
    const load = async () => {
      const res = await fetch("http://localhost:5000/api/shipments");
      const data = await res.json();

      const numeric = parseInt(shipmentId);
      const found = data.find(
        (s) => parseInt(String(s.id).replace("SHP", "")) === numeric
      );

      setShipment(found);

      if (
        found?.hsApproved ||
        found?.status === "Document Uploaded" ||
        found?.status === "Document Approved"
      ) {
        loadSubmittedDocuments(numeric);
      }
    };

    load();
  }, [shipmentId]);

  // 🔥 LISTEN FOR SHIPMENT STATUS + LOG CHANGES IN REALTIME
useEffect(() => {
  const numeric = parseInt(shipmentId);

  const channel = supabase
    .channel("shipment-checkpage-updates")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "Shipment",
        filter: `s_id=eq.${numeric}`,
      },
      async (payload) => {
        console.log("Realtime Shipment Update:", payload);

        // Reload shipment details
        const res = await fetch("http://localhost:5000/api/shipments");
        const data = await res.json();

        const updated = data.find(
          (s) => parseInt(String(s.id).replace("SHP", "")) === numeric
        );

        setShipment(updated);

        // Reload docs if applicable
        if (
          updated?.status === "Document Uploaded" ||
          updated?.status === "Document Approved" ||
          updated?.hsApproved
        ) {
          loadSubmittedDocuments(numeric);
        }
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}, [shipmentId]);

// 🔥 LISTEN FOR DOCUMENT UPLOADS OR DELETIONS
useEffect(() => {
  const numeric = parseInt(shipmentId);

  const docChannel = supabase
    .channel("document-checkpage-updates")
    .on(
      "postgres_changes",
      {
        event: "*", // INSERT + DELETE + UPDATE
        schema: "public",
        table: "Document",
        filter: `s_id=eq.${numeric}`,
      },
      async (payload) => {
        console.log("Realtime Document Change:", payload);
        loadSubmittedDocuments(numeric); // refresh document list
      }
    )
    .subscribe();

  return () => supabase.removeChannel(docChannel);
}, [shipmentId]);


  // ---------------- LOAD DOCS ----------------
  const loadSubmittedDocuments = async (id) => {
    const res = await fetch(
      `http://localhost:5000/api/shipments/${id}/docapproval`
    );

    if (res.ok) {
      const docs = await res.json();
      setSubmittedDocs(docs);
    }
  };

  const previewDocument = (url) => window.open(url, "_blank");

  const deleteDocument = async (title) => {
    const encoded = encodeURIComponent(title);
    const numeric = parseInt(shipmentId);

    const res = await fetch(
      `http://localhost:5000/api/shipments/${numeric}/${encoded}`,
      { method: "DELETE" }
    );

    if (res.ok) {
      alert("Deleted");
      loadSubmittedDocuments(numeric);
    }
  };

  // ---------------- APPROVE DOCUMENT ----------------
  const approveDocument = async () => {
    const numeric = parseInt(shipmentId);
  
    const res = await fetch(
      `http://localhost:5000/api/shipments/${numeric}/updatedoclog`,
      { method: "PUT" }
    );
  
    if (res.ok) {
      alert("Document Approved");
  
      // Update UI
      setShipment((prev) => ({ ...prev, status: "Document Approved" }));
  
      // ⭐ Navigate to Notify page
      navigate(`/Shipping_agency/shipment/${shipmentId}/notify`);
    }
  };
  

  // ---------------- SEND EMAIL ----------------
  const sendMail = async () => {
    if (!emailInput || !issueText) {
      alert("Select email & enter issue");
      return;
    }

    const numeric = parseInt(shipmentId);

    // Save issue
    await fetch(`http://localhost:5000/api/shipments/${numeric}/reason`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(issueText),
    });

    const payload = {
      to: emailInput,
      issue: issueText,
      shipmentId: "SHP" + shipmentId,
    };

    const res = await fetch("http://localhost:5000/api/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Email sent!");
      setIssueText("");
    }
  };

  if (!shipment) return <div className="p-10 text-xl">Loading...</div>;

  // ---------------- CONDITIONS ----------------

 // ---------------- CONDITIONS ----------------

// Read all sender logs
const senderLog = shipment.sender_log || [];

// SHOW button if ANY log has title = "Document Upload"
const showDocumentApprovedButton = senderLog.some(
  (log) => log.title === "Document Upload"
);

// ENABLE/DISABLE BUTTON BASED ON STATUS
let documentApproveDisabled = true;

if (shipment.status === "HS Approved") {
  documentApproveDisabled = true; // visible, disabled
} else if (shipment.status === "Document Uploaded") {
  documentApproveDisabled = false; // enabled
} else {
  documentApproveDisabled = true; // for all other statuses
}



  const showEmail =
    ["HS Approved", "Document Uploaded", "Document Approved"].includes(
      shipment.status
    );

  return (
    <div
      className="min-h-screen px-10 py-10"
      style={{
        background:
          "linear-gradient(135deg,#FFFFFF,#EDE8F5,#ADBBD4,#8697C4,#7091E6)",
      }}
    >
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10 border">

        {/* BACK */}
        <button
          onClick={() => navigate("/Shipping_agency")}
          className="text-lg text-red-600 mb-6"
        >
          ← Back to Dashboard
        </button>

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-[#3D52A0]">
          Status: {shipment.status}
        </h1>
        <h2 className="text-xl font-semibold text-[#3D52A0] mb-6">
          Shipment: {shipment.id}
        </h2>

        {/* SUMMARY */}
        <div className="grid grid-cols-2 gap-6 bg-[#EDE8F5] p-6 rounded-2xl border">
          <div>
            <p className="font-bold text-xl">Origin</p>
            <p>{shipment.origin}</p>

            <p className="font-bold text-xl mt-4">Declared Value</p>
            <p>{shipment.declaredValue}</p>
          </div>

          <div>
            <p className="font-bold text-xl">Destination</p>
            <p>{shipment.destination}</p>

            <p className="font-bold text-xl mt-4">HS Code</p>
            <p>{shipment.hs}</p>
          </div>
        </div>

        {/* PRODUCT */}
        <div className="bg-white border rounded-2xl p-6 shadow mt-6">
          <h3 className="text-2xl font-semibold text-[#3D52A0]">Product Info</h3>
          <p><strong>Description:</strong> {shipment.description}</p>
          <p><strong>Category:</strong> {shipment.category}</p>
          <p><strong>Type:</strong> {shipment.type}</p>
        </div>

        {/* DOCUMENTS */}
        {(shipment.hsApproved ||
          ["Document Uploaded", "Document Approved"].includes(
            shipment.status
          )) && (
          <div className="mt-6 p-6 bg-white border rounded-2xl shadow">
            <h3 className="text-2xl font-semibold text-[#3D52A0] mb-4">
              Documents Submitted
            </h3>

            {submittedDocs.length === 0 ? (
              <p>No documents uploaded yet</p>
            ) : (
              submittedDocs.map((doc, i) => (
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
                      onClick={() => deleteDocument(doc.title)}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* DOCUMENT APPROVE BUTTON */}
        {showDocumentApprovedButton && (
  <div className="flex justify-center mt-6">
    <button
      onClick={approveDocument}
      disabled={documentApproveDisabled}
      className={`px-6 py-3 rounded-lg text-white ${
        documentApproveDisabled
          ? "bg-gray-300 cursor-not-allowed"
          : "bg-[#7091E6] hover:bg-[#3D52A0]"
      }`}
    >
      Approve Documents
    </button>
  </div>
)}

        {/* EMAIL AREA */}
        {showEmail && (
          <div className="mt-10 p-6 bg-white rounded-2xl border shadow">

            {/* Email dropdown with exact emails like old dashboard */}
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
          </div>
        )}
      </div>
    </div>
  );
}
