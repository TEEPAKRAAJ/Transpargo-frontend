import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosClient";
import jsPDF from "jspdf";

export default function ChargesPayment() {
  const { type,shipmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [paymentLog, setPaymentLog] = useState(null);
  const [shipmentStatus, setShipmentStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [totalAmount, setTotalAmount] = useState(0);

  // ----------------------------------------------------------
  // Load Razorpay Script
  // ----------------------------------------------------------
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);

  // ----------------------------------------------------------
  // Fetch payment_log
  // ----------------------------------------------------------
  useEffect(() => {
    async function loadPaymentLog() {
      try {
        const res = await api.get(`/api/payment/${shipmentId}/log`);

        
        if (res.data?.payment_log) {
          const log = res.data.payment_log;
          console.log(log);
          setPaymentLog(log);

          const values = Object.entries(log)
            .filter(([key]) => key !== "name")
            .map(([_, val]) => Number(val) || 0);

          const sum = values.reduce((a, b) => a + b, 0);
          setTotalAmount(sum);
        }

        // Also load status
        const shipmentRes = await api.get(`/api/payment/shipment/${shipmentId}`);
        const shipment = shipmentRes.data?.shipment;

        setShipmentStatus(shipment?.status || "");

        if (shipment?.status === "Charges Paid") {
          setPaymentStatus("cleared");
        }

      } catch (err) {
        console.error("Error loading payment log:", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadPaymentLog();
  }, [shipmentId]);

  if (loading) return <div>Loading...</div>;
  if (!paymentLog) return <div>No payment details found.</div>;

  const chargesType = paymentLog.name || "Charges";

  // ----------------------------------------------------------
  // Razorpay Payment
  // ----------------------------------------------------------
  const openRazorpayCheckout = async () => {
    setLoading(true);

    try {
      const orderRes = await api.post("/api/payment/create-order", {
        AmountInPaise: Math.round(totalAmount * 100),
        ShipmentId: shipmentId,
        ReferenceNumber: `${chargesType}-${shipmentId}`,
      });

      const { orderId, keyId } = orderRes.data;

      const rzp = new window.Razorpay({
        key: keyId,
        amount: totalAmount * 100,
        currency: "INR",
        name: "Transpargo",
        description: `${chargesType} Payment`,
        order_id: orderId,

        handler: async (response) => {
          try {
            await api.post("/api/payment/verify-duty", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ShipmentId: shipmentId,
            });

            // UPDATE STATUS TO "Charges Paid"
            await api.put(`/api/payment/${shipmentId}/charges-paid`);


            setPaymentStatus("cleared");
          } catch (e) {
            alert("Payment verification failed.");
          }
        }
      });

      rzp.open();

    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------------------------
  // PDF Receipt Generator
  // ----------------------------------------------------------
  const downloadReceipt = () => {
    const doc = new jsPDF();

    doc.setFillColor("#3D52A0");
    doc.rect(0, 0, 220, 40, "F");
    doc.setFontSize(20);
    doc.setTextColor("#FFFFFF");
    doc.text("Transpargo Receipt", 10, 25);

    doc.setFontSize(12);
    doc.setTextColor("#000000");

    let y = 60;
    doc.text(`Shipment ID: ${shipmentId}`, 10, y);
    y += 10;
    doc.text(`Payment Type: ${chargesType}`, 10, y);
    y += 10;

    doc.setFontSize(14);
    doc.text("Charges", 10, y);
    y += 10;

    Object.entries(paymentLog)
      .filter(([key]) => key !== "name")
      .forEach(([key, value]) => {
        doc.text(`${key}: ₹${value}`, 10, y);
        y += 8;
      });

    y += 10;
    doc.text(`Total Paid: ₹${totalAmount}`, 10, y);

    doc.save(`Transpargo_${chargesType}_Receipt_${shipmentId}.pdf`);
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background:
          "linear-gradient(to bottom right, #FFFFFF, #EDE8F5, #ADBBD4, #8697C4, #7091E6)"
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-2">
          {chargesType} Payment
        </h1>

        <div className="bg-white p-6 rounded-xl shadow-lg border mt-6">
          <h3 className="font-bold text-xl text-[#3D52A0] mb-4">Charges Summary</h3>

          {Object.entries(paymentLog)
            .filter(([key]) => key !== "name")
            .map(([key, value]) => (
              <p key={key} className="text-lg">
                <strong>{key}:</strong> ₹{value}
              </p>
            ))}

          <p className="text-2xl font-bold mt-4 text-[#3D52A0]">
            Total Payable: ₹{totalAmount}
          </p>
        </div>

        {paymentStatus === "pending" && (
          <button
            onClick={openRazorpayCheckout}
            className="w-full bg-[#3D52A0] hover:bg-[#7091E6] text-white py-4 mt-6 rounded-lg font-semibold"
          >
            Pay Now
          </button>
        )}

        {paymentStatus === "cleared" && (
          <button
            onClick={downloadReceipt}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 mt-6 rounded-lg font-semibold"
          >
            📄 Download Receipt
          </button>
        )}

        <button
          onClick={() => navigate(`/user/tracking/${type}/${shipmentId}`)}
          className="w-full bg-[#8697C4] hover:bg-[#7091E6] text-white py-4 mt-6 rounded-lg font-semibold"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}
