import { useState, useEffect, useCallback } from "react";
import { bookingAPI, scheduleAPI, paymentAPI } from "../services/api";

export interface DashboardStats {
  totalBookings: number;
  totalSchedules: number;
  totalPayments: number;
  totalRevenue: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export interface RecentBooking {
  id: number;
  status: string;
  createdAt: string;
  user: {
    name: string;
    phoneNumber: string;
  };
  schedule: {
    departure: string;
    route: {
      origin: string;
      destination: string;
    };
    fare: number;
  };
  seatNumbers: string[];
  totalAmount: number;
  payment?: {
    method: string;
    status: string;
  };
  tripType?: "Onward" | "Return";
}

export interface UseDashboardReturn {
  stats: DashboardStats;
  recentBookings: RecentBooking[];
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  refreshing: boolean;
  setRefreshing: (refreshing: boolean) => void;
}

// Add types for Booking, Schedule, and Payment
interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
}

interface Schedule {
  id: number;
  departure: string;
  fare: number;
  route: {
    origin: string;
    destination: string;
  };
}

interface Booking {
  id: number;
  orderId?: number;
  status: string;
  createdAt: string;
  user?: {
    name?: string;
    phoneNumber?: string;
  };
  schedule?: Schedule;
  seat?: {
    seatNumber?: string;
  };
  payment?: Payment;
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalSchedules: 0,
    totalPayments: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]); // Will be grouped by order
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);

      // Fetch all data in parallel for better performance
      const [bookingsRes, schedulesRes, paymentsRes] = await Promise.allSettled(
        [
          bookingAPI.getAllBookings({ page: 1, limit: 1000 }), // Get all bookings for dashboard
          scheduleAPI.getAllSchedules(),
          paymentAPI.getPaymentHistory({ page: 1, limit: 1000 }), // Get all payments for dashboard
        ]
      );

      // Handle successful responses
      const bookings: Booking[] =
        bookingsRes.status === "fulfilled"
          ? bookingsRes.value.data.bookings || bookingsRes.value.data
          : [];
      const schedules: Schedule[] =
        schedulesRes.status === "fulfilled" ? schedulesRes.value.data : [];
      const payments: Payment[] =
        paymentsRes.status === "fulfilled"
          ? paymentsRes.value.data.payments || paymentsRes.value.data
          : [];

      // Log any failed requests
      if (bookingsRes.status === "rejected") {
        console.error("Failed to fetch bookings:", bookingsRes.reason);
      }
      if (schedulesRes.status === "rejected") {
        console.error("Failed to fetch schedules:", schedulesRes.reason);
      }
      if (paymentsRes.status === "rejected") {
        console.error("Failed to fetch payments:", paymentsRes.reason);
      }

      // Calculate stats
      const totalBookings = bookings.length;
      const totalSchedules = schedules.length;
      const totalPayments = payments.length;
      const totalRevenue = payments
        .filter((p) => p.status === "COMPLETED")
        .reduce((sum, p) => sum + (p.amount || 0), 0);

      const pendingBookings = bookings.filter(
        (b) => b.status === "PENDING"
      ).length;
      const completedBookings = bookings.filter(
        (b) => b.status === "BOOKED" || b.status === "COMPLETED"
      ).length;
      const cancelledBookings = bookings.filter(
        (b) => b.status === "CANCELLED"
      ).length;

      setStats({
        totalBookings,
        totalSchedules,
        totalPayments,
        totalRevenue,
        pendingBookings,
        completedBookings,
        cancelledBookings,
      });

      // Group bookings by orderId and by schedule (onward/return)
      const bookingsByOrder: Record<string, Booking[]> = {};
      bookings.forEach((booking) => {
        const orderId = booking.orderId
          ? String(booking.orderId)
          : `noorder-${booking.id}`;
        if (!bookingsByOrder[orderId]) bookingsByOrder[orderId] = [];
        bookingsByOrder[orderId].push(booking);
      });

      // Sort orders by createdAt (most recent first)
      const sortedOrders = Object.values(bookingsByOrder)
        .sort((a, b) => {
          // Use the earliest createdAt in the group
          const aDate = new Date(a[0].createdAt).getTime();
          const bDate = new Date(b[0].createdAt).getTime();
          return bDate - aDate;
        })
        .slice(0, 5);

      // Map to dashboard display format, splitting onward/return if both exist
      const recent: RecentBooking[] = [];
      sortedOrders.forEach((group) => {
        // Group by schedule (onward/return) using route direction
        const byDirection: Record<string, Booking[]> = {};
        group.forEach((b) => {
          const dir =
            b.schedule && b.schedule.route
              ? `${b.schedule.route.origin}->${b.schedule.route.destination}`
              : "unknown";
          if (!byDirection[dir]) byDirection[dir] = [];
          byDirection[dir].push(b);
        });
        const directions = Object.keys(byDirection);
        Object.entries(byDirection).forEach(([dir, bookingsInDir], idx) => {
          const first = bookingsInDir[0];
          const seatNumbers = bookingsInDir
            .map((b) => b.seat?.seatNumber)
            .filter((s): s is string => !!s);
          const payment = bookingsInDir.find(
            (b) => b.payment && b.payment.amount
          )?.payment;
          const totalAmount =
            payment?.amount || (first.schedule?.fare || 0) * seatNumbers.length;
          // Always set tripType for clarity
          let tripType: "Onward" | "Return" = "Onward";
          if (directions.length > 1) {
            tripType = idx === 0 ? "Onward" : "Return";
          } else if (directions.length === 1) {
            // If only one direction, label as Onward
            tripType = "Onward";
          }
          recent.push({
            id: first.orderId || first.id,
            status: first.status,
            createdAt: first.createdAt,
            user: {
              name: first.user?.name || "N/A",
              phoneNumber: first.user?.phoneNumber || "N/A",
            },
            schedule: {
              departure: first.schedule?.departure || "",
              route: {
                origin: first.schedule?.route?.origin || "N/A",
                destination: first.schedule?.route?.destination || "N/A",
              },
              fare: first.schedule?.fare || 0,
            },
            seatNumbers,
            totalAmount,
            payment: payment
              ? {
                  method: payment.method || "N/A",
                  status: payment.status || "N/A",
                }
              : undefined,
            tripType,
          });
        });
      });

      setRecentBookings(recent);
    } catch (err: unknown) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData().finally(() => setLoading(false));
  }, [fetchDashboardData]);

  return {
    stats,
    recentBookings,
    loading,
    error,
    refreshDashboard,
    refreshing,
    setRefreshing,
  };
}
