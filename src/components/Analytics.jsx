import { useEffect, useState } from "react";
import { getAnalyticsSummary } from "../api/analyticApi";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

export default function ReportingAnalytics() {
  const STATUS_COLORS = ["#4CAF50", "#FFA726", "#EF5350", "#e25788ff", "#64B5F6"];
  const [AnalyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    getAnalyticsSummary()
      .then(response => setAnalyticsData(response.data))
      .catch(error => console.error("ERROR in analytics API:", error));
  }, []);

  if (!AnalyticsData) {
    return (
      <div className="flex items-center justify-center h-full py-10">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-indigo-500 border-solid"></div>
          <span className="text-sm md:text-base">Generating Data...</span>
        </div>
      </div>
    );
  }

  const statsData = {
    totalShipments: AnalyticsData.totalShipments ?? 0,
    inProcess: AnalyticsData.inProcess ?? 0,
    clearanceRate: AnalyticsData.clearanceSucessRate
      ? AnalyticsData.clearanceSucessRate + "%"
      : "N/A",
    avgDutyPaid: AnalyticsData.avgDutyPaid
      ? "₹" + AnalyticsData.avgDutyPaid
      : "N/A",
      abortrate: AnalyticsData.abortedRate
      ? AnalyticsData.abortedRate + "%"
      : "N/A",
  };

  const monthlyData = AnalyticsData.shipmentsOverMonths
    ? Object.entries(AnalyticsData.shipmentsOverMonths).map(([month, value]) => ({ month, value }))
    : [];

  const countryData = AnalyticsData.shipmentsPerCountry
    ? Object.entries(AnalyticsData.shipmentsPerCountry).map(([country, shipments]) => ({ country, shipments }))
    : [];

  const packageStatusData = AnalyticsData.statusDistribution
    ? Object.entries(AnalyticsData.statusDistribution).map(([Status, Value]) => ({ Status, Value }))
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6] p-3 sm:p-4 md:p-6 lg:p-8">
      {/* MAIN WRAPPER */}
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 md:mb-10 px-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#3D52A0] break-words">
            Reporting & Analytics
          </h1>
        </div>

        {/* STATS CARDS - Improved Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-16">
          {/* Total Shipments */}
          <div className="bg-white/80 rounded-lg shadow p-4 sm:p-5 md:p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-600 text-xs sm:text-sm font-medium leading-tight">
                Total Shipments
              </span>
              <span className="text-lg sm:text-xl flex-shrink-0">📦</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#3D52A0] break-words">
              {statsData.totalShipments}
            </p>
          </div>

          {/* In-Process */}
          <div className="bg-white/80 rounded-lg shadow p-4 sm:p-5 md:p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-600 text-xs sm:text-sm font-medium leading-tight">
                In-Process Shipments
              </span>
              <span className="text-lg sm:text-xl flex-shrink-0">⌛</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-orange-500 break-words">
              {statsData.inProcess}
            </p>
          </div>

          {/* Clearance */}
          <div className="bg-white/80 rounded-lg shadow p-4 sm:p-5 md:p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-600 text-xs sm:text-sm font-medium leading-tight">
                Clearance Success Rate
              </span>
              <span className="text-lg sm:text-xl flex-shrink-0">✅</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-green-600 break-words">
              {statsData.clearanceRate}
            </p>
          </div>

          {/* Avg Duty */}
          <div className="bg-white/80 rounded-lg shadow p-4 sm:p-5 md:p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-600 text-xs sm:text-sm font-medium leading-tight">
                Average Shipping Cost
              </span>
              <span className="text-lg sm:text-xl flex-shrink-0">₹</span>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#7091E6] break-words overflow-hidden">
              {statsData.avgDutyPaid}
            </p>
          </div>

          {/* Duty Modes */}
          <div className="bg-white/80 rounded-lg shadow p-4 sm:p-5 md:p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-gray-600 text-xs sm:text-sm font-medium leading-tight">
                Abort Rate
              </span>
              <span className="text-lg sm:text-xl flex-shrink-0">%</span>
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-[#7091E6] break-words overflow-hidden">
              {statsData.abortrate}
            </p>
          </div>
        </div>

        {/* TOP CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-8 md:mb-16">
          {/* LINE CHART */}
          <div className="bg-white/80 rounded-lg shadow p-4 sm:p-5 md:p-6 border overflow-hidden">
            <h2 className="text-lg sm:text-xl font-bold text-[#3D52A0] mb-4 md:mb-6">
              Shipments Over Months
            </h2>
            <div className="w-full h-[280px] sm:h-[320px] md:h-[360px]">
              <ResponsiveContainer>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          <div className="bg-white/80 rounded-lg shadow p-4 sm:p-5 md:p-6 border overflow-hidden">
            <h2 className="text-lg sm:text-xl font-bold text-[#3D52A0] mb-1 md:mb-2">
              Package Status Distribution
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 md:mb-6">
              Delivered vs Returned vs Destroyed vs In-Process vs Aborted
            </p>
            
            <div className="w-full h-[280px] sm:h-[320px] md:h-[360px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={packageStatusData}
                    dataKey="Value"
                    nameKey="Status"
                    cx="50%"
                    cy="50%"
                    outerRadius="65%"
                    label={(entry) => entry.Value > 0 ? entry.Value : ''}
                    labelStyle={{ fontSize: '12px' }}
                  >
                    {packageStatusData.map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend - Responsive */}
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mt-4 md:mt-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ background: "#4caf50" }}></div>
                <span className="text-xs sm:text-sm whitespace-nowrap">Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ background: "#ff9800" }}></div>
                <span className="text-xs sm:text-sm whitespace-nowrap">Returned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ background: "#f44336" }}></div>
                <span className="text-xs sm:text-sm whitespace-nowrap">Destroyed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ background: "#e25788ff" }}></div>
                <span className="text-xs sm:text-sm whitespace-nowrap">Aborted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ background: "#64B5F6" }}></div>
                <span className="text-xs sm:text-sm whitespace-nowrap">In-Process</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 mb-10 md:mb-20">
          {/* COUNTRY STATS */}
          <div className="bg-white/80 rounded-lg shadow p-4 sm:p-5 md:p-6 border overflow-hidden">
            <h2 className="text-lg sm:text-xl font-bold text-[#3D52A0] mb-4 md:mb-6">
              Shipments per Country
            </h2>

            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
              {countryData.map(country => {
                const maxShipments = Math.max(...countryData.map(c => c.shipments));
                const barWidth = maxShipments > 0 ? (country.shipments / maxShipments) * 100 : 0;

                return (
                  <div key={country.country}>
                    <div className="flex justify-between items-center mb-1 gap-2">
                      <span className="font-semibold text-[#3D52A0] text-sm sm:text-base truncate flex-1">
                        {country.country}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                        {country.shipments} shipments
                      </span>
                    </div>
                    <div className="flex h-7 sm:h-8 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="bg-[#7091E6] flex items-center justify-center text-white text-xs font-semibold transition-all"
                        style={{ width: `${barWidth}%`, minWidth: barWidth > 0 ? '20px' : '0' }}
                      >
                        {country.shipments > 5 && country.shipments}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI INSIGHTS */}
          <div className="bg-white/80 rounded-lg shadow p-4 sm:p-5 md:p-6 border overflow-hidden">
            <h2 className="text-lg sm:text-xl font-bold text-[#3D52A0] mb-3 md:mb-4">
              AI-driven Insights
            </h2>

            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-4 sm:p-5 md:p-6 min-h-[200px] max-h-[500px] lg:h-[90%] overflow-y-auto">
              <p className="text-sm sm:text-base text-gray-800 leading-relaxed break-words">
                {AnalyticsData.aiSummary || "No insights available right now."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
