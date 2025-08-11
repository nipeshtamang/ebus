import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Calendar,
  ArrowLeftRight,
  Bus,
  Clock,
  Star,
  Wifi,
  Zap,
  Coffee,
  Filter,
  SortAsc,
  Moon,
  Sun,
  Navigation,
  TicketIcon as Seat,
  ArrowRight,
  Shield,
  Users,
  ArrowLeft,
  Sparkles,
  Loader2,
  Snowflake,
  Monitor,
  Bed,
  CheckCircle,
  XCircle,
  Ticket,
  TrendingUp,
  Eye,
  DollarSign,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { fleetAPI, scheduleAPI, bookingAPI } from "../services/api";
import { AdminLayout } from "../layouts/AdminLayout";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { BusSeatLayout } from "@/components/ui/bus-seat-layout";
import { SearchableCombobox } from "@/components/ui/searchable-combobox";

// Types
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
    booking?: any;
    reservation?: any;
  }>;
}

interface SearchForm {
  tripType: "oneway" | "roundtrip";
  from: string;
  to: string;
  departureDate: Date;
  returnDate: Date | null;
}

function AmenityIcon({ amenity }: { amenity: string }) {
  const iconMap: { [key: string]: React.ReactNode } = {
    AC: <Snowflake className="h-3 w-3 text-blue-500" />,
    WiFi: <Wifi className="h-3 w-3 text-green-500" />,
    USB: <Zap className="h-3 w-3 text-yellow-500" />,
    Sleeper: <Bed className="h-3 w-3 text-purple-500" />,
  };

  return (
    <div className="flex items-center gap-1 text-xs bg-gray-100 px-2 py-1 rounded-full">
      {iconMap[amenity] || <Zap className="h-3 w-3 text-gray-500" />}
      <span>{amenity}</span>
    </div>
  );
}

function BusCard({
  schedule,
  onSelectSeats,
  onResetSeats,
  onViewDetails,
}: {
  schedule: Schedule;
  onSelectSeats: (schedule: Schedule) => void;
  onResetSeats: (scheduleId: number) => void;
  onViewDetails: (schedule: Schedule) => void;
}) {
  const availableSeats = schedule.seats.filter((seat) => !seat.isBooked).length;
  const totalSeats = schedule.seats.length;
  const occupancyRate = Math.round(
    ((totalSeats - availableSeats) / totalSeats) * 100
  );

  const getAmenities = (busType: string) => {
    const amenities = {
      "AC Sleeper": ["AC", "Sleeper", "WiFi", "USB"],
      "Non-AC Sleeper": ["Sleeper", "USB"],
      "AC Seater": ["AC", "WiFi", "USB"],
      "Non-AC Seater": ["USB"],
    };
    return amenities[busType as keyof typeof amenities] || ["USB"];
  };

  const amenities = getAmenities(schedule.bus.layoutType);

  return (
    <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-teal-50/30 hover:shadow-xl transition-all duration-200">
      <CardContent className="p-4">
        <div className="grid lg:grid-cols-12 gap-3 items-center">
          {/* Route & Bus Info - 5 columns */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="h-4 w-4 text-teal-600" />
              <div>
                <p className="font-semibold text-sm">
                  {schedule.route.origin} → {schedule.route.destination}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(schedule.departure), "MMM dd, yyyy HH:mm")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <Bus className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {schedule.bus.name} ({schedule.bus.layoutType})
              </span>
            </div>
            <div className="flex items-center gap-1">
              {amenities.map((amenity) => (
                <AmenityIcon key={amenity} amenity={amenity} />
              ))}
            </div>
          </div>

          {/* Seats & Occupancy - 3 columns */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-sm">
                <span className="font-medium text-green-600">
                  {availableSeats}
                </span>{" "}
                available
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-600">
                {occupancyRate}% occupied
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  occupancyRate >= 80
                    ? "bg-red-500"
                    : occupancyRate >= 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>

          {/* Price - 2 columns */}
          <div className="lg:col-span-2 text-center">
            <div className="text-lg font-bold text-teal-600 mb-1">
              {formatPrice(schedule.fare)}
            </div>
            <div className="text-xs text-gray-500">per seat</div>
          </div>

          {/* Actions - 2 columns */}
          <div className="lg:col-span-2 space-y-2">
            <Button
              onClick={() => onSelectSeats(schedule)}
              className="w-full bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-xs"
            >
              Select Seats
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full border-teal-200 hover:bg-teal-50 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(schedule);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            {/* Development: Reset seats button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs text-red-600 border-red-200 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                onResetSeats(schedule.id);
              }}
            >
              Reset Seats (Dev)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(price);
};

export function BusSearchPage() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [returnSchedules, setReturnSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBusDetailsDialog, setShowBusDetailsDialog] = useState(false);
  const [selectedBusDetails, setSelectedBusDetails] = useState<Schedule | null>(
    null
  );
  const [searchForm, setSearchForm] = useState<SearchForm>({
    tripType: "oneway",
    from: "",
    to: "",
    departureDate: new Date(),
    returnDate: null,
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fleetAPI.getAllLocations();
      setLocations(response.data);
    } catch (err: any) {
      console.error("Error fetching locations:", err);
      setError("Failed to fetch locations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchForm.from || !searchForm.to || !searchForm.departureDate) {
      setError("Please fill in all required fields");
      return;
    }

    if (searchForm.tripType === "roundtrip" && !searchForm.returnDate) {
      setError("Please select a return date for round trip");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params: any = {
        origin: searchForm.from,
        destination: searchForm.to,
        departureDate: format(searchForm.departureDate, "yyyy-MM-dd"),
        tripType: searchForm.tripType,
      };

      // Add return date for round trip
      if (searchForm.tripType === "roundtrip" && searchForm.returnDate) {
        params.returnDate = format(searchForm.returnDate, "yyyy-MM-dd");
      }

      const response = await scheduleAPI.searchSchedules(params);

      if (searchForm.tripType === "roundtrip") {
        // Handle round-trip response structure
        setSchedules(response.data.outbound || []);
        setReturnSchedules(response.data.return || []);
      } else {
        // Handle one-way response structure
        setSchedules(response.data);
        setReturnSchedules([]);
      }
    } catch (err: any) {
      console.error("Error searching schedules:", err);
      setError(
        err.response?.data?.error ||
          "Failed to search schedules. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBusSelect = (schedule: Schedule) => {
    navigate("/bookings/new", { state: { schedule } });
  };

  const resetSeats = async (scheduleId: number) => {
    try {
      await bookingAPI.resetSeatStatus(scheduleId);
      // Refresh the search results
      if (searchForm.from && searchForm.to) {
        handleSearch();
      }
    } catch (error) {
      console.error("Error resetting seats:", error);
    }
  };

  const swapCities = () => {
    setSearchForm((prev) => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
  };

  const filteredSchedules = schedules.sort((a, b) => {
    return new Date(a.departure).getTime() - new Date(b.departure).getTime();
  });

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMM dd, yyyy HH:mm");
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-white via-teal-50/50 to-cyan-50/50 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-teal-100 shadow-sm px-4 py-4">
          <div className="max-w-7xl">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg">
                <Bus className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Bus Search
              </span>
            </div>
          </div>
        </header>

        <div className="w-full mx-auto p-4">
          {/* Search Form */}
          <Card className="mb-6 shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30">
            <CardHeader className="text-center bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Search Available Buses
              </CardTitle>
              <CardDescription className="text-gray-600">
                Find and book buses for your customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Trip Type Selection */}
              <div className="flex justify-center">
                <RadioGroup
                  value={searchForm.tripType}
                  onValueChange={(value: "oneway" | "roundtrip") =>
                    setSearchForm((prev) => ({ ...prev, tripType: value }))
                  }
                  className="flex gap-8"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="oneway" id="oneway" />
                    <Label htmlFor="oneway" className="font-medium">
                      One Way
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="roundtrip" id="roundtrip" />
                    <Label htmlFor="roundtrip" className="font-medium">
                      Round Trip
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Search Fields */}
              <div className="grid md:grid-cols-5 gap-4 items-end">
                {/* From City */}
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <SearchableCombobox
                    label={undefined}
                    value={searchForm.from}
                    options={locations}
                    placeholder="Departure city"
                    onChange={(value) =>
                      setSearchForm((prev) => ({ ...prev, from: value }))
                    }
                    maxVisible={4}
                  />
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <Button variant="outline" size="icon" onClick={swapCities}>
                    <ArrowLeftRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* To City */}
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <SearchableCombobox
                    label={undefined}
                    value={searchForm.to}
                    options={locations}
                    placeholder="Destination city"
                    onChange={(value) =>
                      setSearchForm((prev) => ({ ...prev, to: value }))
                    }
                    maxVisible={4}
                  />
                </div>

                {/* Departure Date */}
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {format(searchForm.departureDate, "MMM dd")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={searchForm.departureDate}
                        onSelect={(date) =>
                          date &&
                          setSearchForm((prev) => ({
                            ...prev,
                            departureDate: date,
                          }))
                        }
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Search Button */}
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="h-12 px-8 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-5 w-5 mr-2" />
                      Search Buses
                      <Sparkles className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>

              {/* Return Date (if round trip) */}
              {searchForm.tripType === "roundtrip" && (
                <div className="flex justify-center">
                  <div className="w-full max-w-xs space-y-2">
                    <Label>Return Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {searchForm.returnDate
                            ? format(searchForm.returnDate, "MMM dd")
                            : "Select return date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={searchForm.returnDate || undefined}
                          onSelect={(date) =>
                            setSearchForm((prev) => ({
                              ...prev,
                              returnDate: date || null,
                            }))
                          }
                          disabled={(date) => date < searchForm.departureDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <XCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Search Results */}
          {(schedules.length > 0 || returnSchedules.length > 0) && (
            <div className="space-y-6">
              {/* Outbound Results */}
              {schedules.length > 0 && (
                <div className="space-y-4">
                  {/* Results Header */}
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
                    <div>
                      <h2 className="text-2xl font-bold">
                        {searchForm.tripType === "roundtrip"
                          ? "Outbound: "
                          : ""}
                        {searchForm.from} → {searchForm.to}
                      </h2>
                      <p className="text-gray-600">
                        {format(searchForm.departureDate, "EEEE, MMMM d, yyyy")}{" "}
                        • {schedules.length} buses found
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button variant="outline" size="sm">
                        <SortAsc className="h-4 w-4 mr-2" />
                        Sort by Price
                      </Button>
                    </div>
                  </div>

                  {/* Bus Results */}
                  <div className="space-y-4">
                    {filteredSchedules.map((schedule) => (
                      <BusCard
                        key={schedule.id}
                        schedule={schedule}
                        onSelectSeats={handleBusSelect}
                        onResetSeats={resetSeats}
                        onViewDetails={(schedule) => {
                          setSelectedBusDetails(schedule);
                          setShowBusDetailsDialog(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Return Results */}
              {returnSchedules.length > 0 && (
                <div className="space-y-4">
                  {/* Return Results Header */}
                  <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-700">
                        Return: {searchForm.to} → {searchForm.from}
                      </h2>
                      <p className="text-blue-600">
                        {searchForm.returnDate &&
                          format(
                            searchForm.returnDate,
                            "EEEE, MMMM d, yyyy"
                          )}{" "}
                        • {returnSchedules.length} buses found
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 hover:bg-blue-50"
                      >
                        <SortAsc className="h-4 w-4 mr-2" />
                        Sort by Price
                      </Button>
                    </div>
                  </div>

                  {/* Return Bus Results */}
                  <div className="space-y-4">
                    {returnSchedules
                      .sort((a, b) => {
                        return (
                          new Date(a.departure).getTime() -
                          new Date(b.departure).getTime()
                        );
                      })
                      .map((schedule) => (
                        <BusCard
                          key={`return-${schedule.id}`}
                          schedule={schedule}
                          onSelectSeats={handleBusSelect}
                          onResetSeats={resetSeats}
                          onViewDetails={(schedule) => {
                            setSelectedBusDetails(schedule);
                            setShowBusDetailsDialog(true);
                          }}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* No Results */}
          {!loading &&
            schedules.length === 0 &&
            returnSchedules.length === 0 &&
            searchForm.from &&
            searchForm.to && (
              <Card>
                <CardContent className="text-center py-12">
                  <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No buses found</h3>
                  <p className="text-gray-500">
                    {searchForm.tripType === "roundtrip"
                      ? "Try searching for different routes or dates for your round trip"
                      : "Try searching for a different route or date"}
                  </p>
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      {/* Bus Details Dialog */}
      <AlertDialog
        open={showBusDetailsDialog}
        onOpenChange={setShowBusDetailsDialog}
      >
        <AlertDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-teal-600" />
              Bus & Schedule Details - {selectedBusDetails?.bus.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Complete information about the bus and schedule
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedBusDetails && (
            <div className="space-y-4">
              {/* Quick Stats Header */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">
                    {
                      selectedBusDetails.seats.filter((seat) => !seat.isBooked)
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Available Seats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {
                      selectedBusDetails.seats.filter((seat) => seat.isBooked)
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">Booked Seats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    Rs. {selectedBusDetails.fare}
                  </div>
                  <div className="text-sm text-gray-600">Fare per Seat</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(
                      (selectedBusDetails.seats.filter((seat) => seat.isBooked)
                        .length /
                        selectedBusDetails.bus.seatCount) *
                        100
                    )}
                    %
                  </div>
                  <div className="text-sm text-gray-600">Occupancy</div>
                </div>
              </div>

              <div className="grid lg:grid-cols-3 gap-4">
                {/* Left Column - Route & Schedule */}
                <div className="space-y-4">
                  {/* Route Information */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <MapPin className="h-4 w-4 text-teal-600" />
                        Route Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">From:</span>
                        <span className="font-medium">
                          {selectedBusDetails.route.origin}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">To:</span>
                        <span className="font-medium">
                          {selectedBusDetails.route.destination}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Route ID:</span>
                        <span className="font-medium">
                          #{selectedBusDetails.route.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trip Type:</span>
                        <Badge
                          variant={
                            selectedBusDetails.isReturn
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {selectedBusDetails.isReturn ? "Return" : "One Way"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Schedule Information */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Schedule Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                          {format(
                            new Date(selectedBusDetails.departure),
                            "MMM dd, yyyy"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                          {format(
                            new Date(selectedBusDetails.departure),
                            "HH:mm"
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Schedule ID:</span>
                        <span className="font-medium">
                          #{selectedBusDetails.id}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bus Specifications */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Bus className="h-4 w-4 text-purple-600" />
                        Bus Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bus ID:</span>
                        <span className="font-medium">
                          #{selectedBusDetails.bus.id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Layout:</span>
                        <span className="font-medium">
                          {selectedBusDetails.bus.layoutType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Seats:</span>
                        <span className="font-medium">
                          {selectedBusDetails.bus.seatCount}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column - Seat Layout */}
                <div className="lg:col-span-2">
                  <Card className="shadow-sm h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Ticket className="h-4 w-4 text-green-600" />
                        Seat Layout & Availability
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center">
                      <BusSeatLayout
                        seats={selectedBusDetails.seats}
                        layoutType={selectedBusDetails.bus.layoutType}
                        busName={selectedBusDetails.bus.name}
                        compact={true}
                        showLegend={true}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Booked Seats List */}
              {selectedBusDetails.seats.filter((seat) => seat.isBooked).length >
                0 && (
                <Card className="shadow-sm">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Booked Seats (
                      {
                        selectedBusDetails.seats.filter((seat) => seat.isBooked)
                          .length
                      }
                      )
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedBusDetails.seats
                        .filter((seat) => seat.isBooked)
                        .map((seat) => (
                          <Badge
                            key={seat.id}
                            variant="destructive"
                            className="text-xs"
                          >
                            {seat.seatNumber}
                          </Badge>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowBusDetailsDialog(false)}>
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
