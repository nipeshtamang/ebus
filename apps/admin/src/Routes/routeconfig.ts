import { lazy } from "react";
import ROUTES from "./routes";

// Lazy load components for code splitting
const AdminDashboard = lazy(() => import("@/pages/Admindashboard"));
const LoginPage = lazy(() => import("@/pages/Authentication/Loginpage").then(module => ({ default: module.LoginPage })));
const ForgotPassword = lazy(() => import("@/pages/Authentication/ForgotPassword"));
const ScheduleList = lazy(() => import("@/pages/Schedules/ScheduleList").then(module => ({ default: module.ScheduleList })));
const BookingList = lazy(() => import("@/pages/Bookings/BookingList").then(module => ({ default: module.BookingList })));
const BookingForm = lazy(() => import("@/pages/Bookings/BookingForm").then(module => ({ default: module.BookingForm })));
const PaymentHistory = lazy(() => import("@/pages/Payments/PaymentHistory").then(module => ({ default: module.PaymentHistory })));
const BusSearchPage = lazy(() => import("@/pages/BusSearchPage").then(module => ({ default: module.BusSearchPage })));
const Profile = lazy(() => import("@/pages/Profile"));

const routeconfig = [
  { path: ROUTES.LoginPage, Component: LoginPage },
  { path: ROUTES.ForgotPassword, Component: ForgotPassword },
  { path: ROUTES.AdminDashboard, Component: AdminDashboard },
  { path: ROUTES.ScheduleList, Component: ScheduleList },
  { path: ROUTES.BookingList, Component: BookingList },
  { path: ROUTES.BookingForm, Component: BookingForm },
  { path: ROUTES.PaymentHistory, Component: PaymentHistory },
  { path: ROUTES.BusSearchPage, Component: BusSearchPage },
  { path: ROUTES.Profile, Component: Profile },
];

export default routeconfig;
