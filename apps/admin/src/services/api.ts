import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "/api", // Use relative URL to work with Vite proxy
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear auth data and redirect to login
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      delete api.defaults.headers.common["Authorization"];

      // Redirect to login page if not already there
      if (window.location.pathname !== "/LoginPage") {
        window.location.href = "/LoginPage";
      }
    }

    // Handle other errors
    if (error.response?.status >= 500) {
      console.error("Server error:", error.response.data);
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  sendOTP: (data: { email: string }) => api.post("/auth/send-otp", data),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post("/auth/reset-password", data),
};

// Schedule APIs
export const scheduleAPI = {
  getAllSchedules: () => api.get("/schedules"),

  getScheduleById: (id: number) => api.get(`/schedules/${id}`),

  searchSchedules: (params: {
    departureDate?: string;
    routeId?: number;
    isReturn?: boolean;
    origin?: string;
    destination?: string;
  }) => api.get("/schedules/search", { params }),

  // Admin schedule management
  createSchedule: (data: {
    routeId: number;
    busId: number;
    departure: string;
    isReturn?: boolean;
    fare: number;
  }) => api.post("/schedules", data),

  updateSchedule: (
    id: number,
    data: {
      routeId?: number;
      busId?: number;
      departure?: string;
      isReturn?: boolean;
      fare?: number;
    }
  ) => api.patch(`/schedules/${id}`, data),

  deleteSchedule: (id: number) => api.delete(`/schedules/${id}`),

  regenerateSeats: (id: number) =>
    api.post(`/schedules/${id}/regenerate-seats`),
};

// Booking APIs
export const bookingAPI = {
  getMyBookings: () => api.get("/bookings/me"),

  createBooking: (data: { scheduleId: number; seatNumbers: string[] }) =>
    api.post("/bookings", data),

  cancelBooking: (bookingId: number) =>
    api.delete(`/bookings/${bookingId}/cancel`),

  processPayment: (
    orderId: number,
    data: {
      amount: number;
      method: string;
    }
  ) => api.post(`/bookings/${orderId}/payments`, data),

  // Admin booking management
  getAllBookings: (params?: {
    page?: number;
    limit?: number;
    userId?: number;
    status?: string;
  }) => api.get("/bookings", { params }),

  getBookingById: (id: number) => api.get(`/bookings/${id}`),

  createBookingForUser: (data: {
    userId?: number;
    scheduleId: number;
    passengers: Array<{
      seatNumber: string;
      passengerName: string;
      passengerPhone: string;
      passengerEmail: string;
      passengerIdNumber?: string;
    }>;
    bookerName: string;
    bookerPhone: string;
    bookerEmail?: string;
    paymentMethod?: string;
  }) => api.post("/bookings/admin", data),

  updateBookingStatus: (
    id: number,
    data: { status: string; reason?: string }
  ) => api.patch(`/bookings/${id}/status`, data),

  adminCancelBooking: (id: number, data: { reason?: string }) =>
    api.delete(`/bookings/${id}/cancel-admin`, { data }),

  // Development utility
  resetSeatStatus: (scheduleId: number) =>
    api.post(`/bookings/reset-seats/${scheduleId}`),

  // Development utility to cleanup orphaned bookings
  cleanupOrphanedBookings: () => api.post("/bookings/cleanup-orphaned"),

  // Get ticket by ticket number (returns all bookings for the ticket)
  getTicketByNumber: (ticketNumber: string) =>
    api.get(`/bookings/ticket/${ticketNumber}`),

  // Remove a seat from a booking (admin)
  removeSeatFromBooking: (bookingId: number, seatNumber: string) =>
    api.delete(`/bookings/${bookingId}/seat/${seatNumber}`),
};

// Payment APIs
export const paymentAPI = {
  getPaymentHistory: (params?: {
    page?: number;
    limit?: number;
    userId?: number;
    status?: string;
  }) => api.get("/payments", { params }),

  getPaymentById: (id: number) => api.get(`/payments/${id}`),

  processPayment: (data: {
    bookingId: number;
    amount: number;
    method: string;
  }) => api.post("/payments", data),

  refundPayment: (paymentId: number, data: { reason: string }) =>
    api.post(`/payments/${paymentId}/refund`, data),
};

// User Management APIs (Super Admin only)
export const userAPI = {
  getAllUsers: () => api.get("/users"),

  getUserById: (id: number) => api.get(`/users/${id}`),

  updateUserRole: (id: number, data: { role: string }) =>
    api.patch(`/users/${id}/role`, data),

  deleteUser: (id: number) => api.delete(`/users/${id}`),

  // Profile management
  updateProfile: (data: {
    name?: string;
    phoneNumber?: string;
    profileImage?: string;
  }) => api.patch("/users/profile", data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch("/users/change-password", data),
};

// Fleet Management APIs
export const fleetAPI = {
  // Routes
  getAllRoutes: () => api.get("/fleet/routes"),
  getRouteById: (id: number) => api.get(`/fleet/routes/${id}`),
  createRoute: (data: { name: string; origin: string; destination: string }) =>
    api.post("/fleet/routes", data),
  updateRoute: (
    id: number,
    data: {
      name?: string;
      origin?: string;
      destination?: string;
    }
  ) => api.patch(`/fleet/routes/${id}`, data),
  deleteRoute: (id: number) => api.delete(`/fleet/routes/${id}`),

  // Buses
  getAllBuses: () => api.get("/fleet/buses"),
  getBusById: (id: number) => api.get(`/fleet/buses/${id}`),
  createBus: (data: { name: string; layoutType: string; seatCount: number }) =>
    api.post("/fleet/buses", data),
  updateBus: (
    id: number,
    data: {
      name?: string;
      layoutType?: string;
      seatCount?: number;
    }
  ) => api.patch(`/fleet/buses/${id}`, data),
  deleteBus: (id: number) => api.delete(`/fleet/buses/${id}`),

  // Locations
  getAllLocations: () => api.get("/fleet/locations"),
};

// Dashboard APIs (Super Admin only)
export const dashboardAPI = {
  getRevenueTrends: () => api.get("/admin/dashboard/revenue"),

  getSeatUtilization: () => api.get("/admin/dashboard/seat-utilization"),

  getCancellationStats: () => api.get("/admin/dashboard/cancellations"),

  getReservationHolds: () => api.get("/admin/dashboard/reservation-holds"),

  getAuditLogs: () => api.get("/admin/audit-logs"),
};

export default api;
