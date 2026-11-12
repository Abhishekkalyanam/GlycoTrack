import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddReading from "./pages/AddReading";
import ReadingHistory from "./pages/ReadingHistory";
import DailyReport from "./pages/DailyReport";
import MonthToDateReport from "./pages/MonthToDateReport";
import PreviousMonthReport from "./pages/PreviousMonthReport";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#171917]">
          <div className="w-9 h-9 border-3 border-[#101310] border-t-[#C5F53C] rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#777D78]">
            Loading GlycoTrack...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#171917]">
          <div className="w-9 h-9 border-3 border-[#101310] border-t-[#C5F53C] rounded-full animate-spin" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#777D78]">
            Loading GlycoTrack...
          </span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected App Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-reading"
              element={
                <ProtectedRoute>
                  <AddReading />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <ReadingHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/daily"
              element={
                <ProtectedRoute>
                  <DailyReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/month-to-date"
              element={
                <ProtectedRoute>
                  <MonthToDateReport />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports/previous-month"
              element={
                <ProtectedRoute>
                  <PreviousMonthReport />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
