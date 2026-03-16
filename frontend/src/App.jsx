import React, { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import LoginPage from "./pages/Login";
import Teacher from "./pages/Teacher";
import Parent from "./pages/Parent";
import Student from "./pages/Student";
import Home from "./pages/Home";
import VerifyEmail from "./pages/VerifyEmail";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";

function getTokenByKey(key) {
  return localStorage.getItem(key) || "";
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function ProtectedRoute({ tokenKey, children }) {
  const loc = useLocation();
  const token = getTokenByKey(tokenKey);

  if (!token) {
    const next = encodeURIComponent(loc.pathname + (loc.search || ""));
    const role =
      tokenKey === "TEACHER_TOKEN"
        ? "teacher"
        : tokenKey === "STUDENT_TOKEN"
          ? "student"
          : tokenKey === "ADMIN_TOKEN"
            ? "admin"
            : "parent";

    return <Navigate to={`/login?role=${role}&next=${next}`} replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute tokenKey="ADMIN_TOKEN">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute tokenKey="TEACHER_TOKEN">
              <Teacher />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student"
          element={
            <ProtectedRoute tokenKey="STUDENT_TOKEN">
              <Student />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parent"
          element={
            <ProtectedRoute tokenKey="PARENT_TOKEN">
              <Parent />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
