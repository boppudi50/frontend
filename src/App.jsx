import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { RealtimeDataProvider } from "./context/RealtimeDataContext";
import { ToastProvider } from "./context/ToastContext";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AppSplashLoader } from "./components/common/AppSplashLoader";

// Pages
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { OrdersPage } from "./pages/operations/OrdersPage";
import { InventoryPage } from "./pages/operations/InventoryPage";
import { PickingPage } from "./pages/operations/PickingPage";
import { PackingQCPage } from "./pages/operations/PackingQCPage";
import { DispatchPage } from "./pages/operations/DispatchPage";
import { DockYardPage } from "./pages/operations/DockYardPage";
import { ReturnsPage } from "./pages/operations/ReturnsPage";
import { ExceptionCenter } from "./pages/operations/ExceptionCenter";
import { AnalyticsPage } from "./pages/operations/AnalyticsPage";
import { WarehouseMap } from "./pages/operations/WarehouseMap";
import { FinancePage } from "./pages/operations/FinancePage";
import { AuditLogsPage } from "./pages/admin/AuditLogsPage";
import { UsersManagement } from "./pages/admin/UsersManagement";
import { SystemSettings } from "./pages/admin/SystemSettings";
import { LoginPage } from "./pages/auth/LoginPage";

export function App() {
  const [showInitialSplash, setShowInitialSplash] = useState(true);

  return (
    <>
      {showInitialSplash && (
        <AppSplashLoader
          duration={1400}
          onComplete={() => setShowInitialSplash(false)}
        />
      )}
      <AuthProvider>
        <RealtimeDataProvider>
          <ToastProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Authentication Route */}
                <Route path="/login" element={<LoginPage />} />

              {/* Protected Workspace Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute requiredModule="orders">
                      <OrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="inventory"
                  element={
                    <ProtectedRoute requiredModule="inventory">
                      <InventoryPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="picking"
                  element={
                    <ProtectedRoute requiredModule="picking">
                      <PickingPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="packing-qc"
                  element={
                    <ProtectedRoute requiredModule="packing">
                      <PackingQCPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dispatch"
                  element={
                    <ProtectedRoute requiredModule="dispatch">
                      <DispatchPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="dock-yard"
                  element={
                    <ProtectedRoute requiredModule="yms">
                      <DockYardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="returns"
                  element={
                    <ProtectedRoute requiredModule="returns">
                      <ReturnsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="exceptions"
                  element={
                    <ProtectedRoute requiredModule="ALL">
                      <ExceptionCenter />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="analytics"
                  element={
                    <ProtectedRoute requiredModule="ALL">
                      <AnalyticsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="warehouse-map"
                  element={
                    <ProtectedRoute requiredModule="ALL">
                      <WarehouseMap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="finance"
                  element={
                    <ProtectedRoute requiredModule="finance">
                      <FinancePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="audit"
                  element={
                    <ProtectedRoute requiredModule="ALL">
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="audit-logs"
                  element={
                    <ProtectedRoute requiredModule="ALL">
                      <AuditLogsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <ProtectedRoute requiredModule="ALL">
                      <UsersManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="settings"
                  element={
                    <ProtectedRoute requiredModule="ALL">
                      <SystemSettings />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </RealtimeDataProvider>
    </AuthProvider>
    </>
  );
}

export default App;
