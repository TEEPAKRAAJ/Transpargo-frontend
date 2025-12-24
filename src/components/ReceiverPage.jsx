import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyReceiver } from "../api/userApi";

export default function ReceiverPage() {
  const navigate = useNavigate();
  const [shipmentId, setShipmentId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const goToTracking = async () => {
    setErrorMsg("");

    if (!shipmentId.trim()) {
      setErrorMsg("Please enter a Shipment ID!");
      return;
    }

    const email = localStorage.getItem("email");

    if (!email) {
      setErrorMsg("User not logged in!");
      return;
    }

    try {
      // Convert SHP001 → 1
      const numericId = shipmentId.replace("SHP", "");
      

      // Backend request: /user/verify-receiver/{email}/{shipmentId}
      const res = await verifyReceiver(email, numericId);

      if (res.data.valid) {
        // Allowed → navigate to tracking
        navigate(`/user/tracking/receiver/${shipmentId}`);
      } else {
        setErrorMsg("Shipment not found or you are not the receiver for this shipment.");
      }

    } catch (err) {
      console.error(err);
      setErrorMsg("Server error. Try again later.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6]">
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-gray-200">

        <h1 className="text-3xl font-bold text-[#3D52A0] text-center mb-6">
          Receiver Shipment Page
        </h1>

        <label className="block font-medium text-[#3D52A0] mb-2">
          Enter Shipment ID
        </label>

        <input
          type="text"
          placeholder="Ex: SHP001"
          value={shipmentId}
          onChange={(e) => setShipmentId(e.target.value)}
          className="border border-[#8697C4] focus:ring-2 focus:ring-[#7091E6] focus:border-[#7091E6] rounded-lg w-full p-3 mb-4 text-[#3D52A0]"
        />

        {errorMsg && (
          <p className="text-red-600 font-semibold mb-3">{errorMsg}</p>
        )}

        <button
          onClick={goToTracking}
          className="w-full py-3 rounded-lg text-white font-semibold transition bg-[#7091E6] hover:bg-[#3D52A0]"
        >
          Go to Tracking
        </button>

        <div className="mt-8 p-4 bg-blue-50 border-l-4 border-[#7091E6] rounded">
          <h3 className="font-bold text-[#3D52A0] mb-2">What you'll see:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Current shipment status</li>
            <li>✓ Complete tracking history</li>
            <li>✓ Customs clearance updates</li>
          </ul>
        </div>

      </div>
    </div>
  );
}
