import { useState, useEffect, useCallback, useMemo } from "react";
import { bookingAPI } from "../services/api";

export interface Booking {
  id: number;
  status: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  user?: {
    name: string;
    phoneNumber: string;
    email: string;
  };
  schedule: {
    id: number;
    departure: string;
    route: {
      origin: string;
      destination: string;
    };
    fare: number;
    bus: {
      name: string;
      layoutType?: string;
      seatCount?: number;
    };
  };
  seat?: {
    seatNumber: string;
  };
  ticket?: {
    id: number;
    ticketNumber: string;
    qrCode: string;
    issuedAt: string;
  };
  payment?: {
    status: string;
    amount: number;
    method: string;
  };

  // Optional: all seat numbers for the order/ticket (injected by backend)
  allSeatNumbers?: string[];
}

export interface UseBookingsReturn {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
  refreshBookings: () => Promise<void>;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
}

export function useBookings(): UseBookingsReturn {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getAllBookings({
        page: 1,
        limit: 1000,
      });
      setBookings(response.data.bookings || response.data);
    } catch (err: unknown) {
      let message = "Failed to fetch bookings";
      if (err instanceof Error) message = err.message;
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Memoized computed values
  const totalBookings = useMemo(() => bookings.length, [bookings]);

  const pendingBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "BOOKED").length,
    [bookings]
  );

  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "COMPLETED").length,
    [bookings]
  );

  const cancelledBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "CANCELLED").length,
    [bookings]
  );

  const refreshBookings = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refreshBookings,
    totalBookings,
    pendingBookings,
    completedBookings,
    cancelledBookings,
  };
}
