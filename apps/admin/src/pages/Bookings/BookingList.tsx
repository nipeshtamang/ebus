import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Ticket,
  Search,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
  MoreHorizontal,
  Printer,
  Bus,
  QrCode,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { BusSeatLayout } from "@/components/ui/bus-seat-layout";
import { AdminLayout } from "../../layouts/AdminLayout";
import { useBookings, Booking } from "../../hooks/useBookings";
import { ErrorMessage } from "../../components/ui/error-message";
import { SuccessMessage } from "../../components/ui/success-message";
// import { useToast } from "@/components/ui/use-toast";
import { bookingAPI, scheduleAPI } from "../../services/api";
import ROUTES from "../../Routes/routes";
import { Label } from "@/components/ui/label";
import { TableSkeleton } from "@/components/ui/skeleton";

interface Ticket {
  id: number;
  ticketNumber: string;
  qrCode: string;
}

type TicketBooking = {
  id?: number;
  seat?: { seatNumber?: string };
  payment?: { amount?: number; method?: string; status?: string };
  user?: { name?: string; phoneNumber?: string };
  customerPhone?: string;
  schedule?: {
    route?: { origin?: string; destination?: string };
    departure?: string;
    bus?: { name?: string; layoutType?: string; seatCount?: number };
  };
  status?: string;
};

export function BookingList() {
  const { bookings, loading, refreshBookings } = useBookings();
  // const { toast } = useToast();

  // Booking stats for dashboard cards
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const completedBookings = bookings.filter(
    (b) => b.status === "COMPLETED"
  ).length;
  const cancelledBookings = bookings.filter(
    (b) => b.status === "CANCELLED"
  ).length;

  // Add missing state hooks
  const [ticketData, setTicketData] = useState<{
    bookings: TicketBooking[];
    ticketNumber?: string;
    qrCode?: string;
  } | null>(null);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [showBusDetailsDialog, setShowBusDetailsDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusReason, setStatusReason] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [ticketNumberSearch, setTicketNumberSearch] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);
  const [removingSeat, setRemovingSeat] = useState(false);

  // Add missing state for busDetails and seatToRemove
  const [busDetails, setBusDetails] = useState<{
    busName: string;
    layoutType: string;
    seatCount: number;
    bookedSeats: string[];
    availableSeats: string[];
    seats: any[]; // Add seats array for the layout component
  } | null>(null);

  // Add state for seat removal
  const [seatToRemove, setSeatToRemove] = useState<{
    bookingId: number;
    seatNumber: string;
  } | null>(null);
  // Ref to keep seat number for success message after async
  const seatToRemoveRef = useRef<{
    bookingId: number;
    seatNumber: string;
  } | null>(null);
  const [seatRemoveSuccess, setSeatRemoveSuccess] = useState<string | null>(
    null
  );

  // Add missing handleRefresh function
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshBookings();
      setSuccessMessage("Bookings refreshed successfully!");
      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      setErrorMessage("Failed to refresh bookings.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      setErrorMessage(null);

      await bookingAPI.updateBookingStatus(selectedBooking.id, {
        status: newStatus,
        reason: statusReason,
      });

      setSuccessMessage("Booking status updated successfully!");
      setShowStatusDialog(false);
      setSelectedBooking(null);
      setNewStatus("");
      setStatusReason("");

      // Refresh to get the latest data from server
      await refreshBookings();

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err: unknown) {
      let errorMessage = "Failed to update booking  status.";
      if (err && typeof err === "object" && "message" in err) {
        errorMessage = (err as { message: string }).message;
      }
      setErrorMessage(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveSeat = async () => {
    if (!seatToRemove) return;
    seatToRemoveRef.current = seatToRemove;
    setRemovingSeat(true);
    try {
      // Call your API to remove the seat from the booking
      const response = await bookingAPI.removeSeatFromBooking(
        seatToRemove.bookingId,
        seatToRemove.seatNumber
      );
      setSeatToRemove(null);
      await refreshBookings();

      // If ticket dialog is open, refresh ticket details
      if (showTicketDialog && ticketDetails?.ticketNumber) {
        const ticketResp = await bookingAPI.getTicketByNumber(
          ticketDetails.ticketNumber
        );
        const ticketDataResp = ticketResp.data as {
          bookings: TicketBooking[];
          ticketNumber?: string;
          qrCode?: string;
        };
        setTicketData(ticketDataResp);

        // Extract all seat numbers from the bookings array
        const allSeatNumbers = ticketDataResp.bookings
          .map((b) => b.seat?.seatNumber)
          .filter(Boolean)
          .join(", ");

        // Calculate total fare for all seats
        const totalFare = ticketDataResp.bookings.reduce((sum, b) => {
          return sum + (b.payment?.amount || 0);
        }, 0);

        // Get the first booking for display purposes
        const firstBooking = ticketDataResp.bookings[0];

        setTicketDetails({
          ticketNumber: ticketDataResp.ticketNumber || "N/A",
          qrCode: ticketDataResp.qrCode || "",
          passengerName: firstBooking?.user?.name || "N/A",
          passengerPhone:
            firstBooking?.user?.phoneNumber ||
            firstBooking?.customerPhone ||
            "N/A",
          status: firstBooking?.status || "N/A",
          route: firstBooking?.schedule?.route
            ? `${firstBooking.schedule.route.origin} → ${firstBooking.schedule.route.destination}`
            : "N/A",
          departure: firstBooking?.schedule?.departure || "N/A",
          seatNumber: allSeatNumbers,
          fare: totalFare,
          busName: firstBooking?.schedule?.bus?.name || "N/A",
          busLayout: firstBooking?.schedule?.bus?.layoutType || "N/A",
        });
      }
      // Show success message for seat removal
      setSeatRemoveSuccess(
        `Seat ${seatToRemoveRef.current?.seatNumber} has been removed from the booking.`
      );
      setTimeout(() => setSeatRemoveSuccess(null), 3000);
    } catch (err) {
      // Optionally show error
      console.error("Error removing seat:", err);
      setSeatToRemove(null);
    } finally {
      setRemovingSeat(false);
    }
  };

  const openCancelDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowCancelDialog(true);
  };

  const openStatusDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setShowStatusDialog(true);
  };

  const openTicketDialog = async (booking: Booking) => {
    try {
      setActionLoading(true);

      // Use the new API to get ticket details with all bookings
      const ticketNumber = booking.ticket?.ticketNumber;
      if (!ticketNumber) {
        throw new Error("No ticket number found for this booking");
      }

      const response = await bookingAPI.getTicketByNumber(ticketNumber);
      const ticketDataResp = response.data as {
        bookings: TicketBooking[];
        ticketNumber?: string;
        qrCode?: string;
      };
      setTicketData(ticketDataResp);

      // Extract all seat numbers from the bookings array
      const allSeatNumbers = ticketDataResp.bookings
        .map((b) => b.seat?.seatNumber)
        .filter(Boolean)
        .join(", ");

      // Calculate total fare for all seats
      const totalFare = ticketDataResp.bookings.reduce((sum, b) => {
        return sum + (b.payment?.amount || 0);
      }, 0);

      // Get the first booking for display purposes
      const firstBooking = ticketDataResp.bookings[0];

      setTicketDetails({
        ticketNumber: ticketDataResp.ticketNumber || "N/A",
        qrCode: ticketDataResp.qrCode || "",
        passengerName: firstBooking?.user?.name || "N/A",
        passengerPhone:
          firstBooking?.user?.phoneNumber ||
          firstBooking?.customerPhone ||
          "N/A",
        status: firstBooking?.status || "N/A",
        route: firstBooking?.schedule?.route
          ? `${firstBooking.schedule.route.origin} → ${firstBooking.schedule.route.destination}`
          : "N/A",
        departure: firstBooking?.schedule?.departure || "N/A",
        seatNumber: allSeatNumbers,
        fare: totalFare,
        busName: firstBooking?.schedule?.bus?.name || "N/A",
        busLayout: firstBooking?.schedule?.bus?.layoutType || "N/A",
      });

      setShowTicketDialog(true);
    } catch (err: unknown) {
      let errorMessage = "Failed to load ticket details.";
      if (err && typeof err === "object" && "message" in err) {
        errorMessage = (err as { message: string }).message;
      }
      setErrorMessage(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const openBusDetailsDialog = async (booking: Booking) => {
    if (!booking.schedule?.bus) return;

    try {
      setActionLoading(true);
      
      // Fetch all seats for this schedule to show the complete bus layout
      const response = await scheduleAPI.getScheduleById(booking.schedule.id);
      const scheduleData = response.data;
      
      // Get all seats for this schedule
      const allSeats = scheduleData.seats || [];
      
      // Separate booked and available seats
      const bookedSeats = allSeats
        .filter((seat: any) => seat.isBooked)
        .map((seat: any) => seat.seatNumber);
      
      const availableSeats = allSeats
        .filter((seat: any) => !seat.isBooked)
        .map((seat: any) => seat.seatNumber);

      setBusDetails({
        busName: booking.schedule.bus.name,
        layoutType: booking.schedule.bus.layoutType || "",
        seatCount: booking.schedule.bus.seatCount || 0,
        bookedSeats,
        availableSeats,
        seats: allSeats, // Add the actual seat data for the layout component
      });

      setShowBusDetailsDialog(true);
    } catch (error) {
      console.error("Error fetching bus details:", error);
      setErrorMessage("Failed to load bus details. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintTicket = () => {
    if (!ticketDetails) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Use the QR code as is (should already be a data URI)
    const qrCodeSrc = ticketDetails.qrCode || "";

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Ticket</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .ticket-container { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .ticket { background: white; width: 100%; max-width: 380px; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0, 188, 212, 0.15); margin: 0 auto; padding-bottom: 16px; }
          .header { background: linear-gradient(to right, #00bcd4, #00acc1); color: white; padding: 16px; text-align: center; margin-bottom: 18px; }
          .header h2 { margin: 0; font-size: 1.6rem; letter-spacing: 2px; }
          .header h3 { margin: 0; font-size: 1.1rem; font-weight: 400; letter-spacing: 1px; }
          .qr-code { text-align: center; margin: 18px 0; }
          .qr-code img { width: 120px; height: 120px; border-radius: 12px; border: 3px solid #b2ebf2; background: #fff; }
          .details { margin: 18px 0; font-size: 1rem; }
          .label { font-weight: 600; color: #0097a7; min-width: 90px; display: inline-block; }
          .info-row { margin-bottom: 8px; }
          .bus-row { margin-bottom: 8px; }
          .footer { text-align: center; color: #90a4ae; font-size: 0.9rem; margin-top: 18px; }
          @media print {
            body { margin: 0; background: #fff; }
            .ticket-container { min-height: unset; }
            .ticket { box-shadow: none; border: 2px solid #00bcd4; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket">
            <div class="header">
              <h2>Bus Ticket</h2>
              <h3>#${ticketDetails.ticketNumber}</h3>
            </div>
            <div class="qr-code">
              ${qrCodeSrc ? `<img src="${qrCodeSrc}" alt="QR Code" />` : '<div style="width: 120px; height: 120px; border: 2px dashed #b2ebf2; display: flex; align-items: center; justify-content: center; font-size: 13px; color: #b0bec5; border-radius: 12px;">QR Code<br/>Not Available</div>'}
              <div style="margin-top: 6px; color: #90a4ae; font-size: 0.85rem;">Scan for ticket</div>
            </div>
            <div class="details">
              <div class="info-row"><span class="label">Passenger:</span> ${ticketDetails.passengerName}${ticketDetails.status && ticketDetails.status !== "N/A" ? ` <span style='display:inline-block;padding:2px 10px;border-radius:8px;font-size:0.95em;font-weight:600;background:#e0f2f1;color:#00796b;margin-left:8px;border:1px solid #b2dfdb;'>${ticketDetails.status.charAt(0) + ticketDetails.status.slice(1).toLowerCase()}</span>` : ""}
              </div>
              ${ticketDetails.passengerPhone && ticketDetails.passengerPhone !== "N/A" ? ` <div class="info-row> <spanclass="label">Phone:</span> <span style='color:#00796b;font-size:0.95em;'>${ticketDetails.passengerPhone}</span> </div>` : ""}
              <div class="info-row"><span class="label">Route:</span> ${ticketDetails.route}</div>
              <div class="info-row"><span class="label">Departure:</span> ${ticketDetails.departure}</div>
              <div class="bus-row"><span class="label">Bus:</span> ${ticketDetails.busName}${ticketDetails.busLayout && ticketDetails.busLayout !== "N/A" ? ` <span style='color:#00bcd4;font-size:0.92em;'>(${ticketDetails.busLayout})</span>` : ""}</div>
              <div class="info-row"><span class="label">Seat${ticketDetails.seatNumber.includes(",") ? "s" : ""}:</span> ${ticketDetails.seatNumber}</div>
              <div class="info-row"><span class="label">Fare:</span> Rs. ${ticketDetails.fare}</div>
            </div>
            <div class="footer">Thank you for choosing Ebusewa!</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  };

  const getStatusColor = (status: string) => {
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
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "BOOKED":
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "CANCELLED":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const canCancelBooking = (status: string) => {
    return (
      status.toUpperCase() !== "COMPLETED" &&
      status.toUpperCase() !== "CANCELLED"
    );
  };

  // Filter bookings based on search criteria
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchTerm === "" ||
      booking.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone?.includes(searchTerm) ||
      booking.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.schedule.route.origin
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.schedule.route.destination
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter.toUpperCase();

    const matchesDate =
      dateFilter === "" ||
      format(new Date(booking.schedule.departure), "yyyy-MM-dd") === dateFilter;

    const matchesTicketNumber =
      ticketNumberSearch === "" ||
      booking.ticket?.ticketNumber
        ?.toLowerCase()
        .includes(ticketNumberSearch.toLowerCase());

    return matchesSearch && matchesStatus && matchesDate && matchesTicketNumber;
  });

  // Group bookings by ticket number and aggregate seat numbers (deduplicated, use only from first booking)
  const groupedByTicket: Record<string, { bookings: Booking[] }> = {};
  filteredBookings.forEach((booking) => {
    const ticketNumber = booking.ticket?.ticketNumber || "NO_TICKET";
    if (!groupedByTicket[ticketNumber]) {
      groupedByTicket[ticketNumber] = { bookings: [] };
    }
    groupedByTicket[ticketNumber].bookings.push(booking);
  });
  const groupedTickets = Object.entries(groupedByTicket);

  if (loading) {
    return (
      <AdminLayout>
        <TableSkeleton />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-white via-teal-50/50 to-cyan-50/50 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-teal-100 shadow-sm px-4 py-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Booking Management
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600">
                    Manage all bus bookings and tickets
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link to={ROUTES.BookingForm}>
                  <Button className="bg-teal-600 hover:bg-teal-700">
                    <Ticket className="h-4 w-4 mr-2" />
                    New Booking
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="border-teal-200 hover:bg-teal-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {/* Global seat remove success message */}
          {seatRemoveSuccess && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md">
              <SuccessMessage
                message={seatRemoveSuccess}
                onDismiss={() => setSeatRemoveSuccess(null)}
              />
            </div>
          )}

          {successMessage && (
            <SuccessMessage
              message={successMessage}
              onDismiss={() => setSuccessMessage(null)}
              className="mb-6"
            />
          )}

          {errorMessage && (
            <ErrorMessage message={errorMessage} className="mb-6" />
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Bookings
                </CardTitle>
                <Ticket className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {totalBookings}
                </div>
                <p className="text-xs text-gray-500">All bookings</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-yellow-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {pendingBookings}
                </div>
                <p className="text-xs text-gray-500">Pending bookings</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {completedBookings}
                </div>
                <p className="text-xs text-gray-500">Completed bookings</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-red-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Cancelled
                </CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {cancelledBookings}
                </div>
                <p className="text-xs text-gray-500">Cancelled bookings</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 mb-6 md:mb-8">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-teal-600" />
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Bookings</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, phone, route..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchTerm(e.target.value)
                      }
                      className="pl-10 border-teal-200 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="BOOKED">Booked</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-filter">Date Filter</Label>
                  <Input
                    id="date-filter"
                    type="date"
                    value={dateFilter}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setDateFilter(e.target.value)
                    }
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ticket-search">Ticket Number</Label>
                  <Input
                    id="ticket-search"
                    placeholder="Search by ticket number..."
                    value={ticketNumberSearch}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTicketNumberSearch(e.target.value)
                    }
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bookings List */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-teal-600" />
                All Bookings ({filteredBookings.length})
                {statusFilter !== "all" && (
                  <span className="ml-3 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700 border border-gray-300">
                    {statusFilter.charAt(0) +
                      statusFilter.slice(1).toLowerCase()}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {loading ? (
                <TableSkeleton rows={5} />
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Ticket className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    No bookings found
                  </h3>
                  <p className="text-sm">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    dateFilter ||
                    ticketNumberSearch
                      ? "Try adjusting your search criteria."
                      : "Start by creating a new booking."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedTickets.map(([ticketNumber, group]) => {
                    const firstBooking = group.bookings[0];
                    let seatNumbers: string[] = [];
                    if (
                      Array.isArray(firstBooking.allSeatNumbers) &&
                      firstBooking.allSeatNumbers.length > 0
                    ) {
                      seatNumbers = Array.from(
                        new Set(firstBooking.allSeatNumbers)
                      );
                    } else {
                      seatNumbers = Array.from(
                        new Set(
                          group.bookings
                            .map((b) => b.seat?.seatNumber)
                            .filter((s): s is string => typeof s === "string")
                        )
                      );
                    }
                    return (
                      <div
                        key={ticketNumber}
                        className="flex flex-col p-4 border border-teal-100 rounded-lg hover:bg-teal-50/50 transition-all duration-200 gap-4"
                      >
                        <div className="flex items-start space-x-4">
                          <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <span className="font-medium truncate">
                                {firstBooking.user?.name ||
                                  firstBooking.customerName ||
                                  "N/A"}
                              </span>
                              <span className="text-sm text-gray-500">
                                (
                                {firstBooking.user?.phoneNumber ||
                                  firstBooking.customerPhone ||
                                  "N/A"}
                                )
                              </span>
                              {firstBooking.status && (
                                <span
                                  className={`ml-2 text-xs font-semibold rounded px-2 py-0.5 border ${getStatusColor(firstBooking.status)}`}
                                >
                                  {firstBooking.status.charAt(0) +
                                    firstBooking.status.slice(1).toLowerCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-600 truncate">
                                {firstBooking.schedule.route.origin} →{" "}
                                {firstBooking.schedule.route.destination}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-500">
                                {formatDate(firstBooking.schedule.departure)}
                              </span>
                              {firstBooking.ticket?.ticketNumber && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-xs text-gray-400">
                                    Ticket: {firstBooking.ticket.ticketNumber}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="ml-auto flex items-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-5 w-5 text-gray-500" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedBooking(firstBooking);
                                    setShowStatusDialog(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2 text-gray-500" />
                                  Edit Booking
                                </DropdownMenuItem>
                                {/* Only show Cancel Booking option if status is not COMPLETED or CANCELLED */}
                                {canCancelBooking(firstBooking.status) && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      openCancelDialog(firstBooking)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                                    Cancel Booking
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() => openTicketDialog(firstBooking)}
                                >
                                  <Ticket className="h-4 w-4 mr-2 text-teal-500" />
                                  View Ticket
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    openBusDetailsDialog(firstBooking)
                                  }
                                >
                                  <Bus className="h-4 w-4 mr-2 text-cyan-500" />
                                  Bus Details
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-semibold text-teal-700">
                            Seats:
                          </span>
                          <span className="text-gray-800 flex flex-wrap gap-2">
                            {Array.isArray(seatNumbers) &&
                              seatNumbers.map((seatNum) => {
                                const bookingForSeat = group.bookings.find(
                                  (b) => b.seat?.seatNumber === seatNum
                                );
                                return (
                                  <span
                                    key={seatNum}
                                    className="inline-flex items-center bg-cyan-50 border border-cyan-200 rounded px-2 py-0.5 text-sm"
                                  >
                                    {seatNum}
                                    <button
                                      className="ml-1 text-red-500 hover:text-red-700 focus:outline-none"
                                      title={`Remove seat ${seatNum}`}
                                      disabled={!bookingForSeat}
                                      onClick={() => {
                                        if (bookingForSeat) {
                                          setSeatToRemove({
                                            bookingId: bookingForSeat.id ?? -1,
                                            seatNumber: seatNum,
                                          });
                                        }
                                      }}
                                    >
                                      &times;
                                    </button>
                                  </span>
                                );
                              })}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cancel Booking Dialog */}
          <AlertDialog
            open={showCancelDialog}
            onOpenChange={setShowCancelDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to cancel this booking? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cancel-reason">Reason for Cancellation</Label>
                  <Textarea
                    id="cancel-reason"
                    placeholder="Enter reason for cancellation..."
                    value={cancelReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setCancelReason(e.target.value)
                    }
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (!selectedBooking) return;
                    setActionLoading(true);
                    try {
                      await bookingAPI.adminCancelBooking(selectedBooking.id, {
                        reason: cancelReason,
                      });
                      setSuccessMessage("Booking cancelled successfully!");
                      await refreshBookings();
                    } catch (err) {
                      setErrorMessage(
                        "Failed to cancel booking. Please try again."
                      );
                      console.error("Error cancelling booking:", err);
                    } finally {
                      setActionLoading(false);
                      setShowCancelDialog(false);
                      setSelectedBooking(null);
                      setCancelReason("");
                    }
                  }}
                  disabled={actionLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {actionLoading ? "Cancelling..." : "Cancel Booking"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Update Status Dialog */}
          <AlertDialog
            open={showStatusDialog}
            onOpenChange={setShowStatusDialog}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Update Booking Status</AlertDialogTitle>
                <AlertDialogDescription>
                  Update the status of this booking.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="new-status">New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="BOOKED">Booked</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status-reason">Reason (optional)</Label>
                  <Textarea
                    id="status-reason"
                    placeholder="Enter reason for status change..."
                    value={statusReason}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setStatusReason(e.target.value)
                    }
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleUpdateStatus}
                  disabled={actionLoading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {actionLoading ? "Updating..." : "Update Status"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Ticket Dialog - Redesigned */}
          <AlertDialog
            open={showTicketDialog}
            onOpenChange={setShowTicketDialog}
          >
            <AlertDialogContent className="max-w-lg p-0 bg-gradient-to-br from-cyan-50 via-teal-100 to-blue-50 border-0 shadow-2xl">
              <div className="rounded-2xl overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-4 flex items-center justify-between">
                  <div className="text-white font-bold text-lg flex items-center gap-2">
                    <Ticket className="h-6 w-6" /> Ticket
                  </div>
                  <div className="text-white text-xs font-mono tracking-widest">
                    #{ticketDetails?.ticketNumber}
                  </div>
                </div>
                {ticketDetails && (
                  <div className="p-6 flex flex-col md:flex-row gap-6 items-center md:items-start bg-white/80">
                    {/* QR Code */}
                    <div className="flex flex-col items-center justify-center">
                      {ticketDetails.qrCode ? (
                        <img
                          src={ticketDetails.qrCode}
                          alt="QR Code"
                          className="w-36 h-36 rounded-xl border-4 border-cyan-200 shadow-lg bg-white"
                          onError={(e) => {
                            e.currentTarget.src = "";
                            e.currentTarget.alt = "QR Not Available";
                          }}
                        />
                      ) : (
                        <div className="w-36 h-36 flex items-center justify-center rounded-xl border-4 border-dashed border-cyan-200 bg-cyan-50 text-cyan-400 text-center text-xs font-semibold">
                          QR Code Not Available
                        </div>
                      )}
                      <div className="mt-2 text-xs text-gray-400">
                        Scan for ticket
                      </div>
                    </div>
                    {/* Ticket Info */}
                    <div className="flex-1 w-full space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-teal-700">
                          Passenger:
                        </span>
                        <span className="text-gray-800">
                          {ticketDetails.passengerName}
                        </span>
                        {ticketDetails.passengerPhone &&
                          ticketDetails.passengerPhone !== "N/A" && (
                            <span className="ml-2 text-xs text-cyan-700 bg-cyan-100 rounded px-2 py-0.5">
                              {ticketDetails.passengerPhone}
                            </span>
                          )}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-500" />
                        <span className="font-semibold text-teal-700">
                          Route:
                        </span>
                        <span className="text-gray-800">
                          {ticketDetails.route}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-cyan-500" />
                        <span className="font-semibold text-teal-700">
                          Departure:
                        </span>
                        <span className="text-gray-800">
                          {ticketDetails.departure}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bus className="h-4 w-4 text-cyan-500" />
                        <span className="font-semibold text-teal-700">
                          Bus:
                        </span>
                        <span className="text-gray-800">
                          {ticketDetails.busName}
                        </span>
                        {ticketDetails.busLayout &&
                          ticketDetails.busLayout !== "N/A" && (
                            <span className="ml-2 text-xs text-cyan-700 bg-cyan-100 rounded px-2 py-0.5">
                              {ticketDetails.busLayout}
                            </span>
                          )}
                      </div>
                      {!(
                        ticketData &&
                        ticketData.bookings &&
                        ticketData.bookings.length > 0
                      ) && (
                        <div className="flex items-center gap-2">
                          <Bus className="h-4 w-4 text-cyan-500" />
                          <span className="font-semibold text-teal-700">
                            Seat:
                          </span>
                          <span className="text-gray-800">
                            {ticketDetails.seatNumbers}
                          </span>
                        </div>
                      )}
                      {ticketData &&
                        ticketData.bookings &&
                        ticketData.bookings.length > 0 && (
                          <div className="flex items-center gap-2 mt-2">
                            <Bus className="h-4 w-4 text-cyan-500" />
                            <span className="font-semibold text-teal-700">
                              Seats:
                            </span>
                            <span className="text-gray-800 flex flex-wrap gap-2">
                              {ticketData.bookings
                                .map((b: any) => b.seat?.seatNumber)
                                .filter(
                                  (sn): sn is string => typeof sn === "string"
                                )
                                .map((seatNum: string) => {
                                  const bookingForSeat =
                                    ticketData.bookings.find(
                                      (b: any) => b.seat?.seatNumber === seatNum
                                    );
                                  return (
                                    <span
                                      key={seatNum}
                                      className="inline-flex items-center bg-cyan-50 border border-cyan-200 rounded px-2 py-0.5 text-sm"
                                    >
                                      {seatNum}
                                      <button
                                        className="ml-1 text-red-500 hover:text-red-700 focus:outline-none"
                                        title={`Remove seat ${seatNum}`}
                                        disabled={!bookingForSeat}
                                        onClick={() => {
                                          if (bookingForSeat) {
                                            setSeatToRemove({
                                              bookingId:
                                                bookingForSeat.id ?? -1,
                                              seatNumber: seatNum,
                                            });
                                          }
                                        }}
                                      >
                                        &times;
                                      </button>
                                    </span>
                                  );
                                })}
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
              <AlertDialogFooter>
                <div className="flex w-full gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={handlePrintTicket}
                    className="border-cyan-400 text-cyan-700 hover:bg-cyan-50"
                  >
                    <Printer className="h-4 w-4 mr-2" /> Print
                  </Button>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                </div>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Bus Details Dialog */}
          <AlertDialog
            open={showBusDetailsDialog}
            onOpenChange={setShowBusDetailsDialog}
          >
            <AlertDialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-teal-600" />
                  Bus Details - {busDetails?.busName}
                </AlertDialogTitle>
              </AlertDialogHeader>
              {busDetails && (
                <div className="space-y-4">
                  {/* Bus Information */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Layout Type</div>
                      <div className="font-semibold text-teal-700">{busDetails.layoutType}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Total Seats</div>
                      <div className="font-semibold text-teal-700">{busDetails.seatCount}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Available</div>
                      <div className="font-semibold text-green-600">{busDetails.availableSeats.length}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Booked</div>
                      <div className="font-semibold text-red-600">{busDetails.bookedSeats.length}</div>
                    </div>
                    <div className="text-center col-span-2 md:col-span-1">
                      <div className="text-sm text-gray-600">Occupancy</div>
                      <div className="font-semibold text-blue-600">
                        {Math.round((busDetails.bookedSeats.length / busDetails.seatCount) * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Booked Seats List */}
                  {busDetails.bookedSeats.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-sm font-semibold text-red-700 mb-2">Booked Seats:</div>
                      <div className="flex flex-wrap gap-1">
                        {busDetails.bookedSeats.map((seat) => (
                          <span key={seat} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Seat Layout */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-teal-700 mb-3 text-center">Seat Layout</h3>
                    <div className="flex justify-center">
                      <BusSeatLayout
                        seats={busDetails.seats || []}
                        layoutType={busDetails.layoutType}
                        busName={busDetails.busName}
                        onSeatClick={() => {}}
                        showLegend={true}
                        compact={true}
                      />
                    </div>
                  </div>
                </div>
              )}
              <AlertDialogFooter className="flex justify-end">
                <AlertDialogCancel onClick={() => setShowBusDetailsDialog(false)}>
                  Close
                </AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Remove Seat Confirmation Dialog */}
          <AlertDialog
            open={!!seatToRemove}
            onOpenChange={(open) => !open && setSeatToRemove(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Seat</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove seat{" "}
                  {seatToRemove?.seatNumber} from this booking? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setSeatToRemove(null)}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemoveSeat}
                  disabled={removingSeat}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {removingSeat ? "Removing..." : "Remove Seat"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </AdminLayout>
  );
}
