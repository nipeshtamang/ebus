import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  Bus,
  CreditCard,
  TrendingUp,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Ticket,
  CheckCircle,
  XCircle,
  BarChart3,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AdminLayout } from "@/layouts/AdminLayout";
import { useDashboard } from "@/hooks/useDashboard";
import { StatsSkeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import { bookingAPI } from "@/services/api";
import ROUTES from "@/Routes/routes";

const AdminDashboard: React.FC = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    stats,
    recentBookings,
    loading,
    error,
    refreshDashboard,
    refreshing,
    setRefreshing,
  } = useDashboard();

  // Show success message if redirected from booking
  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.message);
      // Clear the state to prevent showing the message again on refresh
      window.history.replaceState({}, document.title);

      // Refresh dashboard data to show the new booking
      refreshDashboard();

      // Auto-hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, [location.state, refreshDashboard]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await refreshDashboard();
      setSuccessMessage("Dashboard refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing dashboard:", error);
      setErrorMessage("Failed to refresh dashboard. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleCleanup = async () => {
    try {
      setRefreshing(true);
      const response = await bookingAPI.cleanupOrphanedBookings();
      await refreshDashboard();
      const cleanedCount = response.data?.cleanedCount || 0;
      setSuccessMessage(
        `Database cleaned up successfully! Removed ${cleanedCount} orphaned bookings.`
      );
    } catch (error) {
      console.error("Error cleaning up:", error);
      setErrorMessage("Failed to cleanup database. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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

  const filteredRecentBookings = recentBookings.filter(
    (booking) =>
      booking.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user?.phoneNumber.includes(searchTerm) ||
      booking.schedule.route.origin
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      booking.schedule.route.destination
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
          <div className="w-full h-full p-4 md:p-6 lg:p-8">
            <StatsSkeleton />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30 flex items-center justify-center p-4">
          <ErrorMessage message={error} onRetry={refreshDashboard} />
        </div>
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
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Admin Dashboard
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600">
                    Overview of your bus booking system
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
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
                <Button
                  variant="outline"
                  onClick={handleCleanup}
                  disabled={refreshing}
                  className="border-orange-200 hover:bg-orange-50 text-orange-600"
                >
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Cleanup DB
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {successMessage && (
            <SuccessMessage
              message={successMessage}
              onDismiss={() => setSuccessMessage(null)}
              className="mb-6"
            />
          )}

          {errorMessage && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {errorMessage}
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Stats Cards */}
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
                  {stats.totalBookings}
                </div>
                <p className="text-xs text-gray-500">All time bookings</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Active Schedules
                </CardTitle>
                <Bus className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {stats.totalSchedules}
                </div>
                <p className="text-xs text-gray-500">Available schedules</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {formatPrice(stats.totalRevenue)}
                </div>
                <p className="text-xs text-gray-500">Completed payments</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Payments
                </CardTitle>
                <CreditCard className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {stats.totalPayments}
                </div>
                <p className="text-xs text-gray-500">Payment transactions</p>
              </CardContent>
            </Card>
          </div>

          {/* Booking Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-yellow-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  Pending Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pendingBookings}
                </div>
                <p className="text-xs text-gray-500">Awaiting confirmation</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Completed Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.completedBookings}
                </div>
                <p className="text-xs text-gray-500">Successfully completed</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-red-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  Cancelled Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.cancelledBookings}
                </div>
                <p className="text-xs text-gray-500">Cancelled reservations</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-teal-600" />
                  Recent Bookings
                </CardTitle>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <div className="relative w-full sm:w-auto">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchTerm(e.target.value)
                      }
                      className="pl-10 w-full sm:w-64 border-teal-200 focus:border-teal-500"
                    />
                  </div>
                  <Link to={ROUTES.BookingList}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-teal-200 hover:bg-teal-50 w-full sm:w-auto"
                    >
                      View All
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {filteredRecentBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? "No bookings found matching your search."
                    : "No recent bookings."}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRecentBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-teal-100 rounded-lg hover:bg-teal-50/50 transition-all duration-200 gap-4"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="font-medium truncate">
                              {booking.user.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({booking.user.phoneNumber})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {booking.schedule.route.origin} →{" "}
                              {booking.schedule.route.destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-500">
                              {formatDate(booking.schedule.departure)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium text-teal-600">
                            Rs. {booking.totalAmount}
                          </div>
                          <div className="text-sm text-gray-500">
                            Seats: {booking.seatNumbers.join(", ")}
                          </div>
                          {booking.payment && (
                            <div className="text-xs text-gray-400 mt-1">
                              {booking.payment.method} -{" "}
                              {booking.payment.status}
                            </div>
                          )}
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(booking.status)}
                            {booking.status}
                          </div>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
