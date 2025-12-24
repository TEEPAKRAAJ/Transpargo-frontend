import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { createShipment } from "../api/shipmentApi";




/* ================= GLOBAL VALIDATION ================= */
const REGEX = {
  english: /^[A-Za-z .'-]{2,50}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[\d\s()-]{7,20}$/,
  postal: /^[A-Za-z0-9 -]{3,10}$/,
  number: /^\d+(\.\d{1,2})?$/
};




export default function CreateShipmentForm() {
  const savedEmail = localStorage.getItem("email") || "";
  const navigate = useNavigate();




  const COUNTRIES = [
    "Bangladesh","Germany","UAE","UK","USA",
    "Indonesia","Malaysia","Netherlands",
    "Singapore","South Korea",
  ];




  /* ================= FORM STATE ================= */
  const [form, setForm] = useState({
    sender: {
      name: "", email: savedEmail, phone: "",
      address1: "", address2: "", city: "",
      state: "", postal: "", country: "India",
    },
    receiver: {
      name: "", email: "", phone: "",
      address1: "", address2: "", city: "",
      state: "", postal: "", country: "",
    },
    shipment: {
      type: "", packages: "", weight: "",
      special_notes: "", quantity: "",
    },
    product: {
      category: "", value: "", description: "",
      composition: "", intended_use: "",
    },
    dimensions: {
      length: "", width: "", height: "", unit: "cm",
    },
    dutyMode: "",
    hsCode: "Auto-detecting...",
    destinationHsCode: "",
  });




  const totalSteps = 6;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingHs, setLoadingHs] = useState(false);




  /* ================= ERROR STATE ================= */
  const [errors, setErrors] = useState({});




  /* ================= VALIDATION ENGINE ================= */
  const validateField = (section, field, value) => {
    let msg = "";




    if (["name","city","state"].includes(field) && !REGEX.english.test(value))
      msg = "Only English letters allowed";




    if (field === "email" && !REGEX.email.test(value))
      msg = "Invalid email";




    if (field === "phone" && !REGEX.phone.test(value))
      msg = "Invalid phone number";




    if (field === "postal" && !REGEX.postal.test(value))
      msg = "Invalid postal code";




    if (
      ["packages","weight","quantity","value","length","width","height"].includes(field) &&
      (!REGEX.number.test(value) || Number(value) <= 0)
    )
      msg = "Invalid number";




    setErrors(prev => ({ ...prev, [`${section}.${field}`]: msg }));
  };




  const updateForm = (section, field, value) => {
    validateField(section, field, value);
    setForm(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };




  /* ================= STEP VALIDATION ================= */
  const stepFields = {
    1: [
      "sender.name","sender.phone","sender.address1",
      "sender.city","sender.state","sender.postal"
    ],
    2: [
      "receiver.name","receiver.email","receiver.phone",
      "receiver.address1","receiver.city",
      "receiver.state","receiver.postal","receiver.country"
    ],
    3: [
      "shipment.type","shipment.packages","shipment.weight",
      "shipment.quantity","dimensions.length",
      "dimensions.width","dimensions.height",
    ],
    4: [
      "product.category","product.value",
      "product.description","product.composition","product.intended_use"
    ],
   
  };
const validateDutyMode = () => {
  if (!form.dutyMode) {
    return "Duty Mode: Please select DDP or DAP";
  }
  return "";
};




const validateHsCode = () => {
  if (!form.hsCode || form.hsCode === "Auto-detecting...") {
    return "HS Code: Please fetch HS Code using AI";
  }
  return "";
};




const showStep5Errors = () => {
  const messages = [];




  const dutyError = validateDutyMode();
  if (dutyError) messages.push("• " + dutyError);




  const hsError = validateHsCode();
  if (hsError) messages.push("• " + hsError);




  if (messages.length) {
    alert("Please fix the following errors:\n\n" + messages.join("\n"));
    return true; // has errors
  }




  return false; // no errors
};












  const validateStep = () =>
    !stepFields[currentStep]?.some(key => {
      const [s,f] = key.split(".");
      return errors[key] || !form[s][f];
    });
    const showErrors = () => {
  const messages = Object.entries(errors)
    .filter(([_, msg]) => msg)
    .map(([key, msg]) => {
      const label = key
        .replace(".", " → ")
        .replace(/_/g, " ")
        .replace(/\b\w/g, l => l.toUpperCase());
      return `• ${label}: ${msg}`;
    });




  if (messages.length) {
    alert("Please fix the following errors:\n\n" + messages.join("\n"));
    return true;
  }
  return false;
};








 const nextStep = () => {
  if (currentStep === 5) {
    if (showStep5Errors()) return;
  } else {
    if (!validateStep()) {
      showErrors();
      return;
    }
  }




  if (currentStep < totalSteps) {
    setCurrentStep(prev => prev + 1);
  }
};








  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };




  /* ================= HS CODE ================= */
  const handleFetchHsCode = async () => {
  try {
    setLoadingHs(true);




    const payload = {
      DestinationCountry: form.receiver.country,
      Category: form.product.category,
      Material: form.product.composition,
      ProductDescription: form.product.description
    };




    const res = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/hs-code/fetch`,
      payload,
      { headers: { "Content-Type": "application/json" } }
    );




    const hsData = res.data;
    if(hsData.indian_hs_code=="NO HS CODE FOUND"){
    alert("Shipment of this product is not handled by the agency. Contact the agent for more details.");
    navigate(`/user`);
  }




    setForm(p => ({
      ...p,
      hsCode: hsData.indian_hs_code.toString().replace(/\D/g, ""),           // Indian HS Code
      destinationHsCode: hsData.destination_hs_code  // Destination HS Code
    }));
    




  } catch (error) {
    console.error(error);
    alert("Failed to fetch HS Code");
  } finally {
    setLoadingHs(false);
  }
};




  /* ================= SUBMIT ================= */
 const handleSubmit = async (e) => {
  e.preventDefault();




  if (currentStep === 5 && showStep5Errors()) return;




  if (!validateStep()) {
    showErrors();
    return;
  }




  try {
    setLoading(true);
    console.log("Submitting shipment:", form);
    const userId = localStorage.getItem("ID");
    const payload = {
    status: "Shipment created",
    duty_mode: form.dutyMode,
    shipping_cost: 0,
    user_id:Number(userId ),
    reason: "",




    sender_name: form.sender.name,
    sender_email: form.sender.email,
    sender_phone: form.sender.phone,
    sender_address1: form.sender.address1,
    sender_city: form.sender.city,
    sender_state: form.sender.state,
    sender_postal: form.sender.postal,
    sender_country: form.sender.country,




    receiver_name: form.receiver.name,
    receiver_email: form.receiver.email,
    receiver_phone: form.receiver.phone,
    receiver_address1: form.receiver.address1,
    receiver_city: form.receiver.city,
    receiver_state: form.receiver.state,
    receiver_postal: form.receiver.postal,
    receiver_country: form.receiver.country,




    shipment_type: form.shipment.type,
    packages: Number(form.shipment.packages),
    weight: Number(form.shipment.weight),




    dimensions_length: Number(form.dimensions.length),
    dimensions_width: Number(form.dimensions.width),
    dimensions_height: Number(form.dimensions.height),




    special_notes: form.shipment.special_notes,
    quantity: Number(form.shipment.quantity),




    product_category: form.product.category,
    product_value: Number(form.product.value),
    product_description: form.product.description,
    product_composition: form.product.composition,
    intended_use: form.product.intended_use,




    hs_code: form.hsCode,                 // Indian HS
    destinationHsCode: form.destinationHsCode // Destination HS
  };
    await createShipment(payload);
    alert("Shipment Created Successfully!");
  } catch {
    alert("Failed to create shipments");
  } finally {
    setLoading(false);
    navigate(`/user`);
  }
};












  /* ================= AI RISK ================= */
  const API_AI = `${import.meta.env.VITE_API_BASE_URL}/api/airisk/analyze`;
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRisk, setAiRisk] = useState(null);




  const runAiRisk = async () => {
    if (
      !form.product.category ||
      !form.product.description ||
      !form.hsCode ||
      form.hsCode === "Auto-detecting..." ||
      !form.receiver.country
    ) return;




    setAiLoading(true);
    try {
      const res = await fetch(API_AI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCategory: form.product.category,
          destinationCountry: form.receiver.country,
          hsCode: form.hsCode,
        })
      });
      setAiRisk(await res.json());
    } finally {
      setAiLoading(false);
    }
  };




  useEffect(() => {
    runAiRisk();
  }, [form.hsCode, form.product.category, form.product.description, form.receiver.country]);




  /* ================= UI ================= */
  const inputClass =
    "w-full p-3 border rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-[#7091E6]";




  return (
    <div
      className="min-h-screen w-full px-5 py-10 md:px-20"
      style={{
        background:
          "linear-gradient(to bottom, #FFFFFF, #EDE8F5, #ADBBD4, #8697C4, #7091E6)",
      }}
    >
      <div className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl border border-[#3D52A0]">
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-8">
          Create Shipment
        </h1>








        <form onSubmit={handleSubmit} className="space-y-10">








          {/* ===================== STEP 1 — SENDER ===================== */}
          {currentStep === 1 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Sender Information</h2>








              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className={inputClass}
                  placeholder="Sender Name"
                  required
                  value={form.sender.name}
                  onChange={(e) => updateForm("sender", "name", e.target.value)}
                />








                <input
                  className={`${inputClass} bg-gray-200`}
                  placeholder="Sender Email"
                  value={form.sender.email}
                  readOnly
                />








                <input
                  className={inputClass}
                  placeholder="Phone"
                  required
                  value={form.sender.phone}
                  onChange={(e) => updateForm("sender", "phone", e.target.value)}
                />








                <input
                  className={inputClass}
                  placeholder="Address Line 1"
                  required
                  value={form.sender.address1}
                  onChange={(e) => updateForm("sender", "address1", e.target.value)}
                />








                <input
                  className={inputClass}
                  placeholder="Address Line 2 (Optional)"
                  value={form.sender.address2}
                  onChange={(e) => updateForm("sender", "address2", e.target.value)}
                />








                <input
                  className={inputClass}
                  placeholder="City"
                  required
                  value={form.sender.city}
                  onChange={(e) => updateForm("sender", "city", e.target.value)}
                />








                <input
                  className={inputClass}
                  placeholder="State"
                  required
                  value={form.sender.state}
                  onChange={(e) => updateForm("sender", "state", e.target.value)}
                />








                <input
                  className={inputClass}
                  placeholder="Postal Code"
                  required
                  value={form.sender.postal}
                  onChange={(e) => updateForm("sender", "postal", e.target.value)}
                />








                <input
                  className={`${inputClass} bg-gray-200 cursor-not-allowed`}
                  value="India"
                  readOnly
                />
















              </div>
            </section>
          )}








          {/* ===================== STEP 2 — RECEIVER ===================== */}
          {currentStep === 2 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Receiver Information</h2>








              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className={inputClass}
                  placeholder="Receiver Name"
                  required
                  value={form.receiver.name}
                  onChange={(e) => updateForm("receiver", "name", e.target.value)}
                />








                <input
                  className={inputClass}
                  placeholder="Receiver Email"
                  type="email"
                  required
                  value={form.receiver.email}
                  onChange={(e) => updateForm("receiver", "email", e.target.value)}
                />








                <input
                  className={inputClass}
                  placeholder="Phone"
                  required
                  value={form.receiver.phone}
                  onChange={(e) => updateForm("receiver", "phone", e.target.value)}
                />








                <input
                  className={inputClass}
                  placeholder="Address Line 1"
                  required
                  value={form.receiver.address1}
                  onChange={(e) =>
                    updateForm("receiver", "address1", e.target.value)
                  }
                />








                <input
                  className={inputClass}
                  placeholder="Address Line 2 (Optional)"
                  value={form.receiver.address2}
                  onChange={(e) =>
                    updateForm("receiver", "address2", e.target.value)
                  }
                />








                <input
                  className={inputClass}
                  placeholder="City"
                  required
                  value={form.receiver.city}
                  onChange={(e) =>
                    updateForm("receiver", "city", e.target.value)
                  }
                />








                <input
                  className={inputClass}
                  placeholder="State"
                  required
                  value={form.receiver.state}
                  onChange={(e) =>
                    updateForm("receiver", "state", e.target.value)
                  }
                />








                <input
                  className={inputClass}
                  placeholder="Postal Code"
                  required
                  value={form.receiver.postal}
                  onChange={(e) =>
                    updateForm("receiver", "postal", e.target.value)
                  }
                />








                  <select
                    className={inputClass}
                    required
                    value={form.receiver.country}
                    onChange={(e) => updateForm("receiver", "country", e.target.value)}
                  >
                    <option value="">Select Country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>








             
              </div>
            </section>
          )}








          {/* ===================== STEP 3 — SHIPMENT ===================== */}
          {currentStep === 3 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Shipment Details</h2>








              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
  className={inputClass}
  required
  value={form.shipment.type}
  onChange={(e) => updateForm("shipment", "type", e.target.value)}
>
  <option value="">Select Shipment Type</option>
  <option value="Air Freight">Air Freight</option>
  <option value="Water Freight">Water Freight</option>
</select>












                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  placeholder="Number of Packages"
                  required
                  value={form.shipment.packages}
                  onChange={(e) =>
                    updateForm("shipment", "packages", e.target.value)
                  }
                />








                <input
                  className={inputClass}
                  type="number"
                  min="0.1"
                  step="0.01"
                  placeholder="Weight (kg)"
                  required
                  value={form.shipment.weight}
                  onChange={(e) =>
                    updateForm("shipment", "weight", e.target.value)
                  }
                />








                {/* Dimensions */}
                <div className="grid grid-cols-4 gap-2">
                  <input
                    className={inputClass}
                    type="number"
                    placeholder="L"
                    required
                    value={form.dimensions.length}
                    onChange={(e) =>
                      updateForm("dimensions", "length", e.target.value)
                    }
                  />








                  <input
                    className={inputClass}
                    type="number"
                    placeholder="W"
                    required
                    value={form.dimensions.width}
                    onChange={(e) =>
                      updateForm("dimensions", "width", e.target.value)
                    }
                  />








                  <input
                    className={inputClass}
                    type="number"
                    placeholder="H"
                    required
                    value={form.dimensions.height}
                    onChange={(e) =>
                      updateForm("dimensions", "height", e.target.value)
                    }
                  />








                  <select
                    className={inputClass}
                    value={form.dimensions.unit}
                    onChange={(e) =>
                      updateForm("dimensions", "unit", e.target.value)
                    }
                  >
                    <option value="cm">cm</option>
                    <option value="in">in</option>
                    <option value="ft">ft</option>
                    <option value="mm">mm</option>
                    <option value="m">m</option>
                  </select>
                </div>








                <input
                  className={inputClass}
                  placeholder="Special Handling Notes"
                  value={form.shipment.special_notes}
                  onChange={(e) =>
                    updateForm("shipment", "special_notes", e.target.value)
                  }
                />








                <input
                  className={inputClass}
                  type="number"
                  min="1"
                  placeholder="Quantity"
                  required
                  value={form.shipment.quantity}
                  onChange={(e) =>
                    updateForm("shipment", "quantity", e.target.value)
                  }
                />
              </div>
            </section>
          )}








          {/* ===================== STEP 4 — PRODUCT ===================== */}
          {currentStep === 4 && (
            <section>
              <h2 className="text-xl font-semibold mb-4">Product Details</h2>








              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">








                {/* PRODUCT CATEGORY DROPDOWN */}
                <select
                  className={inputClass}
                  required
                  value={form.product.category}
                  onChange={(e) =>
                    updateForm("product", "category", e.target.value)
                  }
                >
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








                <input
                  className={inputClass}
                  type="number"
                  placeholder="Value (₹)"
                  required
                  value={form.product.value}
                  onChange={(e) =>
                    updateForm("product", "value", e.target.value)
                  }
                />








                <textarea
                  className={`${inputClass} h-20`}
                  placeholder="Product Description"
                  required
                  value={form.product.description}
                  onChange={(e) =>
                    updateForm("product", "description", e.target.value)
                  }
                />








                <textarea
                  className={`${inputClass} h-20`}
                  placeholder="Composition"
                  required
                  value={form.product.composition}
                  onChange={(e) =>
                    updateForm("product", "composition", e.target.value)
                  }
                />








                <select
                  className={inputClass}
                  required
                  value={form.product.intended_use}
                  onChange={(e) =>
                    updateForm("product", "intended_use", e.target.value)
                  }
                >
                  <option value="">Select Intended Use</option>
                  <option value="Personal">Personal</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Resale">Resale</option>
                  <option value="Sample">Sample</option>
                </select>
              </div>
            </section>
          )}
        {currentStep === 5 && (
  <section>
    {/* SECTION 1 — Duty Responsibility */}
    <h2 className="text-xl font-semibold mb-4">Duty Responsibility</h2>








    <div className="flex flex-col md:flex-row gap-6">
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="dutyMode"
          value="DDP"
          checked={form.dutyMode === "DDP"}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, dutyMode: e.target.value }))
          }
          required
        />
        DDP (Sender Pays Duty)
      </label>








      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="dutyMode"
          value="DAP"
          checked={form.dutyMode === "DAP"}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, dutyMode: e.target.value }))
          }
        />
        {errors.dutyMode && (
  <p className="text-red-600 text-sm mt-2">{errors.dutyMode}</p>
)}




        DAP (Receiver Pays Duty)
      </label>
    </div>








    {/* SECTION 2 — HS Code */}
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">HS Code</h2>








      <div className="flex flex-col md:flex-row gap-4">
        <input
          className={`${inputClass} flex-1`}
          readOnly
          value={form.hsCode}
        />
        {errors.hsCode && (
  <p className="text-red-600 text-sm mt-2">{errors.hsCode}</p>
)}












        <button
          type="button"
          onClick={handleFetchHsCode}
          disabled={loadingHs}
          className="px-6 py-3 bg-[#3D52A0] hover:bg-[#7091E6] text-white rounded-xl"
        >
          {loadingHs ? "Fetching..." : "AI Fetch"}
        </button>
      </div>
    </div>
  </section>
)}
{/* STEP 6 — AI Risk Evaluation */}
         {currentStep === 6 && (
  <section>
    <h2 className="text-xl font-semibold mb-4">AI Risk Assessment</h2>








    {aiLoading ? (
      <p>AI Evaluating...</p>
    ) : aiRisk ? (
      // ⬇⬇ Place your AI result card here ⬇⬇
      <div className="mt-10 bg-[#EDE8F5] border border-green-700 p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-black mb-3">AI Compliance Assessment</h2>








        <p><b>HS Code:</b> {aiRisk.hsCode} ({(aiRisk.confidence * 100).toFixed(1)}% confidence)</p>
        <p><b>Risk Level:</b>
          <span className={
            aiRisk.riskLevel === "Low" ? "text-green-600" :
            aiRisk.riskLevel === "Medium" ? "text-yellow-600" :
            "text-red-600"
          }>
            {aiRisk.riskLevel}
          </span> ({aiRisk.riskScore}%)
        </p>








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








    ) : (
      <p>Enter product details and fetch HS Code to view AI risk.</p>
    )}
  </section>
)}








          {/* ===================== NAVIGATION BUTTONS ===================== */}
          <div className="flex justify-between items-center pt-6">








            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-6 py-2 bg-[#3D52A0] text-white rounded-lg hover:bg-[#7091E6]"
              >
                ← Back
              </button>
            )}








            {currentStep < totalSteps && (
              <button
                type="button"
                onClick={nextStep}
                className="ml-auto px-6 py-2 bg-[#3D52A0] text-white rounded-lg hover:bg-[#7091E6]"
              >
                Next →
              </button>
            )}
          </div>








          {/* ===================== SUBMIT BUTTON ===================== */}
          {currentStep === totalSteps && (
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 bg-[#3D52A0] hover:bg-[#7091E6] text-white rounded-xl text-lg font-semibold"
            >
              {loading ? "Submitting..." : "Submit Shipment"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
}





