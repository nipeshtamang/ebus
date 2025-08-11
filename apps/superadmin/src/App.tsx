import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/index.css";
import routeconfig from "./Routes/routeconfig";
import ProtectedRoute from "./components/ProtectedRoute";
import { SuperAdminLayout } from "./layouts/SuperAdminLayout";

function App() {
  const LoginComponent = routeconfig[0].Component;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginComponent />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <SuperAdminLayout>
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
            </SuperAdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
