import React, { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, CheckCircle, XCircle, Loader2, Ticket } from "lucide-react";
import { format } from "date-fns";
import { bookingAPI } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Booking {
  id: number;
  status: string;
  createdAt: string;
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
  allSeatNumbers?: string[];
}

const Viewtickets = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingAPI.getMyBookings();
      setBookings(response.data || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
      setCancellingId(bookingId);
      await bookingAPI.cancelBooking(bookingId);
      // Refresh the bookings list
      fetchBookings();
    } catch (err) {
      console.error("Error cancelling booking:", err);
      setError("Failed to cancel booking. Please try again later.");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case "BOOKED":
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // Group bookings by ticket number
  const groupedByTicket: Record<string, Booking[]> = {};
  bookings.forEach((booking) => {
    const ticketNumber = booking.ticket?.ticketNumber || `NO_TICKET_${booking.id}`;
    if (!groupedByTicket[ticketNumber]) {
      groupedByTicket[ticketNumber] = [];
    }
    groupedByTicket[ticketNumber].push(booking);
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg">
          <Ticket className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-xs md:text-sm text-gray-600">
            View and manage your bookings
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <span className="ml-2 text-gray-600">Loading your bookings...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchBookings} 
            className="ml-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border-dashed border-2 border-gray-200 bg-gray-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-gray-100 p-3 mb-4">
              <Ticket className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No bookings found</h3>
            <p className="text-gray-500 text-center max-w-md mb-4">
              You haven't made any bookings yet. When you book a trip, your bookings will appear here.
            </p>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => window.location.href = "/"}>
              Book a Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedByTicket).map(([ticketNumber, bookingsGroup]) => {
            const firstBooking = bookingsGroup[0];
            const canCancel = firstBooking.status === "BOOKED" || firstBooking.status === "PENDING";
            
            return (
              <Card key={ticketNumber} className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 pb-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-800">
                        {firstBooking.schedule.bus.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(firstBooking.status)}
                        {firstBooking.seat && (
                          <Badge variant="outline" className="border-gray-200 text-gray-700">
                            Seat: {bookingsGroup.map(b => b.seat?.seatNumber).filter(Boolean).join(", ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {firstBooking.payment && (
                        <div className="text-sm font-medium text-gray-900">
                          {new Intl.NumberFormat("en-US", {
                            style: "currency",
                            currency: "NPR",
                          }).format(firstBooking.payment.amount)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500">
                        {firstBooking.payment?.method || "Payment Pending"}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-teal-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {firstBooking.schedule.route.origin} → {firstBooking.schedule.route.destination}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-teal-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDate(firstBooking.schedule.departure)}
                        </div>
                      </div>
                    </div>

                    {firstBooking.ticket?.ticketNumber && (
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-teal-600" />
                        <div>
                          <div className="font-medium text-gray-900">
                            Ticket: {firstBooking.ticket.ticketNumber}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {canCancel && (
                      <div className="mt-4 flex justify-end">
                        <Button 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => cancelBooking(firstBooking.id)}
                          disabled={cancellingId === firstBooking.id}
                        >
                          {cancellingId === firstBooking.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Cancelling...
                            </>
                          ) : (
                            "Cancel Booking"
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Viewtickets;
