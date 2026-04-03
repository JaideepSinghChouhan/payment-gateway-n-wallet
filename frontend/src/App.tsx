import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import DashboardPage from "@/pages/DashboardPage";
import TransactionHistoryPage from "@/pages/TransactionHistoryPage";
import MerchantPage from "@/pages/MerchantPage";
import MerchantDashboardPage from "@/pages/MerchantDashboardPage";
import PayOrderPage from "@/pages/PayOrderPage";
import { Loader2 } from "lucide-react";

// Role-based router: merchants go to /merchant/dashboard, consumers stay on /dashboard
function DashboardRouter() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
      </div>
    );
  }
  if (user?.merchant) return <Navigate to="/merchant/dashboard" replace />;
  return <DashboardPage />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Smart /dashboard — redirects merchants automatically */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />

          {/* Consumer-only */}
          <Route path="/transactions" element={<ProtectedRoute><TransactionHistoryPage /></ProtectedRoute>} />
          <Route path="/pay" element={<ProtectedRoute><PayOrderPage /></ProtectedRoute>} />

          {/* Become merchant (onboarding page — redirect away if already merchant) */}
          <Route path="/merchant" element={<ProtectedRoute><MerchantPage /></ProtectedRoute>} />

          {/* Dedicated merchant dashboard */}
          <Route path="/merchant/dashboard" element={<ProtectedRoute><MerchantDashboardPage /></ProtectedRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
