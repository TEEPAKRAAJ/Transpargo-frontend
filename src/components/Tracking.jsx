import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../api/supabaseClient";
import { getSenderTimeline, getReceiverTimeline } from "../api/userApi";

export default function ShippingTimeline() {
  const { type, shipmentId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState("");
  const [shipment, setShipment] = useState(null);

  // ---------------- LOAD INITIAL TIMELINE + SHIPMENT DATA ----------------
  useEffect(() => {
    async function loadTimeline() {
      try {
        const id = shipmentId.replace("SHP", "");

        // Load full shipment list to retrieve status + metadata
        const all = await fetch("http://localhost:5000/api/shipments");
        const allData = await all.json();

        const found = allData.find(
          (s) => parseInt(String(s.id).replace("SHP", "")) === parseInt(id)
        );

        setShipment(found);
        setStatus(found?.status || "Unknown");
        
        // Load timeline logs
        if (type === "sender") {
          const res = await getSenderTimeline(id);
          setLogs(res.data);
        } else {
          const res = await getReceiverTimeline(id);
          setLogs(res.data);
        }
      } catch (err) {
        console.error("Timeline load error:", err);
      }
    }

    loadTimeline();
  }, [type, shipmentId]);

  // ---------------- REALTIME LISTENER ----------------
  useEffect(() => {
    const id = shipmentId.replace("SHP", "");

    const channel = supabase
      .channel("timeline-shipment-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Shipment",
          filter: `s_id=eq.${id}`,
        },
        async () => {
          console.log("Realtime timeline update received");

          // Reload shipment info
          const all = await fetch("http://localhost:5000/api/shipments");
          const allData = await all.json();

          const updated = allData.find(
            (s) => parseInt(String(s.id).replace("SHP", "")) === parseInt(id)
          );

          setShipment(updated);
          setStatus(updated?.status);

          // Reload timeline logs
          if (type === "sender") {
            const res = await getSenderTimeline(id);
            setLogs(res.data);
          } else {
            const res = await getReceiverTimeline(id);
            setLogs(res.data);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [shipmentId, type]);

  // ---------------- ICON LOGIC ----------------
  const getIcon = (icon) => {
    if (icon === "success")
      return (
        <div className="h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
          ✓
        </div>
      );

    if (icon === "error")
      return (
        <div className="h-5 w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs">
          !
        </div>
      );

    return (
      <div className="h-5 w-5 rounded-full bg-gray-400 text-white flex items-center justify-center text-xs">
        ○
      </div>
    );
  };

  if (!shipment)
    return <div className="p-10 text-xl">Loading timeline...</div>;

  return (
    <div
      className="min-h-screen px-10 py-10"
      style={{
        background:
          "linear-gradient(135deg,#FFFFFF,#EDE8F5,#ADBBD4,#8697C4,#7091E6)",
      }}
    >
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl p-10 border">

        {/* BACK BUTTON */}
        <button
  onClick={() =>
    navigate(type === "sender" ? "/user" : "/user/receive")
  }
  className="text-lg text-red-600 mb-6"
>
  {type === "sender" ? "← Back to Dashboard" : "← Back"}
</button>

        {/* HEADER */}
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-2">
          {type === "sender" ? "Sender Timeline" : "Receiver Timeline"}
        </h1>

        <h2 className="text-xl text-[#3D52A0] font-semibold mb-4">
          Shipment ID: {shipment.id}
        </h2>

        <p className="text-lg font-semibold text-gray-700 mb-6">
          Current Status:{" "}
          <span className="text-[#3D52A0]">{status}</span>
        </p>

        {/* TIMELINE CARD */}
        <div className="bg-white/70 border rounded-2xl p-8 shadow">

          <h3 className="text-2xl font-bold text-[#3D52A0] mb-6">
            Tracking Timeline
          </h3>

          <div className="relative">
            <div className="absolute left-2 top-0 bottom-0 w-1 bg-gray-300 rounded-full"></div>

            <div className="space-y-10 ml-8">
              {logs.map((log, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-8">{getIcon(log.icon)}</div>

                  <div>
                    <p className="font-semibold text-[#3D52A0]">
                      {log.title}
                    </p>

                    {log.date && (
                      <p className="text-sm text-gray-600">
                        {log.date} {log.time}
                      </p>
                    )}

                    {log.action && (
                      <a
                        href={log.action_href}
                        className="text-blue-600 text-sm underline"
                      >
                        {log.actionLabel}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
