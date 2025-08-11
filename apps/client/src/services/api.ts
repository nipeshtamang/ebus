import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "/api", // Use relative URL to work with Vite proxy
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // 10 second timeout
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      // Redirect to login if not already there
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),

  register: (data: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  }) => api.post("/auth/register", data),

  sendOTP: (data: { email: string }) => api.post("/auth/send-otp", data),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post("/auth/reset-password", data),
};

// Location and Route APIs
export const locationAPI = {
  getAllLocations: () => api.get("/fleet/locations"),
  getAllRoutes: () => api.get("/fleet/routes"),
  getRouteById: (id: number) => api.get(`/fleet/routes/${id}`),
};

// Schedule APIs
export const scheduleAPI = {
  searchSchedules: (params: {
    departureDate?: string;
    routeId?: number;
    isReturn?: boolean;
    origin?: string;
    destination?: string;
  }) => api.get("/schedules", { params }),

  getScheduleById: (id: number) => api.get(`/schedules/${id}`),
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
};

// Payment APIs
export const paymentAPI = {
  getPaymentHistory: () => api.get("/payments"),

  getPaymentById: (id: number) => api.get(`/payments/${id}`),

  processPayment: (data: {
    bookingId: number;
    amount: number;
    method: string;
  }) => api.post("/payments", data),
};

export default api;
