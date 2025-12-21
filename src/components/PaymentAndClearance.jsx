import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosClient";
import jsPDF from "jspdf";


export default function ShippingCostPayment() {
  const { type, shipmentId } = useParams();
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [shipmentData, setShipmentData] = useState(null);
  const [error, setError] = useState(null);
  const [cancel,setCancel] = useState(false);
  const cancelHandledRef = useRef(false);
  const navigate = useNavigate();




  // ---- Load Razorpay once ----
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);




  // ---- Fetch Shipment + Calculate Shipping with Fine ----
  useEffect(() => {
    async function fetchShipment() {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/api/payment/shipment/${shipmentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        

        const { shipment } = res.data;
        //console.log("Fetched shipment:", shipment);


        if (!shipment) throw new Error("Shipment not found");


        const sender = shipment.sender || {};
        const receiver = shipment.receiver || {};
        const product = shipment.Product?.[0] || {};

        console.log(sender);
        console.log(receiver);

        


        // Calculate shipping + fine
        const calcRes = await api.get(`/api/payment/calculate/${shipmentId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });


        //console.log("Calculation API RESPONSE →", calcRes.data);


        // Check if shipment was cancelled due to > 90 days
        if (calcRes.data.message?.includes("cancelled")) {
          setCancel(true);
          setError(calcRes.data.message);
          setLoading(false);
          return;
        }


        const shipping = Number(calcRes?.data?.shipping || 0);
        const fine = Number(calcRes?.data?.fine || 0);
        const days = Number(calcRes?.data?.days || 0);


        setShipmentData({
          id: shipment.s_id,
          createdAt: shipment.created_at,
          status: shipment.status,
          dutyMode: shipment.duty_mode,


          sender: {
            name: sender.name || "N/A",
            email: sender.email || "N/A",
            phone: sender.phone || "N/A",
            address: `${sender.address || ""}, ${sender.city || ""}, ${
              sender.state || ""
            }, ${sender.Postal || sender.postal || ""}, ${
              sender.country || ""
            }`,
          },


          receiver: {
            name: receiver.name || "N/A",
            email: receiver.email || "N/A",
            phone: receiver.phone || "N/A",
            address: `${receiver.address || ""}, ${receiver.city || ""}, ${
              receiver.state || ""
            }, ${receiver.Postal || receiver.postal || ""}, ${
              receiver.country || ""
            }`,
          },


          product: {
            type: product.type || "Unknown",
            value: product.value || 0,
          },


          // Shipping cost breakdown
          shippingCost: shipping.toFixed(2),
          fine: fine.toFixed(2),
          daysPassed: days,
         
          totalAmount: shipping.toFixed(2),
          amountInPaise: Math.round(shipping * 100),
        });
        console.log(shipmentData);

        if (shipment.status === "Payment Successful") {
          setPaymentStatus("paid");
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load shipment details");
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
  



  // ---- Razorpay Payment ----
  const openRazorpayCheckout = async () => {
    if (!shipmentData) return;
    setLoading(true);


    try {
      const orderRes = await api.post("/api/payment/create-order", {
        AmountInPaise: shipmentData.amountInPaise,
        ShipmentId: shipmentId,
      });


      const { orderId, keyId } = orderRes.data;
      console.log("Order created:", orderId);
      console.log("Using Key ID:", keyId);


      if (!window.Razorpay) {
        alert("Payment SDK not loaded. Please refresh and try again.");
        setLoading(false);
        return;
      }


      const rzp = new window.Razorpay({
        key: keyId,
        amount: shipmentData.amountInPaise,
        currency: "INR",
        name: "Transpargo",
        description: "Shipping Payment",
        order_id: orderId,


        handler: async (response) => {
          try {
            await api.post("/api/payment/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ShipmentId: shipmentId,
            });


            setPaymentStatus("paid");


            try {
              const logResponse = await api.put(
                `/api/payment/${shipmentId}/updatepaymentlog`,
                {},
                { headers: { "Content-Type": "application/json" } }
              );


              if (logResponse.data.success) {
                console.log("Payment log updated");
              }
            } catch (logError) {
              console.error("Failed to update log:", logError);
            }


            setTimeout(() => setPaymentStatus("clearance"), 2500);
            setTimeout(() => setPaymentStatus("cleared"), 5000);
          } catch (e) {
            console.error("Payment verification error:", e);
            alert("Payment verification failed. Please contact support.");
          }
        },
      });


      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Payment could not be created");
    } finally {
      setLoading(false);
    }
  };




  // ---- Receipt PDF ----
  const downloadReceipt = () => {
    if (!shipmentData) return;


    const doc = new jsPDF({ unit: "pt", format: "a4" });


    const margin = 40;
    let y = margin;


    // HEADER
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("TRANSPARGO - SHIPPING PAYMENT RECEIPT", margin, y);
    y += 30;


    doc.setLineWidth(1);
    doc.line(margin, y, 555, y);
    y += 25;


    // DETAILS BLOCK
    doc.setFontSize(12);
    doc.setFont("Helvetica", "normal");
    doc.text(`Invoice No: PAY-${shipmentId}`, margin, y);
    y += 18;
    doc.text(`Shipment ID: ${shipmentId}`, margin, y);
    y += 18;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, y);
    y += 25;


    // SENDER
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("SENDER INFORMATION", margin, y);
    y += 12;


    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${shipmentData.sender?.name}`, margin, y);
    y += 16;
    doc.text(`Email: ${shipmentData.sender?.email}`, margin, y);
    y += 16;
    doc.text(`Phone: ${shipmentData.sender?.phone}`, margin, y);
    y += 22;


    doc.setLineWidth(0.6);
    doc.line(margin, y, 555, y);
    y += 20;


    // RECEIVER
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("RECEIVER INFORMATION", margin, y);
    y += 12;


    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${shipmentData.receiver?.name}`, margin, y);
    y += 16;
    doc.text(`Email: ${shipmentData.receiver?.email}`, margin, y);
    y += 16;
    doc.text(`Phone: ${shipmentData.receiver?.phone}`, margin, y);
    y += 22;


    doc.setLineWidth(0.6);
    doc.line(margin, y, 555, y);
    y += 20;


    // PAYMENT SUMMARY
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PAYMENT SUMMARY", margin, y);
    y += 16;


    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
   
    // Show shipping cost breakdown
    const baseShipping = Number(shipmentData.shippingCost) - Number(shipmentData.fine);
    doc.text(`Base Shipping Cost: ₹ ${baseShipping.toFixed(2)}`, margin, y);
    y += 16;


    if (Number(shipmentData.fine) > 0) {
      doc.text(
        `Late Payment Fine (${shipmentData.daysPassed} days): ₹ ${shipmentData.fine}`,
        margin,
        y
      );
      y += 16;
    }


    y += 8;


    // TOTAL
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.text(`TOTAL PAID: ₹ ${shipmentData.shippingCost}`, margin, y);
    y += 30;


    // CONFIRMATION
    doc.setFontSize(12);
    doc.setFont("Helvetica", "italic");
    doc.text("Shipping payment successfully verified via Razorpay.", margin, y);
    y += 25;


    // FOOTER
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Thank you for choosing Transpargo.", margin, y);


    doc.save(`Transpargo_Shipping_Receipt_${shipmentId}.pdf`);
  };




  if (error) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-white to-blue-300">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
          <button
            onClick={() => navigate(`/user/tracking/${type}/${shipmentId}`)}
            className="w-full bg-blue-300 py-4 mt-4 rounded-lg"
          >
            ← Back to Tracking
          </button>
        </div>
      </div>
    );
  }


  if (loading || !shipmentData) return <div>Loading shipment...</div>;




  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-white to-blue-300"style={{
      background:
        "linear-gradient(135deg, #FFFFFF, #EDE8F5, #ADBBD4, #8697C4, #7091E6)",
    }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">
          Shipping Payment & Clearance
        </h1>
        <p className="text-gray-700">Shipment ID: {shipmentId}</p>


        {/* Status Banner */}
        {paymentStatus !== "pending" && (
          <div className="mt-4 p-4 rounded-lg bg-green-200 text-green-700 font-semibold shadow">
            {paymentStatus === "paid" && "Payment Successful. Updating Status..."}
            {paymentStatus === "clearance" && "Processing Shipment..."}
            {paymentStatus === "cleared" && "Shipment cleared successfully!"}
          </div>
        )}


        {/* Sender */}
        <div className="bg-white shadow-md p-6 mt-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2">Sender</h3>
          <p>Name: {shipmentData.sender?.name || "—"}</p>
          <p>Email: {shipmentData.sender?.email || "—"}</p>
          <p>Phone: {shipmentData.sender?.phone || "—"}</p>
          <p>Address: {shipmentData.sender?.address || "—"}</p>
        </div>


        {/* Receiver */}
        <div className="bg-white shadow-md p-6 mt-6 rounded-lg">
          <h3 className="font-bold text-xl mb-2">Receiver</h3>
          <p>Name: {shipmentData.receiver?.name || "—"}</p>
          <p>Email: {shipmentData.receiver?.email || "—"}</p>
          <p>Phone: {shipmentData.receiver?.phone || "—"}</p>
          <p>Address: {shipmentData.receiver?.address || "—"}</p>
        </div>


        {/* Payment Summary */}
        <div className="bg-white shadow-md p-6 mt-6 rounded-lg">
          <h3 className="font-bold text-xl mb-4">Payment Summary</h3>
         
          {/* Show breakdown */}
          <div className="space-y-2">
            <p className="text-lg">
              Base Shipping Cost: ₹{(Number(shipmentData.shippingCost) - Number(shipmentData.fine)).toFixed(2)}
            </p>
           
            {Number(shipmentData.fine) > 0 && (
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-red-600 font-semibold">
                  Late Payment Fine ({shipmentData.daysPassed} days): ₹{shipmentData.fine}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Fine applied for payment after 5 days
                </p>
              </div>
            )}
           
            <p className="font-bold text-xl mt-4 pt-4 border-t">
              Total Payable: ₹{shipmentData.shippingCost}
            </p>
          </div>
        </div>


        {/* Pay button only if still pending */}
        {paymentStatus === "pending" && (
          <button
            onClick={openRazorpayCheckout}
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white py-4 mt-6 rounded-lg disabled:opacity-50"
          >
            {loading ? "Processing..." : "💳 Pay Shipping with Razorpay"}
          </button>
        )}


        {/* Receipt button when fully cleared */}
        {paymentStatus === "cleared" && (
          <button
            onClick={downloadReceipt}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 mt-6 rounded-lg"
          >
            📄 Download Shipping Receipt
          </button>
        )}


        <button
          onClick={() => navigate(`/user/tracking/${type}/${shipmentId}`)}
          className="w-full bg-blue-300 py-4 mt-4 rounded-lg"
        >
          ← Back to Tracking
        </button>
      </div>
    </div>
  );
}
