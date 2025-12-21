import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ApprovePage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [showHsPopup, setShowHsPopup] = useState(false);
  const [newHs, setNewHs] = useState("");
  const [newHsSender, setNewHsSender] = useState("");

  // ---------------- FETCH SHIPMENT DETAILS ----------------
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shipments`);
      const data = await res.json();
  
      // Convert shipmentId to number
      const numeric = parseInt(shipmentId);
  
      // Find matching record
      const found = data.find(
        (s) => parseInt(String(s.id).replace("SHP", "")) === numeric
      );
  
      setShipment(found);
      setNewHs(found.hs || "Not Found");
      setNewHsSender(found.senderHs || "Not Found");
    };
  
    load();
  }, [shipmentId]);

  if (!shipment) return <div className="p-10 text-xl">Loading...</div>;
  console.log(shipment);

  // ---------------- APPROVE HS CODE ----------------
  const approveHsCode = async () => {
    if (!window.confirm("Are you sure you want to approve the HS code?")) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${shipmentId}/hs-approve`,
        { method: "PUT", headers: { "Content-Type": "application/json" } }
      );
      notifyUser();
      navigate(`/Shipping_agency/shipment/${shipmentId}/check`);
    } catch {
      alert("HS Code approval failed");
    }
  };

  // ---------------- CHANGE HS CODE ----------------
  const changeHsCode = async () => {
    if (!newHs.trim()) {
      alert("Enter valid HS Code");
      return;
    }

    if (!window.confirm("Confirm HS Code change and approve?")) return;

    try {
      await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${shipmentId}/change-hscode`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hs: newHs, 
            senderHs: newHsSender,
          }),
        }
      );
      notifyUser();
      setShowHsPopup(false);
      navigate(`/Shipping_agency/shipment/${shipmentId}/check`);
    } catch {
      alert("Failed to update HS code");
    }
  };
  const notifyUser = async () => {
    const payload = {
      to: shipment.senderEmail,
      shipmentId: shipment.id,
      message: "Your HS Code has been approved by the shipment agent. Please Upload documents."
    };
  
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/email/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  
    if (res.ok) {
      alert("HS Approve Notification email sent!");
    } else {
      alert("Failed to send notification email");
    }
  };
  
  return (
    <div
      className="min-h-screen px-10 py-10"
      style={{
        background: "linear-gradient(135deg,#FFFFFF,#EDE8F5,#ADBBD4,#8697C4,#7091E6)",
      }}
    >

      {/* ---- CHANGE HS POPUP ---- */}
      {showHsPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl w-[400px]">
            <h2 className="text-xl font-semibold mb-4">Enter New HS Code</h2>

            <input
              className="w-full border rounded-xl p-3 mb-4"
              placeholder="New HS Code"
              value={newHs}
              onChange={(e) => setNewHs(e.target.value)}
            />

            <input
              className="w-full border rounded-xl p-3 mb-4"
              placeholder="New Sender HS Code"
              value={newHsSender}
              onChange={(e) => setNewHsSender(e.target.value)}
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowHsPopup(false)}
                className="px-4 py-2 rounded-xl bg-gray-300"
              >
                Cancel
              </button>

              <button
                onClick={changeHsCode}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white"
              >
                Save & Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------ MAIN CARD ------------------ */}
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl p-10 border border-[#ADBBD4]">

        {/* BACK BUTTON */}
        <button
          onClick={() => navigate("/Shipping_agency")}
          className="text-lg text-red-600 mb-6"
        >
          ← Back to Dashboard
        </button>

        {/* STATUS */}
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-2">
          Status: {shipment.status}
        </h1>

        <h2 className="text-2xl font-semibold text-[#3D52A0] mb-8">
          Shipment: SHP{shipmentId}
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
            Product Information
          </h3>

          <p><strong>Description:</strong> {shipment.description}</p>
          <p className="mt-2"><strong>Category:</strong> {shipment.category}</p>
          <p className="mt-2"><strong>Type:</strong> {shipment.type}</p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="text-center mt-10 space-y-6">

          {/* APPROVE HS BUTTON */}
          <button
            onClick={approveHsCode}
            className="w-full py-4 bg-[#7091E6] rounded-xl text-xl text-white hover:bg-[#3D52A0]"
          >
            Approve HS Code
          </button>

          {/* CHANGE HS BUTTON */}
          <button
            onClick={() => setShowHsPopup(true)}
            className="w-full py-4 bg-orange-500 rounded-xl text-xl text-white hover:bg-orange-600"
          >
            Change HS Code
          </button>

        </div>
      </div>
    </div>
  );
}
