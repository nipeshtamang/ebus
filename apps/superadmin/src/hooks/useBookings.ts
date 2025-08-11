import { useState, useCallback } from "react";
import { bookingsAPI, Booking } from "@/services/superadminApi";

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      userId?: number;
      status?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await bookingsAPI.getAllBookings(params);
        setBookings(res.data.bookings);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load bookings"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const cancelBooking = useCallback(
    async (bookingId: number) => {
      setLoading(true);
      setError(null);
      try {
        await bookingsAPI.cancelBooking(bookingId);
        await fetchBookings({ page: currentPage });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to cancel booking"
        );
      } finally {
        setLoading(false);
      }
    },
    [fetchBookings, currentPage]
  );

  return {
    bookings,
    total,
    totalPages,
    currentPage,
    loading,
    error,
    fetchBookings,
    cancelBooking,
    setCurrentPage,
  };
}
