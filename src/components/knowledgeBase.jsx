import { useState, useEffect } from "react";
import { getKnowledgeBase } from "../api/userApi";

export default function KnowledgeBase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await getKnowledgeBase();
      setData(res.data);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRows = filteredData.slice(startIndex, startIndex + pageSize);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* PAGE HEADER */}
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-2 text-center sm:text-left">
          Customs Knowledgebase
        </h1>
        <p className="text-gray-700 mb-6 text-center sm:text-left">
          Find HS codes, breakdowns, and product classification details.
        </p>

        {/* SEARCH BAR */}
        <div className="bg-white/80 rounded-xl shadow-md p-4 mb-6">
          <label className="block text-[#3D52A0] font-semibold mb-2">
            Search
          </label>
          <input
            type="text"
            placeholder="Search HS codes or description..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        {/* TABLE WRAPPER */}
        <div className="bg-white/90 rounded-xl shadow-lg p-4 sm:p-6 backdrop-blur overflow-x-auto">
          <table className="min-w-full text-left border-separate border-spacing-y-3">
            <thead className="text-gray-600 text-xs sm:text-sm">
              <tr className="bg-gray-200 text-gray-700">
                <th className="p-3 min-w-[100px] rounded-l-lg">HS Code</th>
                <th className="p-3 min-w-[80px]">HS-4</th>
                <th className="p-3 min-w-[80px]">HS-5</th>
                <th className="p-3 min-w-[80px]">HS-6</th>
                <th className="p-3 min-w-[300px] rounded-r-lg">Description</th>
              </tr>
            </thead>

            <tbody className="text-sm">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-4 italic text-gray-500"
                  >
                    No results found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, index) => (
                  <tr
                    key={index}
                    className="bg-gray-100 hover:bg-gray-200 transition rounded-lg"
                  >
                    <td className="p-3 whitespace-nowrap">{row.ITC_HS}</td>
                    <td className="p-3 whitespace-nowrap">{row.HS_4}</td>
                    <td className="p-3 whitespace-nowrap">{row.HS_5}</td>
                    <td className="p-3 whitespace-nowrap">{row.HS_6}</td>

                    <td className="p-3 break-words whitespace-normal leading-snug">
                      <div className="line-clamp-3">{row.Description}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              currentPage === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#3D52A0] text-white hover:bg-[#7091E6]"
            }`}
          >
            ← Previous
          </button>

          <p className="font-semibold text-gray-700">
            Page {currentPage} of {totalPages}
          </p>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className={`px-5 py-2 rounded-lg font-semibold transition ${
              currentPage === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#3D52A0] text-white hover:bg-[#7091E6]"
            }`}
          >
            Next →
          </button>

        </div>
      </div>
    </div>
  );
}
