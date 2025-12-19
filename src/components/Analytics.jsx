import { useEffect, useState } from "react";
import { getAnalyticsSummary } from "../api/analyticApi";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";


export default function ReportingAnalytics() {


  const STATUS_COLORS = ["#4CAF50", "#FFA726", "#EF5350", "#64B5F6"];
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
          <span>Generating Data...</span>
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
      : "N/A"
  };


  const dutytype = AnalyticsData.commonDuty
    ? Object.entries(AnalyticsData.commonDuty).map(([duty, value]) => ({ duty, value }))
    : [];


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
    <div className="min-h-screen bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6] p-4 sm:p-6 lg:p-8">


      {/* MAIN WRAPPER – wider but still centered */}
      <div className="max-w-7xl mx-auto px-6">


        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-[#3D52A0]">Reporting & Analytics</h1>
        </div>


        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">


          {/* Total Shipments */}
          <div className="bg-white/80 rounded-lg shadow p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 text-sm font-medium">Total Shipments</span>
              <span className="text-xl">📦</span>
            </div>
            <p className="text-3xl font-bold text-[#3D52A0]">{statsData.totalShipments}</p>
          </div>


          {/* In-Process */}
          <div className="bg-white/80 rounded-lg shadow p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 text-sm font-medium">In-Process Shipments</span>
              <span className="text-xl">⌛</span>
            </div>
            <p className="text-3xl font-bold text-orange-500">{statsData.inProcess}</p>
          </div>


          {/* Clearance */}
          <div className="bg-white/80 rounded-lg shadow p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 text-sm font-medium">Clearance Success Rate</span>
              <span className="text-xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{statsData.clearanceRate}</p>
          </div>


          {/* Avg Duty */}
          <div className="bg-white/80 rounded-lg shadow p-6 border border-gray-200">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 text-sm font-medium">Average Shipping Cost Paid</span>
              <span className="text-xl">₹</span>
            </div>
            <p className="text-3xl font-bold text-[#7091E6]">{statsData.avgDutyPaid}</p>
          </div>


          {/* Duty Modes */}
          <div className="bg-white/80 rounded-lg shadow p-6 border border-gray-200 whitespace-nowrap">
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-600 text-sm font-medium">Duty Modes</span>
              <span className="text-xl">🏷️</span>
            </div>
            {dutytype.map((item, i) => (
              <p key={i} className="text-lg font-bold text-red-600">
                {item.duty}: {item.value}
              </p>
            ))}
          </div>


        </div>


        {/* TOP CHARTS (bigger spacing & chart sizes) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">


          {/* LINE CHART */}
          <div className="bg-white/80 rounded-lg shadow p-6 border">
            <h2 className="text-xl font-bold text-[#3D52A0] mb-6">Shipments Over Months</h2>
            <div className="w-full h-[360px]">
              <ResponsiveContainer>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>


          {/* PIE CHART */}
          <div className="bg-white/80 rounded-lg shadow p-6 border">
            <h2 className="text-xl font-bold text-[#3D52A0] mb-2">Package Status Distribution</h2>
            <p className="text-sm text-gray-500 mb-6">Delivered vs Returned vs Destroyed vs In-Process</p>
           
            <div className="w-full h-[360px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={packageStatusData}
                    dataKey="Value"
                    nameKey="Status"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    label
                  >
                    {packageStatusData.map((entry, index) => (
                      <Cell key={index} fill={STATUS_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>


            {/* Legend */}
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "#4caf50" }}></div>
                <span className="text-sm">Delivered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "#ff9800" }}></div>
                <span className="text-sm">Returned</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "#f44336" }}></div>
                <span className="text-sm">Destroyed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded" style={{ background: "#64B5F6" }}></div>
                <span className="text-sm">In-Process</span>
              </div>
            </div>
          </div>


        </div>


        {/* BOTTOM ROW (now spaced nicely + scroll friendly) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6 mb-20">


          {/* COUNTRY STATS */}
          <div className="bg-white/80 rounded-lg shadow p-6 border">
            <h2 className="text-xl font-bold text-[#3D52A0] mb-6">Shipments per Country</h2>


            <div className="space-y-4">
              {countryData.map(country => {
                const maxShipments = Math.max(...countryData.map(c => c.shipments));
                const barWidth = (country.shipments / maxShipments) * 100;


                return (
                  <div key={country.country}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-[#3D52A0]">{country.country}</span>
                      <span className="text-xs text-gray-500">{country.shipments} shipments</span>
                    </div>
                    <div className="flex h-8 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="bg-[#7091E6] flex items-center justify-center text-white text-xs font-semibold"
                        style={{ width: `${barWidth}%` }}
                      >
                        {country.shipments > 10 && country.shipments}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>


          {/* AI INSIGHTS */}
          <div className="bg-white/80 rounded-lg shadow p-6 border">
            <h2 className="text-xl font-bold text-[#3D52A0] mb-4">AI-driven Insights</h2>


            <div className="bg-green-100 border-2 border-green-500 rounded-lg p-6 min-h-[600px]">
              <p className="text-gray-800 leading-relaxed">
                {AnalyticsData.aiSummary || "No insights available right now."}
              </p>
            </div>
          </div>


        </div>


      </div>
    </div>
  );
}
