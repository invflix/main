import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Login } from "./pages/auth/Login";
import { Signup } from "./pages/auth/Signup";
import { AcceptInvite } from "./pages/auth/AcceptInvite";
import { OnboardingWizard } from "./pages/onboarding/OnboardingWizard";
import { Dashboard } from "./pages/Dashboard";
import { InventoryList } from "./pages/inventory/InventoryList";
import { InventoryImportWizard } from "./pages/inventory/InventoryImportWizard";
import { ExpiryTracking } from "./pages/inventory/ExpiryTracking";
import { ClaimsList } from "./pages/claims/ClaimsList";
import { ClaimDetails } from "./pages/claims/ClaimDetails";
import { Sales } from "./pages/Sales";
import { Analytics } from "./pages/Analytics";
import { Branches } from "./pages/Branches";
import { Team } from "./pages/Team";
import { Settings } from "./pages/Settings";
import { SuperAdminDashboard } from "./pages/superadmin/SuperAdminDashboard";

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, organization, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default">
        <p className="text-sm font-semibold text-text-secondary">Loading your profile...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!organization && !user.is_platform_admin) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

const SuperAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-default">
        <p className="text-sm font-semibold text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!user || !user.is_platform_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/invite/accept" element={<AcceptInvite />} />
        
        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingWizard />
            </ProtectedRoute>
          }
        />

        {/* Protected Tenant routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="inventory" element={<InventoryList />} />
          <Route path="inventory/expiry" element={<ExpiryTracking />} />
          <Route path="inventory/import" element={<InventoryImportWizard />} />
          <Route path="claims" element={<ClaimsList />} />
          <Route path="claims/:id" element={<ClaimDetails />} />
          <Route path="sales" element={<Sales />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="branches" element={<Branches />} />
          <Route path="team" element={<Team />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Protected Platform Super Admin context */}
          <Route
            path="super-admin"
            element={
              <SuperAdminRoute>
                <SuperAdminDashboard />
              </SuperAdminRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}
