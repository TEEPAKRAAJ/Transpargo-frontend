import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserShipments } from "../api/userApi";

export default function UserDashboard() {
  const navigate = useNavigate();
  const id = localStorage.getItem("ID");

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOption, setSortOption] = useState("Most Recent");

  useEffect(() => {
    async function loadShipments() {
      try {
        const res = await getUserShipments(id);
        setShipments(res.data);
      } catch (error) {
        console.error("Error loading shipments:", error);
        setShipments([]);
      }
      setLoading(false);
    }

    loadShipments();
  }, [id]);

  // Filtering + Sorting Logic
  const filteredShipments = shipments
    .filter(s =>
      s.shipment_id?.toString().toLowerCase().includes(search.toLowerCase())
    )
    .filter(s => (statusFilter === "All" ? true : s.status === statusFilter))
    .sort((a, b) => {
      return sortOption === "Most Recent"
        ? new Date(b.updated_at) - new Date(a.updated_at)
        : new Date(a.updated_at) - new Date(b.updated_at);
    });

  return (
    <div
      className="min-h-screen px-4 sm:px-6 md:px-12 lg:px-20 py-10"
      style={{
        background:
          "linear-gradient(135deg, #FFFFFF, #EDE8F5, #ADBBD4, #8697C4, #7091E6)",
      }}
    >
      <div className="max-w-7xl mx-auto bg-white/70 backdrop-blur-xl p-6 sm:p-10 rounded-3xl shadow-xl border border-[#ADBBD4]">

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#3D52A0] mb-8 text-center sm:text-left">
          User Dashboard
        </h1>

        {/* Loading State */}
        {loading ? (
          <p className="text-center text-gray-600 text-lg mt-10">
            Loading shipments...
          </p>
        ) : (
          <>
            {/* ----------------------- FILTERS ----------------------- */}
            <div className="bg-[#EDE8F5] p-4 sm:p-6 rounded-2xl border border-[#ADBBD4] mb-8 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {/* Search */}
                <input
                  placeholder="Search Shipment ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="p-3 border border-[#ADBBD4] rounded-xl shadow-sm focus:ring-2 focus:ring-[#7091E6]"
                />

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-3 border border-[#ADBBD4] rounded-xl shadow-sm focus:ring-2 focus:ring-[#7091E6]"
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
            <option value="Charges Paid">Charges Paid</option>
            <option value="Returned">Returned</option>
            <option value="Destroyed">Destroyed</option>
            <option value="Aborted">Aborted</option>
                </select>

                {/* Sorting */}
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="p-3 border border-[#ADBBD4] rounded-xl shadow-sm focus:ring-2 focus:ring-[#7091E6]"
                >
                  <option>Most Recent</option>
                  <option>Oldest First</option>
                </select>
              </div>
            </div>

            {/* ----------------------- TABLE ----------------------- */}
            <h2 className="text-xl sm:text-2xl font-semibold text-[#3D52A0] mb-4">
              Your Shipments
            </h2>

            {filteredShipments.length === 0 ? (
              <p className="text-center text-gray-600 text-lg">
                No shipments found.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#ADBBD4] shadow-md">
                <table className="w-full text-left min-w-[900px]">
                  <thead className="bg-[#8697C4]/25 text-[#3D52A0] rounded-t-xl">
                    <tr>
                      <th className="p-4">Shipment ID</th>
                      <th className="p-4">Receiver</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Updated At</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredShipments.map((item, index) => (
                      <tr
                        key={index}
                        className="border-b hover:bg-[#EDE8F5] transition"
                      >
                        <td className="p-4 font-medium">{item.shipment_id}</td>
                        <td className="p-4">{item.receiver_name}</td>
                        <td className="p-4">{item.product_name}</td>
                        <td className="p-4">₹{item.value}</td>

                        {/* Status Badge */}
                        <td className="p-4">
                          <span
                            className="px-3 py-1 rounded-full text-sm font-medium border shadow-sm"
                            style={{
                              backgroundColor:
                                item.status === "Delivered"
                                  ? "#D4FFDC"
                                  : item.status === "Destroyed"
                                  ? "#FFD4D4"
                                  : item.status === "Returned"
                                  ? "#D4E6FF"
                                  : "#FFE6BF",
                            }}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="p-4">
                          {new Date(item.updated_at).toLocaleString()}
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() =>
                              navigate(`/user/tracking/sender/${item.shipment_id}`)
                            }
                            className="bg-[#7091E6] text-white px-4 py-2 rounded-lg hover:bg-[#3D52A0] transition shadow-md"
                          >
                            Track
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
