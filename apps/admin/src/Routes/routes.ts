const ROUTES = {
  // Authentication
  Root: "/",
  LoginPage: "/LoginPage",
  ForgotPassword: "/forgot-password",
  ResetPassword: "/reset-password",

  // Main Dashboard
  AdminDashboard: "/AdminDashboard",

  // Schedules
  ScheduleList: "/schedules",
  ScheduleDetails: "/schedules/:id",

  // Bookings
  BookingList: "/bookings",
  BookingForm: "/bookings/new",
  BookingDetails: "/bookings/:id",

  // Payments
  PaymentHistory: "/payments",

  // Profile
  Profile: "/profile",

  // Additional routes for navigation
  BusTicketbooking: "/bus-booking",
  BusSearchPage: "/bus-search",
};

export default ROUTES;
