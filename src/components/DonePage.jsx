import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../api/supabaseClient";

export default function DonePage() {
  const { shipmentId } = useParams();
  const navigate = useNavigate();

  const [shipment, setShipment] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("Pending");

  const [emailInput, setEmailInput] = useState("");
  const [issueText, setIssueText] = useState("");

  // ---------------- LOAD PAYMENT STATUS ----------------
  const loadPaymentStatus = async (id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/shipments/${id}/duty-payment-status`
      );
      if (!res.ok) return;
  
      const data = await res.json();
      console.log(data.paymentStatus)
      setPaymentStatus(data.paymentStatus || "Pending");
    } catch (err) {
      console.error("Payment Status Load Error:", err);
    }
  };

  const notifyUser = async (sender,receiver,message,info) => {
    const payload1 = {
      to: sender,
      shipmentId: shipment.id,
      message: message
    };
  
    const res1 = await fetch("http://localhost:5000/api/email/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload1),
    });

    const payload2 = {
      to: receiver,
      shipmentId: shipment.id,
      message: message
    };
  
    const res2 = await fetch("http://localhost:5000/api/email/notify", {
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
  

  // ---------------- LOAD SHIPMENT DATA ----------------
  useEffect(() => {
    const loadData = async () => {
      const all = await fetch("http://localhost:5000/api/shipments");
      const json = await all.json();

      const numeric = parseInt(shipmentId);
      const found = json.find(
        (s) => parseInt(String(s.id).replace("SHP", "")) === numeric
      );

      setShipment(found);
      await loadPaymentStatus(numeric);
    };

    loadData();
  }, [shipmentId]);

  // ---------------- REALTIME SHIPMENT UPDATES ----------------
  useEffect(() => {
    const numeric = parseInt(shipmentId);

    const channel = supabase
      .channel("done-shipment-updates")
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

          const all = await fetch("http://localhost:5000/api/shipments");
          const json = await all.json();

          const updated = json.find(
            (s) => parseInt(String(s.id).replace("SHP", "")) === numeric
          );

          setShipment(updated);
          await loadPaymentStatus(numeric);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [shipmentId]);

  // ---------------- SEND EMAIL ----------------
  const sendMail = async () => {
    if (!emailInput || !issueText) {
      alert("Select email & enter message");
      return;
    }

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
      alert("Email Sent");
      setIssueText("");
    }
  };

  // ---------------- MARK AS DELIVERED ----------------
  const markDelivered = async () => {
    if (!window.confirm("Confirm: Mark shipment as Delivered?")) return;

    const numeric = parseInt(shipmentId);

    const res = await fetch(
      `http://localhost:5000/api/shipments/${numeric}/status-delivered`,
      { method: "PUT" }
    );

    if (res.ok) {
      notifyUser(shipment.senderEmail,shipment.receiverEmail,"Your shipment has been delivered successfully!","Delivered");
      alert("Shipment marked as Delivered");
      setShipment((prev) => ({ ...prev, status: "Delivered" }));
    }
  };

  if (!shipment) return <div className="p-10 text-xl">Loading...</div>;

  const status = shipment.status;

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
          Status: {status}
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

        {/* PAYMENT DETAILS (HIDE IF ABORTED) */}
{status !== "Aborted" && (
  <div className="p-6 bg-[#EDE8F5] rounded-2xl border mb-8">
    <h3 className="text-2xl font-semibold text-[#3D52A0] mb-4">
      Payment Details
    </h3>
    <p>
      <strong>Shipping Cost:</strong> {shipment.shippingcost}
    </p>
    <p className="mt-2">
      <strong>Payment Status:</strong>{" "}
      <span
        className={
          paymentStatus === "PAID" ? "text-green-600" : "text-red-600"
        }
      >
        {paymentStatus === "PAID"
          ? "(Shipping Charges + Import Duty) Paid"
          : "Pending"}
      </span>
    </p>
  </div>
)}


        {/* EMAIL SECTION */}
        <div className="p-6 bg-white rounded-2xl border shadow mb-8">
          <h3 className="text-xl font-semibold mb-4 text-[#3D52A0]">
            Email Notification
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
            placeholder="Enter message"
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

        {/* NEW Delivered Button */}
        <div className="flex justify-center mt-6">
  <button
    onClick={markDelivered}
    disabled={status !== "Duty Payment Successful"}
    className={`px-8 py-4 rounded-2xl text-xl text-white 
      ${
        status === "Duty Payment Successful"
          ? "bg-green-600 hover:bg-green-700"
          : "bg-gray-400 cursor-not-allowed"
      }`}
  >
    Mark as Delivered
  </button>
</div>

      </div>
    </div>
  );
}
