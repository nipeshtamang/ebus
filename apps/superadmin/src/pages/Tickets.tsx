import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { superAdminAPI } from "@/services/superadminApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLocation } from "react-router-dom";
import { Edit, Trash2, Eye } from "lucide-react";

const PAGE_SIZE = 20;

type Route = { id: number; origin: string; destination: string };
type User = { id: number; name: string; email: string; phoneNumber: string };

type BookingDetails = {
  id: number;
  createdAt: string;
  status: string;
  seat?: { seatNumber: string };
  user?: User;
  schedule?: {
    departure: string;
    route?: Route;
    bus?: { id: number; name: string };
  };
  payment?: {
    id: number;
    amount: number;
    method: string;
    status: string;
    transactionId?: string;
  };
};

type TicketTableRow = {
  id: number;
  ticketNumber: string;
  qrCode?: string;
  bookings: BookingDetails[];
};

type TicketDetails = Omit<TicketTableRow, "bookings"> & {
  bookings: BookingDetails[];
};

const TICKET_STATUSES = ["BOOKED", "CANCELLED", "COMPLETED"];

const Tickets: React.FC = () => {
  const [tickets, setTickets] = useState<TicketTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    routeId: "",
    userId: "",
    status: "",
  });
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<TicketDetails | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const location = useLocation();

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.routeId && { routeId: Number(filters.routeId) }),
        ...(filters.userId && { userId: Number(filters.userId) }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await superAdminAPI.getPaginatedTickets(params);
      setTickets(res.data.tickets);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets, page]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    if (userId) {
      setFilters((prev) => ({ ...prev, userId }));
    }
    // eslint-disable-next-line
  }, [location.search]);

  // Unique routes for filter dropdown
  const routes: Route[] = Array.from(
    tickets
      .flatMap((t) => t.bookings.map((b) => b.schedule?.route))
      .filter((r): r is Route => !!r)
      .reduce((map, r) => map.set(r.id, r), new Map<number, Route>())
      .values()
  );

  // Unique users for filter dropdown
  const users: User[] = Array.from(
    tickets
      .flatMap((t) => t.bookings.map((b) => b.user))
      .filter((u): u is User => !!u)
      .reduce((map, u) => map.set(u.id, u), new Map<number, User>())
      .values()
  );

  const statuses: string[] = Array.from(
    new Set(
      tickets
        .flatMap((t) => t.bookings.map((b) => b.status))
        .filter((s): s is string => !!s)
    )
  );

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  };

  const openViewDialog = async (ticketId: number) => {
    setSelectedTicketId(ticketId);
    setDialogOpen(true);
    setSelectedTicket(null);
    try {
      const res = await superAdminAPI.getTicketById(ticketId);
      setSelectedTicket(res.data);
      // Set initial status to the first booking's status
      setEditStatus(res.data.bookings?.[0]?.status || "");
    } catch (err) {
      toast.error("Failed to load ticket details");
      setDialogOpen(false);
    }
  };

  const handleEditStatus = async () => {
    if (!selectedTicketId || !editStatus || !selectedBookingId) return;
    setEditLoading(true);
    try {
      // Update the specific booking status
      await superAdminAPI.updateBookingStatus(selectedBookingId, {
        status: editStatus,
        reason: "Status updated by admin",
      });
      toast.success("Booking status updated");
      setDialogOpen(false);
      fetchTickets();
    } catch (err) {
      toast.error("Failed to update booking status");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!window.confirm("Are you sure you want to cancel this seat booking?")) {
      return;
    }
    setDeleteLoading(true);
    try {
      await superAdminAPI.cancelBooking(bookingId);
      toast.success("Booking cancelled");
      setDialogOpen(false);
      fetchTickets();
    } catch (err) {
      toast.error("Failed to cancel booking");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicketId) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this ticket? This will cancel all seat bookings. This cannot be undone."
      )
    )
      return;
    setDeleteLoading(true);
    try {
      await superAdminAPI.deleteTicket(selectedTicketId);
      toast.success("Ticket deleted");
      setDialogOpen(false);
      fetchTickets();
    } catch (err) {
      toast.error("Failed to delete ticket");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Group/deduplicate tickets by ticketNumber
  const groupedTicketsMap = new Map<string, TicketTableRow>();
  tickets.forEach((ticket) => {
    if (!groupedTicketsMap.has(ticket.ticketNumber)) {
      groupedTicketsMap.set(ticket.ticketNumber, { ...ticket });
    } else {
      // If duplicate, merge bookings arrays
      const existing = groupedTicketsMap.get(ticket.ticketNumber)!;
      existing.bookings = [...existing.bookings, ...ticket.bookings];
      groupedTicketsMap.set(ticket.ticketNumber, existing);
    }
  });
  const groupedTickets = Array.from(groupedTicketsMap.values());

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Tickets
        </h1>
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs mb-1">Date From</label>
                <Input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleDateChange}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Date To</label>
                <Input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleDateChange}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Route</label>
                <select
                  name="routeId"
                  value={filters.routeId}
                  onChange={handleFilterChange}
                  className="border rounded px-2 py-1"
                >
                  <option value="">All</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.origin} - {r.destination}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">User</label>
                <select
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  className="border rounded px-2 py-1"
                >
                  <option value="">All</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="border rounded px-2 py-1"
                >
                  <option value="">All</option>
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <Button onClick={fetchTickets} variant="outline">
                Apply
              </Button>
            </div>
          </CardContent>
        </Card>
        {error && <ErrorMessage message={error} onRetry={fetchTickets} />}
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : groupedTickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No tickets found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Ticket No
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Booking Date
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Departure Date
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        From - To
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Customer Name
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Customer Contact
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Booked Seats
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedTickets.map((ticket) => {
                      // Get the first booking for display purposes
                      const firstBooking = ticket.bookings[0];
                      const schedule = firstBooking?.schedule;
                      const route = schedule?.route;
                      const user = firstBooking?.user;
                      const seatNumbers = ticket.bookings
                        .map((b) => b.seat?.seatNumber)
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <tr
                          key={ticket.id}
                          className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                        >
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {ticket.ticketNumber}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {firstBooking
                              ? format(
                                  new Date(firstBooking.createdAt),
                                  "yyyy-MM-dd HH:mm"
                                )
                              : "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {schedule
                              ? format(
                                  new Date(schedule.departure),
                                  "yyyy-MM-dd HH:mm"
                                )
                              : "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {route
                              ? `${route.origin} - ${route.destination}`
                              : "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {user ? user.name : "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {user ? user.phoneNumber : "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {seatNumbers || "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            <Badge>{firstBooking?.status || "-"}</Badge>
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openViewDialog(ticket.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
            {/* Pagination Controls */}
            <div className="flex justify-end gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="px-2 py-1">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* Ticket View/Edit/Delete Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Ticket Details - {selectedTicket?.ticketNumber}
              </DialogTitle>
            </DialogHeader>
            {!selectedTicket ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-6">
                {/* Ticket Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Ticket Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Ticket Number:</span>{" "}
                      {selectedTicket.ticketNumber}
                    </div>
                    <div>
                      <span className="font-medium">Total Seats:</span>{" "}
                      {selectedTicket.bookings.length}
                    </div>
                    {selectedTicket.qrCode && (
                      <div className="col-span-2">
                        <span className="font-medium">QR Code:</span>
                        <img
                          src={selectedTicket.qrCode}
                          alt="QR Code"
                          className="w-32 h-32 border rounded mt-2"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Bookings/Seats Table */}
                <div>
                  <h3 className="font-semibold mb-3">Booked Seats</h3>
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-2 text-left">Seat</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Customer</th>
                          <th className="px-4 py-2 text-left">Route</th>
                          <th className="px-4 py-2 text-left">Departure</th>
                          <th className="px-4 py-2 text-left">Payment</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedTicket.bookings.map((booking) => (
                          <tr
                            key={booking.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="px-4 py-2">
                              {booking.seat?.seatNumber || "-"}
                            </td>
                            <td className="px-4 py-2">
                              <Badge>{booking.status}</Badge>
                            </td>
                            <td className="px-4 py-2">
                              {booking.user?.name || "-"}
                              <br />
                              <span className="text-xs text-gray-500">
                                {booking.user?.phoneNumber || "-"}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              {booking.schedule?.route
                                ? `${booking.schedule.route.origin} → ${booking.schedule.route.destination}`
                                : "-"}
                            </td>
                            <td className="px-4 py-2">
                              {booking.schedule?.departure
                                ? format(
                                    new Date(booking.schedule.departure),
                                    "yyyy-MM-dd HH:mm"
                                  )
                                : "-"}
                            </td>
                            <td className="px-4 py-2">
                              {booking.payment ? (
                                <div>
                                  <div>Rs. {booking.payment.amount}</div>
                                  <div className="text-xs text-gray-500">
                                    {booking.payment.method} -{" "}
                                    {booking.payment.status}
                                  </div>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedBookingId(booking.id);
                                    setEditStatus(booking.status);
                                  }}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeleteBooking(booking.id)
                                  }
                                  disabled={deleteLoading}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </div>

                {/* Edit Status Section */}
                {selectedBookingId && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Edit Booking Status</h3>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1">
                        <label className="block text-xs mb-1">Status</label>
                        <Select
                          value={editStatus}
                          onValueChange={setEditStatus}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {TICKET_STATUSES.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleEditStatus} disabled={editLoading}>
                        {editLoading ? "Saving..." : "Save Status"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delete Ticket Section */}
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-red-800">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-600 mb-2">
                    This will cancel all seat bookings for this ticket.
                  </p>
                  <Button
                    onClick={handleDeleteTicket}
                    disabled={deleteLoading}
                    variant="destructive"
                  >
                    {deleteLoading ? "Deleting..." : "Delete Entire Ticket"}
                  </Button>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setSelectedBookingId(null);
                }}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Tickets;
