import { useState } from "react";

const API_AI = `${import.meta.env.VITE_API_BASE_URL}/api/airisk/analyze`;

export default function RiskAnalysis() {
  const [manualInput, setManualInput] = useState({ product: "", destination: "", hsCode: "" });
  const [aiRisk, setAiRisk] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // AI-BASED
  const runAiRisk = async () => {
    if (!manualInput.product || !manualInput.destination || !manualInput.hsCode)
      return alert("Enter Product + Destination + HS Code");

    setAiLoading(true);

    try {
      const res = await fetch(API_AI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCategory: manualInput.product,
          destinationCountry: manualInput.destination,
          hsCode: manualInput.hsCode,
        })
      });

      const data = await res.json();
      console.log(data);
      setAiRisk(data);
    } finally {
      setAiLoading(false);
    }
  };

  const riskLevelColor = (level) =>
    level === "Low" ? "text-green-600" :
    level === "Medium" ? "text-yellow-600" :
    "text-red-600";

  return (
    <div className="min-h-screen w-full px-10 py-10"
      style={{ background: `linear-gradient(to bottom,#FFFFFF,#EDE8F5,#ADBBD4,#8697C4,#7091E6)` }}>

      <div className="w-full bg-white rounded-2xl border border-[#3D52A0] shadow-xl p-10">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">
          Predictive Risk Analysis (AI Mode)
        </h1>

        {/* INPUT */}
        <div className="grid grid-cols-2 gap-4">

          <select className="input" defaultValue=""
            onChange={(e) => setManualInput(p => ({ ...p, product: e.target.value }))}>
            <option value="">Select Product Category</option>
                  <option value="CLOTHING">Apparel & Textiles</option>
                  <option value="Cosmetics">
                    Cosmetics
                  </option>
                  <option value="Electronics">
                    Electronics Accessories
                  </option>
                  <option value="Home Decor">
                    Home Decor & Handicrafts
                  </option>
                  <option value="Fashion Accessories">
                    Fashion Accessories
                  </option>
                  <option value="Dangerous Goods">
                  Dangerous Goods
                  </option>
                  <option value="Footwear">
                  Footwear
                  </option>
                  <option value="Food">Food</option>
                  <option value="Spices">Spices</option>
          </select>

          <select className="input" defaultValue=""
            onChange={(e) => setManualInput(p => ({ ...p, destination: e.target.value }))}>
            <option value="">Select Destination Country</option>
            <option value="Bangladesh">Bangladesh</option>
            <option value="Germany">Germany</option>
            <option value="UAE">UAE</option>
            <option value="UK">United Kingdom</option>
            <option value="USA">United States</option>
            <option value="Indonesia">Indonesia</option>
            <option value="Malaysia">Malaysia</option>
            <option value="Netherlands">Netherlands</option>
            <option value="Singapore">Singapore</option>
            <option value="SouthKorea">South Korea</option>
          </select>

          <input className="input border p-2 col-span-2"
            placeholder="Enter HS Code"
            onChange={e => setManualInput(p => ({ ...p, hsCode: e.target.value }))} />
        </div>

        {/* RUN AI */}
        <button
          className="w-full mt-6 bg-green-700 py-2 text-white rounded-lg"
          disabled={aiLoading}
          onClick={runAiRisk}
        >
          {aiLoading ? "AI Evaluating..." : "Run AI Evaluation"}
        </button>

        {/* SHOW AI RESULT */}
        {aiRisk && (
          <div className="mt-10 bg-[#EDE8F5] border border-green-700 p-6 rounded-xl">
            <h2 className="text-2xl font-bold text-black mb-3">AI Compliance Assessment</h2>

            <p><b>HS Code:</b> {aiRisk.hsCode} ({(aiRisk.confidence * 100).toFixed(1)}% confidence)</p>
            <p><b>Risk Level:</b> <span className={riskLevelColor(aiRisk.riskLevel)}>
              {aiRisk.riskLevel}
            </span> ({aiRisk.riskScore}%)</p>

            <h3 className="font-semibold mt-4">Required Documents:</h3>
            <ul className="list-disc ml-6">
              {aiRisk.requiredDocuments?.map((d, i) => <li key={i}>{d}</li>)}
            </ul>

            <h3 className="font-semibold mt-4">Key Risks:</h3>
            <ul className="list-disc ml-6">
              {aiRisk.keyRisks?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>

            <h3 className="font-semibold mt-4">Recommendations:</h3>
            <ul className="list-disc ml-6">
              {aiRisk.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>

            <p className="mt-4 text-sm text-gray-700">{aiRisk.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
