import { useState, useEffect } from "react";
import { getUserShipments } from "../api/userApi";

export default function FeedbackComplaint() {
  const userId = Number(localStorage.getItem("ID"));

  const [rating, setRating] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ✅ NEW
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState("");

  const options = [
    { id: 1, emoji: "😡", label: "Very Bad" },
    { id: 2, emoji: "😕", label: "Bad" },
    { id: 3, emoji: "😐", label: "Okay" },
    { id: 4, emoji: "🙂", label: "Good" },
    { id: 5, emoji: "😁", label: "Excellent" },
  ];

  /* TYPE DECISION (UNCHANGED) */
  const getTypeFromRating = (rating) => {
    if (rating === 1 || rating === 2) return "Complaint";
    if (rating === 4 || rating === 5) return "Feedback";
    return "Neutral";
  };

  // ✅ LOAD USER SHIPMENTS
  useEffect(() => {
    async function loadShipments() {
      try {
        const res = await getUserShipments(userId);
        setShipments(res.data || []);
      } catch (e) {
        console.error("Error loading shipments", e);
      }
    }
    loadShipments();
  }, [userId]);

  const submit = async () => {
    if (!rating) {
      alert("Please select your experience 🙂");
      return;
    }

    if (!selectedShipment) {
      alert("Please select a shipment 🚚");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          user_id: userId,
          shipment_id: selectedShipment, // ✅ ADDED
          rating: rating,
          message: message,
        }),
      });

      if (!response.ok) {
        const err = await response.text();   // 👈 read backend message
        alert(err);                      
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch (e) {
      console.error(e);
      alert("Server error");
    }

    setSubmitting(false);

    setTimeout(() => {
      setSubmitted(false);
      setRating(null);
      setMessage("");
      setSelectedShipment("");
    }, 2600);
  };

  return (
    <>
      {/* ANIMATIONS (UNCHANGED) */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatSlow {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-18px); }
        }
        @keyframes emojiPop {
          0% { transform: scale(0.8); }
          50% { transform: scale(1.35); }
          100% { transform: scale(1.15); }
        }
        @keyframes glow {
          0% { box-shadow: 0 0 0 rgba(61,82,160,0); }
          100% { box-shadow: 0 0 35px rgba(61,82,160,0.55); }
        }
        @keyframes buttonPress {
          0% { transform: scale(1); }
          50% { transform: scale(0.94); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6] px-6 py-16">
        <div
          className="w-full max-w-[90rem] min-h-[85vh] bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 px-20 py-20 flex flex-col justify-center"
          style={{ animation: "fadeUp 0.8s ease-out" }}
        >
          {/* HEADER */}
          <div
            className="text-center mb-16"
            style={{ animation: "floatSlow 5s ease-in-out infinite" }}
          >
            <div className="mx-auto w-24 h-24 rounded-3xl bg-[#3D52A0]/10 flex items-center justify-center text-5xl">
              💬
            </div>
            <h1 className="text-6xl font-bold text-[#101828] mt-6">
              Feedback & Complaints
            </h1>
            <p className="text-gray-600 mt-4 text-4xl">
              Tell us how your experience was — it helps us improve 💙
            </p>
          </div>

          {/* RATING */}
          <div className="flex justify-center gap-14 mb-16">
            {options.map((opt) => {
              const active = rating === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setRating(opt.id)}
                  onMouseEnter={() => setHovered(opt.id)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex flex-col items-center transition-transform"
                  style={{
                    transform:
                      active || hovered === opt.id
                        ? "scale(1.3)"
                        : "scale(1)",
                  }}
                >
                  <span
                    className="text-6xl"
                    style={{
                      animation: active ? "emojiPop 0.5s ease-out" : "none",
                      filter: active
                        ? "drop-shadow(0 0 18px rgba(61,82,160,0.6))"
                        : "none",
                    }}
                  >
                    {opt.emoji}
                  </span>

                  {(hovered === opt.id || active) && (
                    <span
                      className="mt-4 text-lg font-semibold text-[#3D52A0]"
                      style={{ animation: "fadeUp 0.3s ease-out" }}
                    >
                      {opt.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SHIPMENT SELECT (NEW) */}
          <div className="mb-16">
            <label className="block text-4xl font-medium text-gray-700 mb-4">
              Select Shipment
            </label>
            <select
              value={selectedShipment}
              onChange={(e) => setSelectedShipment(e.target.value)}
              className="w-full rounded-2xl border border-gray-300 px-6 py-5 text-3xl focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/40"
            >
              <option value="">-- Choose your shipment --</option>
              {shipments.map((s) => (
                <option key={s.shipment_id} value={s.shipment_id}>
                  {s.shipment_id} — {s.product_name}
                </option>
              ))}
            </select>
          </div>

          {/* MESSAGE */}
          <div className="mb-16">
            <label className="block text-4xl font-medium text-gray-700 mb-4">
              Tell us more
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your feedback or complaint in detail..."
              rows={8}
              className="w-full rounded-2xl border border-gray-300 px-6 py-5 text-4xl resize-none focus:outline-none focus:ring-2 focus:ring-[#3D52A0]/40"
            />
          </div>

          {/* SUBMIT */}
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full bg-[#3D52A0] hover:bg-[#2c3a78] text-white py-5 rounded-2xl text-4xl font-semibold transition shadow-xl"
            style={{
              animation: submitting ? "buttonPress 0.5s ease" : "none",
            }}
          >
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>

        {/* SUCCESS MODAL */}
        {submitted && (
          <div className="fixed inset-0 bg-white/70 backdrop-blur flex items-center justify-center">
            <div
              className="bg-white rounded-3xl px-16 py-14 shadow-2xl text-center"
              style={{
                animation: "fadeUp 0.5s ease-out, glow 0.8s ease-out",
              }}
            >
              <div className="text-7xl mb-5 animate-bounce">🎉</div>
              <h3 className="text-3xl font-bold text-[#3D52A0]">
                Thank You!
              </h3>
              <p className="text-gray-600 mt-3 text-xl">
                Your feedback has been submitted successfully.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
