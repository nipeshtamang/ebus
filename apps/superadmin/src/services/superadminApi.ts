import axios, { AxiosRequestConfig } from "axios";

const API_BASE_URL =
  (import.meta as ImportMeta & { env: Record<string, string> }).env
    .VITE_API_URL || "http://localhost:3001/api";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("superadminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("superadminToken");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  role: "SUPERADMIN" | "ADMIN" | "CLIENT";
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
    payments: number;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: "SUPERADMIN" | "ADMIN" | "CLIENT";
  profileImage?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phoneNumber?: string;
  role?: "SUPERADMIN" | "ADMIN" | "CLIENT";
  profileImage?: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalClients: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: Array<{
    id: number;
    user?: { name: string; email: string };
    schedule: { route: { origin: string; destination: string } };
    status: string;
    createdAt: string;
  }>;
  recentUsers: User[];
  systemHealth: {
    databaseStatus: string;
    apiStatus: string;
    lastBackup: string | null;
    systemUptime: number;
    errorRate: number;
  };
}

export interface PaginatedResponse<T> {
  users: T[];
  total: number;
  totalPages: number;
}

export interface SystemLog {
  id: number;
  action: string;
  entity: string;
  entityId: number;
  before: unknown;
  after: unknown;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface TicketTableRow {
  id: number;
  ticketNumber: string;
  qrCode?: string;
  bookings: Array<{
    id: number;
    createdAt: string;
    status: string;
    seat?: { seatNumber: string };
    user?: { id: number; name: string; email: string; phoneNumber: string };
    schedule?: {
      departure: string;
      route?: { id: number; origin: string; destination: string };
      bus?: { id: number; name: string };
    };
    payment?: {
      id: number;
      amount: number;
      method: string;
      status: string;
      transactionId?: string;
    };
  }>;
}

export interface Bus {
  id: number;
  name: string;
  layoutType: string;
  seatCount: number;
  schedules: Array<{
    id: number;
    departure: string;
    route?: { id: number; name: string; origin: string; destination: string };
  }>;
}

export interface SummaryReport {
  revenue: {
    total: number;
    byMonth: Array<{ month: string; revenue: number }>;
    byRoute: Array<{ routeId: number; routeName: string; revenue: number }>;
    byPaymentMethod: Array<{ method: string; _sum: { amount: number } }>;
  };
  bookings: {
    total: number;
    byMonth: Array<{ month: string; count: number }>;
    byRoute: Array<{ routeId: number; routeName: string; count: number }>;
    byStatus: Array<{ status: string; _count: { status: number } }>;
  };
  users: {
    newByMonth: Array<{ month: string; count: number }>;
    activeByMonth: Array<{ month: string; count: number }>;
  };
  fleet: {
    busUsage: Array<{ busId: number; busName: string; trips: number }>;
    occupancyRate: Array<{ busId: number; busName: string; occupancy: number }>;
  };
}

export interface Route {
  id: number;
  name: string;
  origin: string;
  destination: string;
}

export interface Schedule {
  id: number;
  routeId: number;
  busId: number;
  departure: string;
  isReturn: boolean;
  fare: number;
}

// Bookings
export interface Booking {
  id: number;
  userId: number;
  scheduleId: number;
  seatId: number;
  status: string;
  createdAt: string;
  deletedAt?: string;
  user?: User;
  schedule?: Schedule;
  seat?: unknown;
  payment?: Payment;
}

// Payments
export interface Payment {
  id: number;
  userId: number;
  bookingId?: number;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  createdAt: string;
  deletedAt?: string;
  user?: User;
  booking?: Booking;
}

// Superadmin API functions
export const superAdminAPI = {
  // Authentication
  login: (data: { email: string; password: string }) =>
    api.post<{ token: string; user: User }>("/auth/login", data),

  forgotPassword: (data: { email: string }) => api.post("/auth/send-otp", data),

  verifyOTP: (data: { email: string; otp: string }) =>
    api.post("/auth/verify-otp", data),

  resetPassword: (data: { email: string; otp: string; newPassword: string }) =>
    api.post("/auth/reset-password", data),

  // Dashboard
  getDashboardStats: () =>
    api.get<DashboardStats>("/superadmin/dashboard/stats"),

  getRecentActivity: (limit?: number) =>
    api.get<SystemLog[]>("/superadmin/dashboard/recent-activity", {
      params: { limit },
    }),

  // User Management
  createUser: (data: CreateUserData) =>
    api.post<User>("/superadmin/users", data),

  getAllUsers: (
    page?: number,
    limit?: number,
    search?: string,
    role?: string
  ) =>
    api.get<PaginatedResponse<User>>("/superadmin/users", {
      params: {
        page,
        limit,
        ...(search ? { search } : {}),
        ...(role ? { role } : {}),
      },
    }),

  getUserById: (id: number) => api.get<User>(`/superadmin/users/${id}`),

  updateUser: (id: number, data: UpdateUserData) =>
    api.patch<User>(`/superadmin/users/${id}`, data),

  updateProfile: (data: UpdateUserData) =>
    api.patch<User>("/superadmin/profile", data),

  deleteUser: (id: number) => api.delete(`/superadmin/users/${id}`),

  // System Management
  cleanupOrphanedBookings: () =>
    api.post<{ cleanedCount: number }>("/superadmin/system/cleanup"),

  getSystemLogs: (limit?: number) =>
    api.get<SystemLog[]>("/superadmin/system/logs", {
      params: { limit },
    }),

  getPaginatedSystemLogs: (params: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    action?: string;
    entity?: string;
    userId?: number;
  }) =>
    api.get<{
      logs: SystemLog[];
      total: number;
      totalPages: number;
      currentPage: number;
    }>("/superadmin/system/logs", { params }),

  // Utility functions
  formatPrice: (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(price);
  },

  formatDate: (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  getStatusColor: (status: string) => {
    switch (status.toUpperCase()) {
      case "BOOKED":
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  getRoleColor: (role: string) => {
    switch (role.toUpperCase()) {
      case "SUPERADMIN":
        return "bg-purple-100 text-purple-800";
      case "ADMIN":
        return "bg-blue-100 text-blue-800";
      case "CLIENT":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  },

  getPaginatedTickets: (params: {
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    routeId?: number;
    userId?: number;
    status?: string;
  }) =>
    api.get<{
      tickets: TicketTableRow[];
      total: number;
      totalPages: number;
      currentPage: number;
    }>("/superadmin/tickets", { params }),

  getAllBuses: () => api.get<Bus[]>("/fleet/buses"),

  getSummaryReport: (config?: AxiosRequestConfig) =>
    api.get<SummaryReport>("/reports/summary", config),

  getAllRoutes: () =>
    api.get<
      { id: number; name: string; origin: string; destination: string }[]
    >("/fleet/routes"),

  getSystemHealth: () => api.get("/superadmin/system/health"),

  // Fleet Management
  createBus: (data: { name: string; layoutType: string; seatCount: number }) =>
    api.post<Bus>("/fleet/buses", data),

  updateBus: (id: number, data: Partial<Bus>) =>
    api.patch<Bus>(`/fleet/buses/${id}`, data),

  deleteBus: (id: number) => api.delete(`/fleet/buses/${id}`),

  // Routes
  createRoute: (data: { name: string; origin: string; destination: string }) =>
    api.post<Route>("/fleet/routes", data),

  updateRoute: (id: number, data: Partial<Route>) =>
    api.patch<Route>(`/fleet/routes/${id}`, data),

  deleteRoute: (id: number) => api.delete(`/fleet/routes/${id}`),

  // Schedules
  getAllSchedules: () => api.get<Schedule[]>("/schedules"),

  createSchedule: (data: Omit<Schedule, "id">) =>
    api.post<Schedule>("/schedules", data),

  updateSchedule: (id: number, data: Partial<Schedule>) =>
    api.put<Schedule>(`/schedules/${id}`, data),

  deleteSchedule: (id: number) => api.delete(`/schedules/${id}`),

  forceDeleteSchedule: (id: number) => api.delete(`/schedules/${id}/force`),

  regenerateSeats: (id: number) =>
    api.post(`/schedules/${id}/regenerate-seats`),

  // Bookings
  getAllBookings: (params?: {
    page?: number;
    limit?: number;
    userId?: number;
    status?: string;
  }) =>
    api.get<{
      bookings: Booking[];
      total: number;
      totalPages: number;
      currentPage: number;
    }>("/bookings", { params }),

  getBookingById: (id: number) => api.get<Booking>(`/bookings/${id}`),

  cancelBooking: (bookingId: number) =>
    api.delete(`/bookings/${bookingId}/cancel-admin`),

  // Payments
  getAllPayments: (params?: {
    page?: number;
    limit?: number;
    userId?: number;
    status?: string;
  }) =>
    api.get<{
      payments: Payment[];
      total: number;
      totalPages: number;
      currentPage: number;
    }>("/payments", { params }),

  getPaymentById: (id: number) => api.get<Payment>(`/payments/${id}`),

  // Ticket Management
  getTicketById: (ticketId: number) =>
    api.get(`/superadmin/tickets/${ticketId}`),
  updateTicket: (ticketId: number, data: { status: string }) =>
    api.patch(`/superadmin/tickets/${ticketId}`, data),
  deleteTicket: (ticketId: number) =>
    api.delete(`/superadmin/tickets/${ticketId}`),

  getUserTickets: (userId: number) =>
    api.get(`/superadmin/users/${userId}/tickets`),

  // Booking Management
  updateBookingStatus: (
    bookingId: number,
    data: { status: string; reason?: string }
  ) => api.patch(`/bookings/${bookingId}/status`, data),
};

export const fleetAPI = superAdminAPI;

export const bookingsAPI = superAdminAPI;
export const paymentsAPI = superAdminAPI;

// Schedule APIs
export const scheduleAPI = {
  getAllSchedules: () => api.get("/schedules"),
  createSchedule: (data: Omit<Schedule, "id">) => api.post("/schedules", data),
  updateSchedule: (id: number, data: Partial<Schedule>) =>
    api.put(`/schedules/${id}`, data),
  deleteSchedule: (id: number) => api.delete(`/schedules/${id}`),
  regenerateSeats: (id: number) =>
    api.post(`/schedules/${id}/regenerate-seats`),
};
