import AdminDashboard from "@/pages/Admindashboard";
import ROUTES from "./routes";
import { LoginPage } from "@/pages/Authentication/Loginpage";
import ForgotPassword from "@/pages/Authentication/ForgotPassword";
import { ScheduleList } from "@/pages/Schedules/ScheduleList";
import { BookingList } from "@/pages/Bookings/BookingList";
import { BookingForm } from "@/pages/Bookings/BookingForm";
import { PaymentHistory } from "@/pages/Payments/PaymentHistory";
import { BusSearchPage } from "@/pages/BusSearchPage";
import Profile from "@/pages/Profile";

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
