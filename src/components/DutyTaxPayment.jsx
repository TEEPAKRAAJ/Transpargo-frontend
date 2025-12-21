import { useState, useEffect,useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosClient";
import jsPDF from "jspdf";




export default function DutyTaxPayment() {
  const { type, shipmentId } = useParams();
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [shipmentData, setShipmentData] = useState(null);
  const [error, setError] = useState(null);
  const [cancel, setCancel] = useState(false);
  const cancelHandledRef = useRef(false);
  const navigate = useNavigate();




  const isReceiver = type === "receiver";
  const isSender = type === "sender";




  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    document.body.appendChild(script);
  }, []);




  useEffect(() => {
    async function fetchShipment() {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/api/payment/shipment/${shipmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });




        const { shipment } = res.data;
        if (!shipment) throw new Error("Shipment not found");




        const sender = shipment.Sender?.[0] || {};
        const receiver = shipment.Receiver?.[0] || {};




        const calcRes = await api.get(`/api/payment/calculate-duty/${shipmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });


        if (calcRes.data.message?.includes("cancelled")) {
          setCancel(true);
          setError(calcRes.data.message);
          setLoading(false);
          return;
        }

        const duty = calcRes.data?.duty ?? 0;
        const gst = calcRes.data?.gst ?? 0;
        const fine=calcRes.data?.fineAmount ??0;
        const total = calcRes.data?.totalPayable ?? 0;




        setShipmentData({
          id: shipment.s_id,
          sender,
          receiver,
          dutyAmount: duty.toFixed(2),
          gstAmount: gst.toFixed(2),
          totalAmount: total.toFixed(2),
          fineAmount:fine.toFixed(2),
          amountInPaise: Math.round(total * 100),
          paidOn: new Date().toLocaleDateString(),
        });




        if (shipment.status === "Duty Payment Successful") setPaymentStatus("cleared");
      } catch {
        setError("Failed to load shipment details");
      } finally {
        setLoading(false);
      }
    }
    fetchShipment();
  }, [shipmentId]);

  if (cancel && !cancelHandledRef.current) {
    cancelHandledRef.current = true; // 🔒 lock immediately
  
    // defer side effects OUT of render stack
    Promise.resolve().then(async () => {
      alert("Shipment has been cancelled as payment was not made within 90 days.");
  
      try {
        const numeric = parseInt(shipmentId);
        await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/shipments/${numeric}/status-abort`,
          { method: "PUT" }
        );
      } catch (err) {
        console.error("Abort shipment failed", err);
      } finally {
        navigate(`/user/tracking/${type}/${shipmentId}`);
      }
    });
  
    return null;
  }
  




  // -------------------------------
  // PDF Receipt Generator
  // -------------------------------
  const downloadReceipt = () => {
    if (!shipmentData) return;




    const doc = new jsPDF();




    // Brand Header
    doc.setFillColor("#3D52A0");
    doc.rect(0, 0, 220, 45, "F");
    doc.setFontSize(20);
    doc.setTextColor("#FFFFFF");
    doc.text("Transpargo Receipt", 10, 28);




    doc.setTextColor("#000000");
    doc.setFontSize(12);
    let y = 60;




    doc.text(`📄 Receipt No: RCT-${shipmentId}`, 10, y);
    y += 10;
    doc.text(`📦 Shipment ID: ${shipmentId}`, 10, y);
    y += 10;
    doc.text(`📅 Paid On: ${shipmentData.paidOn}`, 10, y);
    y += 20;




    doc.setFontSize(14);
    doc.setTextColor("#3D52A0");
    doc.text("Sender Details", 10, y);
    y += 10;




    doc.setTextColor("#000000");
    doc.text(`Name: ${shipmentData.sender.Name}`, 10, y);
    y += 7;
    doc.text(`Email: ${shipmentData.sender.Email}`, 10, y);
    y += 20;




    doc.setFontSize(14);
    doc.setTextColor("#3D52A0");
    doc.text("Receiver Details", 10, y);
    y += 10;




    doc.setTextColor("#000000");
    doc.text(`Name: ${shipmentData.receiver.Name}`, 10, y);
    y += 7;
    doc.text(`Email: ${shipmentData.receiver.Email}`, 10, y);
    y += 20;




    doc.setFontSize(14);
    doc.setTextColor("#3D52A0");
    doc.text("Payment Summary", 10, y);
    y += 10;




    doc.setTextColor("#000000");
    doc.text(`Customs Duty: ₹${shipmentData.dutyAmount}`, 10, y);
    y += 7;
    doc.text(`GST/Tax: ₹${shipmentData.gstAmount}`, 10, y);
    y += 7;
    doc.text(`Fine Amount: ₹${shipmentData.fineAmount}`, 10, y);
    y += 7;
    doc.text(`Total Paid: ₹${shipmentData.totalAmount}`, 10, y);




    // Final note
    y += 20;
    doc.setFontSize(10);
    doc.setTextColor("#8697C4");
    doc.text("Thank you for choosing Transpargo! Your payment has been securely processed.", 10, y);




    doc.save(`Transpargo_Receipt_${shipmentId}.pdf`);
  };




  // -----------------------------------
  // Payment Handler
  // -----------------------------------
  const openRazorpayCheckout = async () => {
    if (!shipmentData) return;
    setLoading(true);
 
    try {
      // 1️⃣ Create order
      const orderRes = await api.post("/api/payment/create-order", {
        AmountInPaise: shipmentData.amountInPaise,
        ShipmentId: shipmentId,
        ReferenceNumber: `DUTY-${shipmentId}`,
      });
 
      const { orderId, keyId } = orderRes.data;
 
      if (!window.Razorpay) {
        alert("Payment SDK not loaded. Please refresh and try again.");
        setLoading(false);
        return;
      }
 
      // 2️⃣ Create Razorpay Checkout
      const rzp = new window.Razorpay({
        key: keyId,
        amount: shipmentData.amountInPaise,
        currency: "INR",
        name: "Transpargo",
        description: "Duty & Tax Payment",
        order_id: orderId,
 
        handler: async (response) => {
          try {
            // 3️⃣ Verify payment on backend
            await api.post("/api/payment/verify-duty", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ShipmentId: shipmentId,
            });
 
            // 4️⃣ Update Shipment Log (DUTY PAYMENT SUCCESS)
            try {
              const logRes = await api.put(
                `/api/payment/${shipmentId}/updatedutylog`,
                {},
                { headers: { "Content-Type": "application/json" } }
              );
 
              if (logRes.data.success) {
                console.log("Duty log updated successfully");
              }
            } catch (logErr) {
              console.error("❌ Failed to update duty log:", logErr);
            }
 
            // 5️⃣ Update UI
            setPaymentStatus("paid");
 
            setTimeout(() => setPaymentStatus("clearance"), 1200);
            setTimeout(() => setPaymentStatus("cleared"), 3000);
          } catch (e) {
            console.error("❌ Duty payment verification error:", e);
            alert("Duty payment failed. Please contact support.");
          }
        },
      });
 
      // 6️⃣ Open Razorpay UI
      rzp.open();
    } finally {
      setLoading(false);
    }
  };
 




  if (error) return <div className="text-red-500">{error}</div>;
  if (loading || !shipmentData) return <div>Loading...</div>;


  const handleNoDutyAndGoBack = async () => {
    try {
      await api.put(
        `/api/payment/${shipmentId}/updatedutylog`,
        {},
        { headers: { "Content-Type": "application/json" } }
      );
      console.log("Duty log updated (no duty required)");
    } catch (logErr) {
      console.error("❌ Failed to update duty log:", logErr);
    }
    navigate(`/user/tracking/${type}/${shipmentId}`);
  };
  
  if (shipmentData.dutyAmount == 0) {
    return (
      <div className="min-h-screen p-6" style={{
          background: "linear-gradient(to bottom right, #FFFFFF, #EDE8F5, #ADBBD4, #8697C4, #7091E6)",
        }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-100 p-6 rounded-lg">
            <p className="text-lg font-semibold">No duty or tax payment required for this shipment.</p>
          </div>
          <button
            onClick={handleNoDutyAndGoBack}
            className="w-full bg-[#8697C4] hover:bg-[#7091E6] transition text-white py-4 mt-6 rounded-lg font-semibold"
          >
            ← Back to Tracking
          </button>
        </div>
      </div>
    );
  }
  

  return (
    <div
      className="min-h-screen p-6"
      style={{
        background: "linear-gradient(to bottom right, #FFFFFF, #EDE8F5, #ADBBD4, #8697C4, #7091E6)",
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-2">Duty & Tax Payment</h1>
        <p className="text-gray-800 font-semibold">Shipment ID: {shipmentId}</p>


        {/* Status Banner */}
        {paymentStatus !== "pending" && (
          <div className="mt-4 p-4 rounded-lg bg-green-200 text-green-700 font-semibold shadow">
            {paymentStatus === "paid" && "Payment Successful. Updating Status..."}
            {paymentStatus === "clearance" && "Processing Shipment..."}
            {paymentStatus === "cleared" && "Shipment cleared successfully!"}
          </div>
        )}


        <div className="bg-white p-6 shadow-lg rounded-xl mt-6 border border-[#ADBBD4]">
          <h3 className="font-bold text-xl text-[#3D52A0] mb-4">Payment Summary</h3>




          <div className="text-lg space-y-2">
            <p><strong>Customs Duty:</strong> ₹{shipmentData.dutyAmount}</p>
            <p><strong>GST / Tax:</strong> ₹{shipmentData.gstAmount}</p>
            <p><strong>Fine Amount (Applicable if not paid within 5 days):</strong>₹{shipmentData.fineAmount}</p>
            <p className="text-xl font-bold text-[#3D52A0] mt-3">
              Total Payable: ₹{shipmentData.totalAmount}
            </p>
          </div>
        </div>




        {paymentStatus === "pending" && (
          <button
            onClick={openRazorpayCheckout}
            className="w-full bg-[#3D52A0] hover:bg-[#7091E6] transition text-white py-4 mt-6 rounded-lg font-semibold"
          >
            Pay Duty & Tax
          </button>
        )}




        {paymentStatus === "cleared" && (
          <button
            onClick={downloadReceipt}
            className="w-full bg-[#4CAF50] hover:bg-[#3d9944] transition text-white py-4 mt-6 rounded-lg font-semibold"
          >
            📄 Download Receipt
          </button>
        )}




        <button
          onClick={() => navigate(`/user/tracking/${type}/${shipmentId}`)}
          className="w-full bg-[#8697C4] hover:bg-[#7091E6] transition text-white py-4 mt-6 rounded-lg font-semibold"
        >
          ← Back to Tracking
        </button>
      </div>
    </div>
  );
}
