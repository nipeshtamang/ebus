import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Search, Filter } from "lucide-react";
import { useBookingsLogic } from "@/hooks/useBookingsLogic";

const Bookings: React.FC = () => {
  const {
    bookings,
    totalPages,
    currentPage,
    loading,
    error,
    filters,
    updateSearchTerm,
    updateStatusFilter,
    showCancelDialog,
    selectedBookingId,
    handleCancel,
    confirmCancel,
    closeCancelDialog,
    fetchBookings,
    setCurrentPage,
    getStatusBadgeVariant,
    canCancelBooking,
  } = useBookingsLogic();

  useEffect(() => {
    fetchBookings({ page: currentPage });
  }, [fetchBookings, currentPage]);

  const handleConfirmCancel = async () => {
    const result = await confirmCancel();
    if (result.success) {
      toast.success("Booking cancelled successfully!");
    } else {
      toast.error("Failed to cancel booking");
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Bookings
        </h1>
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => fetchBookings({ page: currentPage })}
          />
        )}
        
        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by booking ID or user name..."
                    value={filters.searchTerm}
                    onChange={(e) => updateSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={filters.statusFilter} onValueChange={updateStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="BOOKED">Booked</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Bookings ({bookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : bookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {filters.searchTerm || filters.statusFilter !== "all"
                  ? "No bookings match your filters"
                  : "No bookings found"}
              </div>
            ) : (
              <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      User
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                    >
                      <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                        {booking.id}
                      </td>
                      <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                        {booking.user?.name || "-"}
                      </td>
                      <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                        <Badge className={`${getStatusBadgeVariant(booking.status)} border`}>
                          {booking.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                        {new Date(booking.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                        {canCancelBooking(booking.status) ? (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancel(booking.id)}
                            aria-label={`Cancel booking ${booking.id}`}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>Cancel</span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  Cancel this booking
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Button>
                        ) : (
                          <span className={`text-sm font-medium ${
                            booking.status === "COMPLETED"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}>
                            {booking.status === "COMPLETED" ? "Completed" : "Cancelled"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>
        {/* Pagination Controls */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="px-2 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
        {/* Cancel Confirmation Dialog */}
        <AlertDialog open={showCancelDialog} onOpenChange={closeCancelDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Cancel</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot
                be undone and the seat will be released for others to book. A cancellation
                email will be sent to the customer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmCancel}
                className="bg-red-600 hover:bg-red-700"
              >
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Bookings;
