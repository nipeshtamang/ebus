import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense } from "react";
import { useAuth } from "./context/AuthContext";
import routeconfig from "./Routes/routeconfig";
import ROUTES from "./Routes/routes";

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function AppRoutes() {
  const { user, isLoading, isInitialized } = useAuth();

  const publicRoutes = [ROUTES.LoginPage, ROUTES.ForgotPassword];
  const adminRoutes = routeconfig.filter(
    (route) => !publicRoutes.includes(route.path)
  );

  // Show loading spinner while initializing auth
  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-min-h-screen">
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={user ? ROUTES.AdminDashboard : ROUTES.LoginPage}
                replace
              />
            }
          />

          {/* Public routes - no layout */}
          {publicRoutes.map((routePath) => {
            const route = routeconfig.find((r) => r.path === routePath);
            return (
              <Route
                key={routePath}
                path={routePath}
                element={
                  user ? (
                    <Navigate to={ROUTES.AdminDashboard} replace />
                  ) : route ? (
                    <route.Component />
                  ) : (
                    <div>Page not found</div>
                  )
                }
              />
            );
          })}

          {/* Protected admin routes with layout */}
          {adminRoutes.map((route) => (
            <Route
              key={route.path}
              path={route.path}
              element={
                user ? (
                  <route.Component />
                ) : (
                  <Navigate to={ROUTES.LoginPage} replace />
                )
              }
            />
          ))}

          {/* Catch all route for 404 */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
                <div className="text-center">
                  <div className="flex aspect-square size-20 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg mx-auto mb-6">
                    <span className="text-4xl font-bold">404</span>
                  </div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                    Page Not Found
                  </h1>
                  <p className="text-gray-600 mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white px-6 py-2 rounded-lg transition-all duration-200"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
      </Suspense>
    </div>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
