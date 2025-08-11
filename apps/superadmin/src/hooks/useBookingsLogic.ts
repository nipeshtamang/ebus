import { useState, useEffect, useCallback } from "react";
import { useBookings } from "./useBookings";

export interface BookingFilters {
  searchTerm: string;
  statusFilter: string;
}

export function useBookingsLogic() {
  const {
    bookings,
    totalPages,
    currentPage,
    loading,
    error,
    fetchBookings,
    cancelBooking,
    setCurrentPage,
  } = useBookings();

  // Filter states
  const [filters, setFilters] = useState<BookingFilters>({
    searchTerm: "",
    statusFilter: "all",
  });
  
  const [filteredBookings, setFilteredBookings] = useState(bookings);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Filter bookings based on search term and status
  useEffect(() => {
    let filtered = bookings;

    // Filter by search term (user name or booking ID)
    if (filters.searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.id.toString().includes(filters.searchTerm.toLowerCase()) ||
          booking.user?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filters.statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === filters.statusFilter);
    }

    setFilteredBookings(filtered);
  }, [bookings, filters.searchTerm, filters.statusFilter]);

  // Filter update functions
  const updateSearchTerm = useCallback((searchTerm: string) => {
    setFilters(prev => ({ ...prev, searchTerm }));
  }, []);

  const updateStatusFilter = useCallback((statusFilter: string) => {
    setFilters(prev => ({ ...prev, statusFilter }));
  }, []);

  // Status badge color logic
  const getStatusBadgeVariant = useCallback((status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "BOOKED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  }, []);

  // Cancel booking logic
  const handleCancel = useCallback((id: number) => {
    setSelectedBookingId(id);
    setShowCancelDialog(true);
  }, []);

  const confirmCancel = useCallback(async () => {
    if (selectedBookingId) {
      try {
        await cancelBooking(selectedBookingId);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      } finally {
        setShowCancelDialog(false);
        setSelectedBookingId(null);
      }
    }
    return { success: false };
  }, [selectedBookingId, cancelBooking]);

  const closeCancelDialog = useCallback(() => {
    setShowCancelDialog(false);
    setSelectedBookingId(null);
  }, []);

  // Check if booking can be cancelled
  const canCancelBooking = useCallback((status: string) => {
    return status !== "COMPLETED" && status !== "CANCELLED";
  }, []);

  return {
    // Data
    bookings: filteredBookings,
    totalPages,
    currentPage,
    loading,
    error,
    
    // Filters
    filters,
    updateSearchTerm,
    updateStatusFilter,
    
    // Cancel dialog
    showCancelDialog,
    selectedBookingId,
    handleCancel,
    confirmCancel,
    closeCancelDialog,
    
    // Actions
    fetchBookings,
    setCurrentPage,
    
    // Helpers
    getStatusBadgeVariant,
    canCancelBooking,
  };
}