import { lazy } from "react";
import ROUTES from "./routes";

// Lazy load components for code splitting
const SuperadminLoginPage = lazy(() => import("@/pages/Authentication/SuperadminLoginPage").then(module => ({ default: module.SuperadminLoginPage })));
const SuperAdminDashboard = lazy(() => import("@/pages/SuperAdminDashboard"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const FleetManagement = lazy(() => import("@/pages/FleetManagement"));
const SystemHealth = lazy(() => import("@/pages/SystemHealth"));
const Reports = lazy(() => import("@/pages/Reports"));
const Profile = lazy(() => import("@/pages/Profile"));
const SystemLogs = lazy(() => import("@/pages/SystemLogs"));
const Bookings = lazy(() => import("@/pages/Bookings"));
const Payments = lazy(() => import("@/pages/Payments"));
const Tickets = lazy(() => import("@/pages/Tickets"));

const routeconfig = [
  { path: ROUTES.LoginPage, Component: SuperadminLoginPage },
  { path: ROUTES.AdminDashboard, Component: SuperAdminDashboard },
  { path: ROUTES.UserManagement, Component: UserManagement },
  { path: ROUTES.FleetManagement, Component: FleetManagement },
  { path: ROUTES.SystemLogs, Component: SystemLogs },
  { path: ROUTES.SystemHealth, Component: SystemHealth },
  { path: ROUTES.Reports, Component: Reports },
  { path: ROUTES.Profile, Component: Profile },
  { path: ROUTES.BookingList, Component: Bookings },
  { path: ROUTES.PaymentHistory, Component: Payments },
  { path: ROUTES.Tickets, Component: Tickets },
];

export default routeconfig;
