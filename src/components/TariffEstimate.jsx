import { useState, useEffect } from 'react';
import api from "../api/axiosClient";

function FormInput({ label, name, type = "text", value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#7091E6] transition"
      />
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-[#7091E6]"
      >
        <option value="">Select {label}</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

export default function TariffEstimate() {
  const [selectedShipment, setSelectedShipment] = useState("");
  const [currentStep, setCurrentStep] = useState("form");
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState("");
  const [tariffResult, setTariffResult] = useState(null);
  const [isLoadingShipments, setLoadingShipments] = useState(false);
  const [shipments, setShipments] = useState([]);
  
  const [formData, setFormData] = useState({
    country: "",
    hsCode: "",
    value: "",
    weight: ""
  });

  // Fetch user shipments
  useEffect(() => {
    fetchUserShipments();
  }, []);

  const fetchUserShipments = async () => {
    setLoadingShipments(true);
    try {
      const response = await api.get('api/tariff/user-shipments');
      setShipments(response.data);
    } catch (err) {
      console.error('Error fetching shipments:', err);
      setError('Failed to load your shipments');
    } finally {
      setLoadingShipments(false);
    }
  };

  // Handle existing shipment selection - calls backend by shipment ID
  const handleExistingSelect = async (shipmentId) => {
    setSelectedShipment(shipmentId);
    setError("");
    
    if (shipmentId) {
      setIsCalculating(true);
      try {
        const response = await api.get(`api/tariff/tariffbyid/${shipmentId}`);
        setTariffResult(response.data);
        setCurrentStep("result");
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Error calculating tariff');
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle manual calculation - calls backend with user input
  const handleCalculate = async () => {
    setError("");
    setIsCalculating(true);

    try {
      const response = await api.post('api/tariff/tariffbyuser', {
        hscode: formData.hsCode,
        country: formData.country,
        value: parseInt(formData.value),
        weight: parseInt(formData.weight)
      });

      setTariffResult(response.data);
      setCurrentStep("result");
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Error calculating tariff');
    } finally {
      setIsCalculating(false);
    }
  };

  if (currentStep === "result" && tariffResult) {
    return (
      <div className="min-h-screen p-6 bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6]">
        <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6">
          <h2 className="text-2xl font-bold text-[#3D52A0] mb-4">
            Tariff Estimate Summary
          </h2>

          {selectedShipment && (
            <p className="mb-2"><strong>Shipment ID:</strong> {selectedShipment}</p>
          )}

          <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-[#7091E6]">
            <div className="space-y-2">
              <p className="text-lg"><strong>Duty Rate:</strong> {tariffResult.dutyRate}%</p>
              <p className="text-lg"><strong>GST Rate:</strong> {tariffResult.gstRate}%</p>
              <div className="border-t border-gray-300 my-3"></div>
              <p className="text-lg"><strong>Customs Duty:</strong> ₹{tariffResult.duty.toFixed(2)}</p>
              <p className="text-lg"><strong>GST:</strong> ₹{tariffResult.gst.toFixed(2)}</p>
              <div className="border-t-2 border-[#7091E6] my-3"></div>
              <p className="text-2xl font-bold text-[#7091E6]">
                Total Payable: ₹{tariffResult.totalPayable.toFixed(2)}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setCurrentStep("form");
              setTariffResult(null);
              setSelectedShipment("");
              setFormData({
                country: "",
                hsCode: "",
                value: "",
                weight: ""
              });
            }}
            className="mt-6 w-full py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EDE8F5] via-[#ADBBDA] to-[#7091E6] p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#3D52A0] mb-6">
          Tariff & Duty Estimator
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Existing Shipment Selection */}
        <div className="bg-white/90 p-6 rounded-lg shadow-md mb-6">
          <label className="font-semibold text-gray-700">
            View Tariff Estimate for Existing Shipment
          </label>
          
          <select
            className="w-full mt-2 p-3 border rounded-lg"
            onChange={(e) => handleExistingSelect(e.target.value)}
            value={selectedShipment}
            disabled={isCalculating || isLoadingShipments}
          >
            <option value="">
              {isLoadingShipments ? 'Loading shipments...' : 'Select Shipment ID'}
            </option>
            {shipments.map(id => (
              <option key={id} value={id}>
                Shipment ID: {id}
              </option>
            ))}
          </select>
        </div>

        {/* Separator */}
        <div className="text-center text-gray-600 mb-4 font-medium">
          — OR Calculate New Shipment —
        </div>

        {/* Manual Form */}
        <div className="bg-white/90 rounded-lg shadow-lg p-8">
          <FormSelect
            label="Destination Country"
            name="country"
            required
            value={formData.country}
            onChange={handleChange}
            options={["USA", "UAE", "UK", "Germany", "Netherlands", "Bangladesh", "Singapore", "South Korea", "Indonesia", "Malaysia"]}
          />

          <div className="grid grid-cols-2 gap-6 mt-4">
            <FormInput
              label="HS Code"
              name="hsCode"
              required
              value={formData.hsCode}
              onChange={handleChange}
              placeholder="e.g., 4202310010"
            />

            <FormInput
              label="Product Value (INR)"
              name="value"
              type="number"
              required
              value={formData.value}
              onChange={handleChange}
              placeholder="50000"
            />
          </div>

          <FormInput
            label="Weight (kg)"
            name="weight"
            type="number"
            required
            value={formData.weight}
            onChange={handleChange}
            placeholder="4"
          />

          <button
            onClick={handleCalculate}
            disabled={isCalculating || !formData.country || !formData.hsCode || !formData.value || !formData.weight}
            className="w-full mt-6 py-4 bg-[#7091E6] hover:bg-[#3D52A0] text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? "Calculating..." : "Calculate Tariff Estimate"}
          </button>
        </div>
      </div>
    </div>
  );
}
