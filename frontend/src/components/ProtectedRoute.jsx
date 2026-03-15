import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ token, redirectTo, children }) {
  if (!token) return <Navigate to={redirectTo} replace />;
  return children;
}