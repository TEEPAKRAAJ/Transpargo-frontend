import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/login";
import Signup from "./components/signup";
import AdminDashboard from "./components/adminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import UserDashboard from "./components/userDashboard";
import DashboardLayout from "./components/DashboardLayout";
import TariffEstimate from "./components/TariffEstimate";
import ShipmentForm from "./components/shipmentForm";
import ShipmentTracking from "./components/Tracking";
import PaymentClearance from "./components/PaymentAndClearance";
import Analytics from "./components/Analytics";
import DocumentResolution from "./components/documentResolution";
import ShippingDashboard from "./components/ShippingDashboard";
import KnowledgeBase from "./components/knowledgeBase";
import RiskAnalysis from "./components/RiskAnalysis";
import DocumentUpload from "./components/DocumentUpload";
import ReceiverPage from "./components/ReceiverPage";
import ApprovePage from "./components/ApprovePage";
import CheckPage from "./components/CheckPage";
import NotifyPage from "./components/NotifyPage";
import DonePage from "./components/DonePage";
import Resetpassword from "./components/Resetpassword";
import ForgotPassword from "./components/forgotpassword";
import DutyTaxPayment from "./components/DutyTaxPayment";
import ReturnsPage from "./components/ReturnsPage";
import DestructionPage from "./components/DestructionPage";
import ChargesPayment from "./components/ChargesPayment";
import TermsAndConditions from "./components/TermsAndConditions";
import DangerousGoodsVisualizer from "./pages/DangerousGoodsVisualizer";
import Landing from "./pages/Landing"
import FeedbackDisplay from "./components/FeedbackDisplay";
import FeedbackComplaint from "./components/FeedbackComplaint";
import Profile from "./components/Profile"


export default function App() {
  const adminNav = [
    { label: "Dashboard", to: "/admin" },
    { label: "Profile", to: "/admin/profile" },
  ];

  const userNav = [
    { label: "Dashboard", to: "/user" },
    { label: "Create Shipment", to: "/user/shipment" },
    { label: "Tariff Estimation", to: "/user/tariff" },
    { label: "Risk Analysis", to: "/user/risk" },
    { label: "Knowledge Base", to: "/user/knowledgeBase" },
    { label: "Receive Shipment", to: "/user/receive" },
    { label: "Dangerous Goods Packing", to: "/user/dangerous" },
    { label: "Feedback & Complaint", to: "/user/feedback" },
    { label: "Profile", to: "/user/profile" },
  ];


  const shipNav = [
    { label: "Dashboard", to: "/Shipping_agency" },
    { label: "Feedbacks", to: "/Shipping_agency/feedbacks" },
    { label: "Analytics", to: "/Shipping_agency/analytics" },
    { label: "Profile", to: "/Shipping_agency/profile" },
  ];

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/resetpassword" element={<Resetpassword/>}/>
        <Route path="/forgotpassword" element={<ForgotPassword/>}/>
        <Route path="/termsandconditions" element={<TermsAndConditions/>}/>

        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardLayout navLinks={adminNav} title="Admin Panel" />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/profile" element={<Profile />} />
        </Route>

        <Route
          element={
            <ProtectedRoute requiredRole="user">
              <DashboardLayout navLinks={userNav} title="User Panel" />
            </ProtectedRoute>
          }
        >
          <Route path="user" element={<UserDashboard />} />
          <Route path="user/tariff" element={<TariffEstimate />} />
          <Route path="user/shipment" element={<ShipmentForm />} />
          <Route path="user/tracking/:type/:shipmentId" element={<ShipmentTracking />} />
          <Route path="user/payment/:type/:shipmentId" element={<PaymentClearance />} />
          <Route path="user/duty/:type/:shipmentId" element={<DutyTaxPayment />} />
          <Route path="user/charges/:type/:shipmentId" element={<ChargesPayment />} />
          <Route path="user/resolution/:type/:shipmentId" element={<DocumentResolution />} />
          <Route path="user/knowledgeBase" element={<KnowledgeBase />} />
          <Route path="user/risk" element={<RiskAnalysis />} />
          <Route path="user/upload/:type/:id" element={<DocumentUpload />} />
          <Route path="user/receive" element={<ReceiverPage />} />
          <Route path="user/dangerous" element={<DangerousGoodsVisualizer />} />
          <Route path="user/feedback" element={<FeedbackComplaint />} />
          <Route path="user/profile" element={<Profile />} />
        </Route>


        <Route
          element={
            <ProtectedRoute requiredRole="Shipping_agency">
              <DashboardLayout navLinks={shipNav} title="Shipping Agency Panel" />
            </ProtectedRoute>
          }
        >
          <Route path="/Shipping_agency" element={<ShippingDashboard />} />
          <Route path="/Shipping_agency/analytics" element={<Analytics />} />
          <Route path="/Shipping_agency/shipment/:shipmentId/approve" element={<ApprovePage />} />
          <Route path="/Shipping_agency/shipment/:shipmentId/check" element={<CheckPage />} />
          <Route path="/Shipping_agency/shipment/:shipmentId/notify" element={<NotifyPage />} />
          <Route path="/Shipping_agency/shipment/:shipmentId/done" element={<DonePage />} />
          <Route path="/Shipping_agency/shipment/:shipmentId/returns" element={<ReturnsPage />} />
          <Route path="/Shipping_agency/shipment/:shipmentId/destruction" element={<DestructionPage />} />
          <Route path="/Shipping_agency/feedbacks" element={<FeedbackDisplay />} />
          <Route path="/Shipping_agency/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}