import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ requiredRole, children }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
