/* ---------------------------------------------------------
   DESTRUCTION PAGE — CLEAN VERSION (MATCHES RETURNS PAGE)
--------------------------------------------------------- */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function DestructionPage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [formData, setFormData] = useState({});
  const [formHidden, setFormHidden] = useState(false);

  const notifyUser = async (sender,message,info) => {
    const payload = {
      to: sender,
      shipmentId: shipment.id,
      message: message
    };
  
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/email/notify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  
    if (res.ok ) {
      alert(info+" Notification email sent!");
    } else {
      alert("Failed to send notification email");
    }
  };

  // ---------------- LOAD SHIPMENT ----------------
  useEffect(() => {
    async function loadData() {
      const all = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shipments`);
      const json = await all.json();

      const numeric = parseInt(shipmentId);
      const found = json.find(
        (s) => parseInt(String(s.id).replace("SHP", "")) === numeric
      );

      setShipment(found);
    }

    loadData();
  }, [shipmentId]);

  // ---------------- REALTIME LISTENER ----------------
  useEffect(() => {
    const numeric = parseInt(shipmentId);

    const channel = supabase
      .channel("destruction-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Shipment",
          filter: `s_id=eq.${numeric}`,
        },
        async () => {
          const all = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shipments`);
          const json = await all.json();

          const updated = json.find(
            (s) => parseInt(String(s.id).replace("SHP", "")) === numeric
          );

          setShipment(updated);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [shipmentId]);
console.log(shipment)
  // ---------------- FORM HANDLER ----------------
  const updateField = (key, value) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  // ---------------- INITIATE PAYMENT ----------------
  const initiatePayment = async () => {
    const numeric = parseInt(shipmentId);

    const payload = { name: "Destruction", ...formData };

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/initiate-payment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      notifyUser(shipment.senderEmail,"Please pay the destruction fee to proceed","Payment")
      alert("Error saving charges");
      return;
    }

    // Hide the form after logging payment details
    setFormHidden(true);
  };

  // ---------------- MARK DESTROYED ----------------
  const destroyShipment = async () => {
    if (!window.confirm("Confirm marking shipment as Destroyed?")) return;

    const numeric = parseInt(shipmentId);

    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/status-destroyed`,
      { method: "PUT" }
    );

    if (res.ok) {
      notifyUser(shipment.senderEmail,"Your shipment is destroyed successfully!","Destroy")
      alert("Shipment marked as Destroyed");
    }
  };

  if (!shipment) return <div className="p-10 text-xl">Loading...</div>;

  const isPaid = shipment.status === "Charges Paid";

  // ---------------- DESTRUCTION FIELDS ----------------
  const destructionFields = (
    <>
      <FormInput label="Destruction Fee" keyName="Destruction Fee" formData={formData} updateField={updateField} />
      <FormInput label="Customs Supervision Fee" keyName="Customs Supervision Fee" formData={formData} updateField={updateField} />
      <FormInput label="Environmental or Hazard Fee" keyName="Environmental or Hazard Fee" formData={formData} updateField={updateField} />
      <FormInput label="Local Handling Charges" keyName="Local Handling Charges" formData={formData} updateField={updateField} />
      <FormInput label="Storage or Warehousing Charges" keyName="Storage or Warehousing Charges" formData={formData} updateField={updateField} />
      <FormInput label="Destruction Documentation Fee" keyName="Destruction Documentation Fee" formData={formData} updateField={updateField} />
      <FormInput label="Demurrage or Detention" keyName="Demurrage or Detention" formData={formData} updateField={updateField} />
    </>
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
        <button onClick={() => navigate("/Shipping_agency")} className="text-lg text-red-600 mb-6">
          ← Back to Dashboard
        </button>

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-2">
          Status: {shipment.status}
        </h1>
        <h2 className="text-2xl font-semibold text-[#3D52A0] mb-6">
          Shipment: {shipment.id}
        </h2>

        {/* SHIPMENT DETAILS */}
        <ShipmentInfoCard shipment={shipment} />

        {/* PRODUCT DETAILS */}
        <ProductDetails shipment={shipment} />

        {/* PAYMENT STATUS */}
        <PaymentStatusCard shipment={shipment} />

        {/* FORM — ONLY WHEN STATUS IS DESTRUCTION REQUEST */}
        {!formHidden && shipment.status === "Destruction Request" && (
          <>
            <div className="p-6 bg-[#EDE8F5] rounded-2xl border mb-8">
              <h3 className="text-2xl font-semibold text-[#3D52A0] mb-6">
                Destruction Charges Form
              </h3>

              <div className="grid grid-cols-2 gap-6">{destructionFields}</div>
            </div>

            <div className="flex justify-center mb-4">
              <button
                onClick={initiatePayment}
                className="px-8 py-4 rounded-2xl text-xl text-white bg-blue-600 hover:bg-blue-700"
              >
                Initiate Payment
              </button>
            </div>
          </>
        )}

        {/* DESTROY BUTTON */}
        <div className="flex justify-center mt-6">
          <button
            onClick={destroyShipment}
            disabled={!isPaid}
            className={`px-8 py-4 rounded-2xl text-xl text-white 
              ${
                isPaid
                  ? "bg-black hover:bg-gray-800"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
          >
            Destroy Shipment
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------- INPUT COMPONENT ---------------------- */
function FormInput({ label, keyName, formData, updateField }) {
  return (
    <div>
      <label className="font-semibold">{label}</label>
      <input
        type="number"
        className="w-full mt-2 p-3 border rounded-lg"
        value={formData[keyName] || ""}
        onChange={(e) => updateField(keyName, e.target.value)}
      />
    </div>
  );
}

/* ---------------------- SHIPMENT DETAILS CARD ---------------------- */
function ShipmentInfoCard({ shipment }) {
  return (
    
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
  );
}

/* ---------------------- PRODUCT DETAILS CARD ---------------------- */
function ProductDetails({ shipment }) {
  return (
    <div className="bg-white p-6 rounded-2xl border mb-8">
      <h3 className="text-2xl font-bold text-[#3D52A0] mb-4">Product Details</h3>

      <p><strong>Description:</strong> {shipment.description}</p>
      <p><strong>Category:</strong> {shipment.category}</p>
      <p><strong>Type:</strong> {shipment.type}</p>
    </div>
  );
}

/* ---------------------- PAYMENT STATUS CARD ---------------------- */
function PaymentStatusCard({ shipment }) {
  const paid = shipment.status === "Charges Paid" || shipment.status === "Destroyed";

  return (
    <div className="bg-[#EDE8F5] p-6 rounded-2xl border mb-8">
      <h3 className="text-2xl font-bold text-[#3D52A0] mb-4">Payment Status</h3>

      <p className="mt-2">
        <strong>Status: </strong>
        <span className={paid ? "text-green-600" : "text-orange-500"}>
          {paid ? "Destruction Charges Paid" : "Pending Payment"}
        </span>
      </p>
    </div>
  );
}
