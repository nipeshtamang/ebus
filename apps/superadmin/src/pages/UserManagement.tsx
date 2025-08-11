import React, { useState, useEffect } from "react";
import {
  Users,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  Ticket,
  UserPlus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { useUserManagement } from "@/hooks/useUserManagement";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { User, TicketTableRow } from "@/services/superadminApi";
import { superAdminAPI } from "@/services/superadminApi";
import { saveAs } from "file-saver";

type TicketDetails = TicketTableRow & {
  qrCode?: string;
  bookings: Array<
    TicketTableRow["bookings"][0] & {
      schedule?: TicketTableRow["bookings"][0]["schedule"] & {
        bus?: { name: string };
      };
      payment?: { amount: number; method?: string; transactionId?: string };
      deletedAt?: string;
    }
  >;
};

const UserManagement: React.FC = () => {
  const {
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    totalPages,
    currentPage,
    setCurrentPage,
    createUser,
    updateUser,
    searchTerm,
    setSearchTerm,
  } = useUserManagement();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "CLIENT" as "SUPERADMIN" | "ADMIN" | "CLIENT",
  });
  const [creating, setCreating] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [editUserData, setEditUserData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "CLIENT",
  });
  const [editing, setEditing] = useState(false);
  const [showTicketsDialog, setShowTicketsDialog] = useState(false);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [userTickets, setUserTickets] = useState<TicketDetails[]>([]);
  const [ticketsUser, setTicketsUser] = useState<User | null>(null);
  const [ticketFilters, setTicketFilters] = useState({
    dateFrom: "",
    dateTo: "",
    status: "",
  });
  const [ticketPage, setTicketPage] = useState(1);
  const TICKETS_PAGE_SIZE = 10;

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, [fetchUsers, currentPage, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCreateUser = async () => {
    setCreating(true);
    try {
      await createUser(newUser);
      setShowCreateDialog(false);
      setNewUser({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        role: "CLIENT",
      });
      fetchUsers(currentPage, searchTerm);
      toast.success("User created successfully!");
    } catch (error) {
      toast.error("Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete);
        setShowDeleteDialog(false);
        setUserToDelete(null);
        fetchUsers(currentPage, searchTerm);
        toast.success("User deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteDialog(true);
  };

  const handleEditClick = (user: User) => {
    setUserToEdit(user);
    setEditUserData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
    });
    setShowEditDialog(true);
  };

  const handleEditUser = async () => {
    if (!userToEdit) return;
    setEditing(true);
    try {
      await updateUser(userToEdit.id, {
        ...editUserData,
        role: editUserData.role as "SUPERADMIN" | "ADMIN" | "CLIENT",
      });
      setShowEditDialog(false);
      setUserToEdit(null);
      fetchUsers(currentPage, searchTerm);
      toast.success("User updated successfully!");
    } catch (error) {
      toast.error("Failed to update user");
    } finally {
      setEditing(false);
    }
  };

  const getRoleColor = (role: string) => {
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
  };

  const getStatusIcon = (role: string) => {
    switch (role.toUpperCase()) {
      case "SUPERADMIN":
        return <Shield className="h-4 w-4" />;
      case "ADMIN":
        return <UserCheck className="h-4 w-4" />;
      case "CLIENT":
        return <Users className="h-4 w-4" />;
      default:
        return <UserX className="h-4 w-4" />;
    }
  };

  const handleViewTickets = async (user: User) => {
    setTicketsUser(user);
    setShowTicketsDialog(true);
    setTicketsLoading(true);
    try {
      const res = await superAdminAPI.getUserTickets(user.id);
      setUserTickets(res.data);
    } catch (err) {
      toast.error("Failed to load tickets");
      setUserTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleTicketFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setTicketFilters((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setTicketPage(1);
  };

  const filteredTickets = userTickets.filter((ticket) => {
    const createdAt = ticket.bookings?.[0]?.createdAt
      ? new Date(ticket.bookings[0].createdAt)
      : null;
    const statusMatch = ticketFilters.status
      ? ticket.bookings[0]?.status === ticketFilters.status
      : true;
    const dateFromMatch = ticketFilters.dateFrom
      ? createdAt && createdAt >= new Date(ticketFilters.dateFrom)
      : true;
    const dateToMatch = ticketFilters.dateTo
      ? createdAt && createdAt <= new Date(ticketFilters.dateTo)
      : true;
    return statusMatch && dateFromMatch && dateToMatch;
  });

  const paginatedTickets = filteredTickets.slice(
    (ticketPage - 1) * TICKETS_PAGE_SIZE,
    ticketPage * TICKETS_PAGE_SIZE
  );
  const totalTicketPages = Math.ceil(
    filteredTickets.length / TICKETS_PAGE_SIZE
  );

  const handleExportCSV = () => {
    const headers = [
      "Ticket #",
      "Booking Date",
      "Status",
      "Route",
      "Bus",
      "Seat",
      "Client",
      "Amount",
    ];
    const rows = filteredTickets.map((ticket) => [
      ticket.ticketNumber,
      ticket.bookings[0]?.createdAt
        ? format(new Date(ticket.bookings[0].createdAt), "yyyy-MM-dd HH:mm")
        : "-",
      ticket.bookings[0]?.status || "-",
      ticket.bookings[0]?.schedule?.route
        ? `${ticket.bookings[0].schedule.route.origin} → ${ticket.bookings[0].schedule.route.destination}`
        : "-",
      ticket.bookings[0]?.schedule?.bus?.name || "-",
      ticket.bookings[0]?.seat?.seatNumber || "-",
      ticket.bookings[0]?.user?.name || "-",
      ticket.bookings[0]?.payment?.amount
        ? `₨${ticket.bookings[0].payment.amount}`
        : "-",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((val) => `"${val}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `tickets_${ticketsUser?.name || "user"}.csv`);
  };

  // Ticket summary stats
  const totalTickets = filteredTickets.length;
  const totalRevenue = filteredTickets.reduce(
    (sum, t) => sum + (t.bookings[0]?.payment?.amount || 0),
    0
  );
  const mostUsedRoute = (() => {
    const routeCounts: Record<string, number> = {};
    filteredTickets.forEach((t) => {
      const route = t.bookings[0]?.schedule?.route
        ? `${t.bookings[0].schedule.route.origin} → ${t.bookings[0].schedule.route.destination}`
        : "-";
      routeCounts[route] = (routeCounts[route] || 0) + 1;
    });
    return (
      Object.entries(routeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "-"
    );
  })();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            User Management
          </h1>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
              <Input
                placeholder="Search users..."
                aria-label="Search users by name or email"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full sm:w-48"
              />
              <div className="text-xs text-muted-foreground">
                Search by name or email
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="name">Name</label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) =>
                        setNewUser({ ...newUser, name: e.target.value })
                      }
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="email">Email</label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) =>
                        setNewUser({ ...newUser, email: e.target.value })
                      }
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="phone">Phone Number</label>
                    <Input
                      id="phone"
                      value={newUser.phoneNumber}
                      onChange={(e) =>
                        setNewUser({ ...newUser, phoneNumber: e.target.value })
                      }
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="password">Password</label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) =>
                        setNewUser({ ...newUser, password: e.target.value })
                      }
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="role">Role</label>
                    <select
                      id="role"
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          role: e.target.value as
                            | "SUPERADMIN"
                            | "ADMIN"
                            | "CLIENT",
                        })
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="CLIENT">Client</option>
                      <option value="ADMIN">Admin</option>
                      <option value="SUPERADMIN">SuperAdmin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser} disabled={creating}>
                    {creating ? "Creating..." : "Add User"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => fetchUsers(currentPage, searchTerm)}
          />
        )}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Registered
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                      >
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap font-semibold">
                          {user.name}
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          {user.phoneNumber}
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          <Badge className={getRoleColor(user.role)}>
                            {getStatusIcon(user.role)}
                            <span className="ml-1">{user.role}</span>
                          </Badge>
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          {format(new Date(user.createdAt), "yyyy-MM-dd")}
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          {user._count?.bookings ?? 0}
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap flex gap-4 items-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewTickets(user)}
                            aria-label={`View tickets for ${user.name}`}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Ticket className="h-4 w-4 mr-1" /> Tickets
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  View all tickets for this user
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditClick(user)}
                            aria-label={`Edit user ${user.name}`}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Edit className="h-4 w-4" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>Edit user</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(user.id)}
                            aria-label={`Delete user ${user.name}`}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span>
                                    <Trash2 className="h-4 w-4" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>Delete user</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Delete</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this user? This action cannot be
                undone and will remove all user data from the system.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="edit-name">Name</label>
                <Input
                  id="edit-name"
                  value={editUserData.name}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-email">Email</label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUserData.email}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-phone">Phone Number</label>
                <Input
                  id="edit-phone"
                  value={editUserData.phoneNumber}
                  onChange={(e) =>
                    setEditUserData({
                      ...editUserData,
                      phoneNumber: e.target.value,
                    })
                  }
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-role">Role</label>
                <select
                  id="edit-role"
                  value={editUserData.role}
                  onChange={(e) =>
                    setEditUserData({ ...editUserData, role: e.target.value })
                  }
                  className="border rounded px-2 py-1"
                >
                  <option value="SUPERADMIN">SUPERADMIN</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="CLIENT">CLIENT</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditUser} disabled={editing}>
                {editing ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={showTicketsDialog} onOpenChange={setShowTicketsDialog}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Tickets for {ticketsUser?.name}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-wrap gap-8 items-center mb-4">
              <div className="text-xs text-muted-foreground">
                Total Tickets: <span className="font-bold">{totalTickets}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Total Revenue:{" "}
                <span className="font-bold">₨{totalRevenue}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Most Used Route:{" "}
                <span className="font-bold">{mostUsedRoute}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 items-end mb-4">
              <div>
                <label className="block text-xs mb-1">Date From</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={ticketFilters.dateFrom}
                  onChange={handleTicketFilterChange}
                  className="border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Date To</label>
                <input
                  type="date"
                  name="dateTo"
                  value={ticketFilters.dateTo}
                  onChange={handleTicketFilterChange}
                  className="border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Status</label>
                <select
                  name="status"
                  value={ticketFilters.status}
                  onChange={handleTicketFilterChange}
                  className="border rounded px-2 py-1"
                >
                  <option value="">All</option>
                  <option value="BOOKED">BOOKED</option>
                  <option value="CANCELLED">CANCELLED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
              <Button size="sm" variant="outline" onClick={handleExportCSV}>
                Export CSV
              </Button>
            </div>
            {ticketsLoading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-8 text-center">No tickets found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                  <thead>
                    <tr>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Ticket #
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>Unique ticket number</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              QR
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>QR code for ticket</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Booking Date
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>
                            Date/time ticket was booked
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Status
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>Booking status</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Route
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>Route of the trip</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Bus
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>Bus name</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Seat
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>Seat number</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Client
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>Client name</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Amount
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>Payment amount</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Method
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>Payment method</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Txn ID
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>Transaction ID</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                              Cancelled At
                            </th>
                          </TooltipTrigger>
                          <TooltipContent>
                            Cancellation date/time
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTickets.map((ticket) => {
                      // Get the first booking for display purposes
                      const firstBooking = ticket.bookings[0];
                      const seatNumbers = ticket.bookings
                        ?.map((b) => b.seat?.seatNumber)
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <tr
                          key={ticket.id}
                          className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                        >
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap font-mono">
                            {ticket.ticketNumber}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {ticket.qrCode ? (
                              <img
                                src={ticket.qrCode}
                                alt="QR"
                                className="h-8 w-8 object-contain"
                              />
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                -
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {firstBooking?.createdAt
                              ? format(
                                  new Date(firstBooking.createdAt),
                                  "yyyy-MM-dd HH:mm"
                                )
                              : "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {firstBooking?.status}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {firstBooking?.schedule?.route
                              ? `${firstBooking.schedule.route.origin} → ${firstBooking.schedule.route.destination}`
                              : "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {firstBooking?.schedule?.bus?.name || "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {seatNumbers || "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {firstBooking?.user?.name || "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {firstBooking?.payment?.amount
                              ? `₨${firstBooking.payment.amount}`
                              : "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {firstBooking?.payment?.method || "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap font-mono text-xs">
                            {firstBooking?.payment?.transactionId || "-"}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {firstBooking?.status === "CANCELLED" &&
                            firstBooking?.deletedAt
                              ? format(
                                  new Date(firstBooking.deletedAt),
                                  "yyyy-MM-dd HH:mm"
                                )
                              : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                  <div className="text-xs text-muted-foreground">
                    Showing {(ticketPage - 1) * TICKETS_PAGE_SIZE + 1} -{" "}
                    {Math.min(
                      ticketPage * TICKETS_PAGE_SIZE,
                      filteredTickets.length
                    )}{" "}
                    of {filteredTickets.length}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={ticketPage === 1}
                      onClick={() => setTicketPage(ticketPage - 1)}
                    >
                      Prev
                    </Button>
                    <span className="text-xs">
                      Page {ticketPage} of {totalTicketPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={ticketPage === totalTicketPages}
                      onClick={() => setTicketPage(ticketPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;
