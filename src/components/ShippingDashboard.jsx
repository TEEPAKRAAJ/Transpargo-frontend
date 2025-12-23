import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../api/supabaseClient";


export default function ShippingDashboard() {
  const navigate = useNavigate();

  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");

  // ---------------- Load shipments ----------------
  const loadShipments = React.useCallback(async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/shipments`);
      const data = await res.json();
      setShipments(data);
    } catch (err) {
      console.error("Error loading shipments:", err);
    }
  }, []);
  

  useEffect(() => {
    loadShipments();
  }, [loadShipments]);
  

  useEffect(() => {
    const channel = supabase
      .channel("shipment-dashboard-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Shipment",
        },
        () => {
          console.log("Realtime: Shipment updated");
          loadShipments();
        }
      )
      .subscribe();
  
    return () => supabase.removeChannel(channel);
  }, [loadShipments]);
  
  

  // ---------------- Filtering ----------------
  const filtered = shipments.filter((s) => {
    const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase());

    // FIX HERE — match exact backend spelling "Shippment created"
    const matchesStatus =
      statusFilter === "All" || s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // ---------------- Sorting ----------------
  const sorted = [...filtered].sort((a, b) => {
    const tA = new Date(a.created_at);
    const tB = new Date(b.created_at);
  
    if (isNaN(tA) || isNaN(tB)) return 0; // safety fallback
  
    return sortOrder === "asc" ? tA - tB : tB - tA;
  });

  // ---------------- Action Button Logic ----------------
  const getActionButton = (s) => {
    let label = "";
    let page = "";
  
    const numericId = parseInt(String(s.id).replace("SHP", ""));
  
    // ✅ 1. Separate Return & Destruction pages
    if (s.status === "Return Request" ||s.status === "Charges Paid" || s.status === "Returned") {
      label = "Return";
      page = "returns";
    }
    else if (s.status === "Destruction Request" || s.status === "Charges Paid" || s.status === "Destroyed") {
      label = "Destruction";
      page = "destruction";
    }
  
    // ✅ 2. Other states remain same
    else if (s.status === "Shipment created") {
      label = "Approve";
      page = "approve";
    }
    else if (s.status === "HS Approved" || s.status === "Document Uploaded") {
      label = "Check";
      page = "check";
    }
    else if (
      s.status === "Delivered" ||
      s.status === "Customs Cleared" ||
      s.status === "Duty Payment Successful" ||
      s.status === "Aborted"
    ) {
      label = "Done";
      page = "done";
    }
    else {
      label = "Notify";
      page = "notify";
    }
  
    return (
      <button
        onClick={() => {
          navigate(`/Shipping_agency/shipment/${numericId}/${page}`);
        }}
  
        className={`px-8 py-3 rounded-xl text-lg font-semibold transition text-white
          ${
            label === "Approve"
              ? "bg-[#7091E6] hover:bg-[#3D52A0]"
            : label === "Check"
              ? "bg-[#7091E6] hover:bg-[#3D52A0]"
            : label === "Notify"
              ? "bg-[#7091E6] hover:bg-[#3D52A0]"
  
            // 🟧 Return button
            : label === "Return"
              ? "bg-[#FCD235] hover:bg-[#F4B800]"
  
            // 🔴 Destruction button
            : label === "Destruction"
              ? "bg-[#c91d19] hover:bg-[#5f0d0b]"
  
            // 🌿 Light Green for done
            : label === "Done"
              ? "bg-green-400 text-[#22543D] hover:bg-green-600"
  
            : "bg-gray-500 hover:bg-gray-600"
          }
        `}
      >
        {label}
      </button>
    );
  };
  


  return (
    <div
      className="min-h-screen px-12 py-12"
      style={{
        background:
          "linear-gradient(135deg,#FFFFFF,#EDE8F5,#ADBBD4,#8697C4,#7091E6)",
      }}
    >
      <div className="max-w-8xl mx-auto bg-white/90 shadow-xl rounded-3xl p-10 border border-[#ADBBD4]">
        <h1 className="text-4xl font-bold text-[#3D52A0] mb-10">Shipping Dashboard</h1>

        {/* ---------------- Filters ---------------- */}
        <div className="flex gap-6 mb-10">
          <input
            type="text"
            placeholder="Search by Shipment ID"
            className="p-4 border rounded-xl w-1/3 shadow"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="p-4 border rounded-xl shadow"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Shipment created">Shipment created</option>
            <option value="HS Approved">HS Approved</option>
            <option value="Document Uploaded">Document Uploaded</option>
            <option value="Document Approved">Document Approved</option>
            <option value="Payment Successful">Payment Successful</option>
            <option value="Additional Document Required">Additional Document Required</option>
            <option value="In Transit">In Transit</option>
            <option value="Arrived at Customs">Arrived at Customs</option>
            <option value="Import Clearance">Import Clearance</option>
            <option value="Customs Cleared">Customs Cleared</option>
            <option value="Duty Payment Successful">Duty Payment Successful</option>
            <option value="Delivered">Delivered</option>
            <option value="Return Request">Return Request</option>
            <option value="Destruction Request">Destruction Request</option>
            <option value="Payment Initiated">Payment Initiated</option>
            <option value="Charges Paid">Charges Paid</option>
            <option value="Returned">Returned</option>
            <option value="Destroyed">Destroyed</option>
            <option value="Aborted">Aborted</option>
          </select>

          <select
            className="p-4 border rounded-xl shadow"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="desc">Newest First</option>
            <option value="asc">Oldest First</option>
          </select>
        </div>

        {/* ---------------- Table ---------------- */}
        <div className="overflow-x-auto border rounded-2xl shadow-xl">
          <table className="w-full text-xl">
            <thead className="bg-[#8697C4]/20 text-[#3D52A0]">
              <tr>
                <th className="p-6 text-center">Shipment ID</th>
                <th className="p-6 text-center">Sender</th>
                <th className="p-6 text-center">Receiver</th>
                <th className="p-6 text-center">Value</th>
                <th className="p-6 text-center">Status</th>
                <th className="p-6 text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((s) => (
                <tr key={s.id} className="border-b hover:bg-[#EDE8F5] transition">
                  <td className="p-6 text-center">{s.id}</td>
                  <td className="p-6 text-center">{s.sender}</td>
                  <td className="p-6 text-center">{s.receiver}</td>
                  <td className="p-6 text-center">₹{s.value?.toLocaleString()}</td>
                  <td className="p-6 text-center">{s.status}</td>
                  <td className="p-6 text-center">{getActionButton(s)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
