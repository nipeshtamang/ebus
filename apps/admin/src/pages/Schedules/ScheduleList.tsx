import { useState, useEffect } from "react";
import {
  Route,
  Search,
  Calendar,
  MapPin,
  Bus,
  Eye,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

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
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { BusSeatLayout } from "@/components/ui/bus-seat-layout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { scheduleAPI } from "@/services/api";
import { format } from "date-fns";
import { TableSkeleton } from "../../components/ui/skeleton";

interface Schedule {
  id: number;
  departure: string;
  fare: number;
  isReturn: boolean;
  route: {
    id: number;
    origin: string;
    destination: string;
  };
  bus: {
    id: number;
    name: string;
    layoutType: string;
    seatCount: number;
  };
  seats: Array<{
    id: number;
    seatNumber: string;
    isBooked: boolean;
  }>;
}

export function ScheduleList() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [routeFilter, setRouteFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [showBusDetailsDialog, setShowBusDetailsDialog] = useState(false);
  const [selectedBusDetails, setSelectedBusDetails] = useState<Schedule | null>(
    null
  );

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await scheduleAPI.getAllSchedules();
      setSchedules(response.data as Schedule[]);
    } catch (err: unknown) {
      let errorMessage = "Failed to fetch schedules.";
      if (err && typeof err === "object" && "message" in err) {
        errorMessage = (err as { message: string }).message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSchedules();
    setRefreshing(false);
  };

  const openBusDetailsDialog = (schedule: Schedule) => {
    setSelectedBusDetails(schedule);
    setShowBusDetailsDialog(true);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getAvailableSeats = (schedule: Schedule) => {
    return schedule.seats.filter((seat) => !seat.isBooked).length;
  };

  const getOccupancyRate = (schedule: Schedule) => {
    const totalSeats = schedule.seats.length;
    const bookedSeats = totalSeats - getAvailableSeats(schedule);
    return Math.round((bookedSeats / totalSeats) * 100);
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return "text-red-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-green-600";
  };

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch =
      schedule.route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      schedule.route.destination
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      schedule.bus.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRoute =
      routeFilter === "all" ||
      schedule.route.origin.toLowerCase().includes(routeFilter.toLowerCase()) ||
      schedule.route.destination
        .toLowerCase()
        .includes(routeFilter.toLowerCase());

    return matchesSearch && matchesRoute;
  });

  // Get unique routes for filter
  const uniqueRoutes = Array.from(
    new Set(
      schedules.flatMap((schedule) => [
        schedule.route.origin,
        schedule.route.destination,
      ])
    )
  ).sort();

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
        <header className="sticky top-0 z-50 bg-gradient-to-r from-white via-teal-50/50 to-cyan-50/50 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-teal-100 shadow-sm px-4 py-4">
          <div className="max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg">
                  <Route className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    All Schedules
                  </h1>
                  <p className="text-sm text-gray-600">
                    View and manage bus schedules and routes
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
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

        <div className="w-full mx-auto p-4">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Filters */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-teal-600" />
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Search
                  </label>
                  <Input
                    placeholder="Search by route or bus name..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="border-teal-200 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Route Filter
                  </label>
                  <Select value={routeFilter} onValueChange={setRouteFilter}>
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
                      <SelectValue placeholder="All routes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Routes</SelectItem>
                      {uniqueRoutes.map((route) => (
                        <SelectItem key={route} value={route}>
                          {route}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Schedules List */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Schedules ({filteredSchedules.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Route className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No schedules found</p>
                  <p className="text-sm">
                    {searchTerm || routeFilter !== "all"
                      ? "Try adjusting your search criteria."
                      : "No schedules have been created yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredSchedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex items-center justify-between p-6 border border-teal-100 rounded-lg hover:bg-teal-50/50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-teal-600" />
                            <span className="font-medium">
                              {schedule.route.origin} →{" "}
                              {schedule.route.destination}
                            </span>
                            {schedule.isReturn && (
                              <Badge variant="secondary" className="text-xs">
                                Return
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Bus className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {schedule.bus.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            <span className="text-sm text-gray-500">
                              {formatDate(schedule.departure)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium text-teal-600">
                            {formatPrice(schedule.fare)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getAvailableSeats(schedule)} seats available
                          </div>
                          <div
                            className={`text-xs ${getOccupancyColor(getOccupancyRate(schedule))}`}
                          >
                            {getOccupancyRate(schedule)}% occupied
                          </div>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openBusDetailsDialog(schedule)}
                          className="border-teal-200 hover:bg-teal-50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bus Details Dialog */}
        <AlertDialog
          open={showBusDetailsDialog}
          onOpenChange={setShowBusDetailsDialog}
        >
          <AlertDialogContent className="max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle>Bus Details</AlertDialogTitle>
            </AlertDialogHeader>
            {selectedBusDetails && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Bus Name:</span>{" "}
                    {selectedBusDetails.bus.name}
                  </div>
                  <div>
                    <span className="font-medium">Layout:</span>{" "}
                    {selectedBusDetails.bus.layoutType}
                  </div>
                  <div>
                    <span className="font-medium">Total Seats:</span>{" "}
                    {selectedBusDetails.bus.seatCount}
                  </div>
                  <div>
                    <span className="font-medium">Available Seats:</span>{" "}
                    {getAvailableSeats(selectedBusDetails)}
                  </div>
                </div>
                <BusSeatLayout
                  layoutType={selectedBusDetails.bus.layoutType}
                  seats={selectedBusDetails.seats}
                  busName={selectedBusDetails.bus.name}
                  compact={false}
                  showLegend={true}
                />
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Close</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
