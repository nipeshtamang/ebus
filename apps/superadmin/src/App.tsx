import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/index.css";
import routeconfig from "./Routes/routeconfig";
import ProtectedRoute from "./components/ProtectedRoute";
import { SuperAdminLayout } from "./layouts/SuperAdminLayout";

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  const LoginComponent = routeconfig[0].Component;

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginComponent />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <SuperAdminLayout>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    {routeconfig.slice(1).map(({ path, Component }) => {
                      // Remove leading slash for nested routes
                      const routePath = path.startsWith("/") ? path.slice(1) : path;
                      return (
                        <Route
                          key={path}
                          path={routePath}
                          element={<Component />}
                        />
                      );
                    })}
                    <Route
                      path="*"
                      element={<Navigate to="/dashboard" replace />}
                    />
                  </Routes>
                </Suspense>
              </SuperAdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Suspense>
  );
}

export default App;
