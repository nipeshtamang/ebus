const ROUTES = {
  // Authentication
  Root: "/",
  LoginPage: "/login",
  ForgotPassword: "/forgot-password",
  ResetPassword: "/reset-password",

  // Dashboard
  AdminDashboard: "/dashboard",

  // User Management
  UserManagement: "/users",
  CreateUser: "/users/create",
  EditUser: "/users/:id/edit",

  // System Management
  SystemLogs: "/system/logs",
  SystemHealth: "/system/health",

  // Fleet Management
  FleetManagement: "/fleet",
  Routes: "/fleet/routes",
  Buses: "/fleet/buses",
  Schedules: "/fleet/schedules",

  // Reports
  Reports: "/reports",
  Analytics: "/reports/analytics",

  // Schedules
  ScheduleList: "/schedules",
  ScheduleDetails: "/schedules/:id",

  // Bookings
  BookingList: "/bookings",
  BookingForm: "/bookings/new",
  BookingDetails: "/bookings/:id",

  // Payments
  PaymentHistory: "/payments",

  // Tickets
  Tickets: "/tickets",

  // Profile
  Profile: "/profile",

  // Additional routes for navigation
  BusTicketbooking: "/bus-booking",
  BusSearchPage: "/bus-search",
};

export default ROUTES;
