import { SuperadminLoginPage } from "@/pages/Authentication/SuperadminLoginPage";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import UserManagement from "@/pages/UserManagement";
import ROUTES from "./routes";
import FleetManagement from "@/pages/FleetManagement";
import SystemHealth from "@/pages/SystemHealth";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import SystemLogs from "@/pages/SystemLogs";
import Bookings from "@/pages/Bookings";
import Payments from "@/pages/Payments";
import Tickets from "@/pages/Tickets";

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
