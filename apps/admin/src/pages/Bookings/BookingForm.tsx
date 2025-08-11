import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Bus,
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertCircle,
  Receipt,
  Shield,
  Ticket,
  ArrowRight,
  Calendar,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { format } from "date-fns";
import { AdminLayout } from "../../layouts/AdminLayout";
import { bookingAPI } from "../../services/api";
import { BusSeatLayout } from "@/components/ui/bus-seat-layout";

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

interface BookingFormData {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  selectedSeats: string[];
  paymentMethod: "ESEWA" | "KHALTI" | "IPS_CONNECT" | "BANK" | "CASH";
  totalAmount: number;
}

export function BookingForm() {
  const location = useLocation();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingFormData>({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    selectedSeats: [],
    paymentMethod: "CASH",
    totalAmount: 0,
  });

  useEffect(() => {
    if (location.state?.schedule) {
      setSchedule(location.state.schedule);
      setBookingData((prev) => ({
        ...prev,
        totalAmount:
          location.state.schedule.fare *
          (location.state.schedule.seats.length || 1),
      }));
    } else {
      navigate("/bus-search");
    }
  }, [location.state, navigate]);

  const handleSeatSelection = (seatNumber: string) => {
    setBookingData((prev) => {
      const isSelected = prev.selectedSeats.includes(seatNumber);
      let newSeats;

      if (isSelected) {
        newSeats = prev.selectedSeats.filter((seat) => seat !== seatNumber);
      } else {
        newSeats = [...prev.selectedSeats, seatNumber];
      }

      return {
        ...prev,
        selectedSeats: newSeats,
        totalAmount: schedule ? schedule.fare * newSeats.length : 0,
      };
    });
  };

  const handleSubmit = async () => {
    if (!schedule || bookingData.selectedSeats.length === 0) {
      setError("Please select at least one seat");
      return;
    }

    if (
      !bookingData.customerName ||
      !bookingData.customerPhone ||
      !bookingData.customerEmail
    ) {
      setError("Please fill in all customer details (name, phone, and email)");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.customerEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingPayload = {
        scheduleId: schedule.id,
        passengers: bookingData.selectedSeats.map((seatNumber) => ({
          seatNumber,
          passengerName: bookingData.customerName,
          passengerPhone: bookingData.customerPhone,
          passengerEmail: bookingData.customerEmail,
        })),
        bookerName: bookingData.customerName,
        bookerPhone: bookingData.customerPhone,
        bookerEmail: bookingData.customerEmail,
        paymentMethod: bookingData.paymentMethod.toUpperCase(),
      };

      console.log("Submitting booking payload:", bookingPayload);

      const response = await bookingAPI.createBookingForUser(bookingPayload);

      console.log("Booking response:", response.data);

      // Show success message and redirect to All Bookings
      navigate("/bookings", {
        state: {
          success: true,
          bookingId: response.data.order?.id || response.data.bookings?.[0]?.id,
          message: `Booking confirmed successfully! Ticket has been sent to ${bookingData.customerEmail}`,
        },
      });
    } catch (err: unknown) {
      console.error("Error creating booking:", err);

      // Handle specific error cases
      let errorMessage = "Failed to create booking. Please try again.";

      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response &&
        err.response.data &&
        typeof err.response.data === "object" &&
        "error" in err.response.data
      ) {
        errorMessage = (err.response.data as { error: string }).error;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const availableSeats = schedule?.seats.filter((seat) => !seat.isBooked) || [];
  const selectedSeatsCount = bookingData.selectedSeats.length;

  // Calculate total amount: 0 if no seats selected
  const totalAmount =
    schedule && bookingData.selectedSeats.length > 0
      ? schedule.fare * bookingData.selectedSeats.length
      : 0;

  if (!schedule) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30 flex items-center justify-center p-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading schedule details...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (schedule && availableSeats.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-gray-500">
            <svg
              className="mx-auto mb-4"
              width="48"
              height="48"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" stroke="#CBD5E1" strokeWidth="2" />
              <path
                d="M8 12h8M12 8v8"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <div className="text-lg font-semibold">
              No available seats for this schedule.
            </div>
            <div className="text-sm">
              Please select a different schedule or try again later.
            </div>
          </div>
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
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Create New Booking
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600">
                    Book seats for passengers
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="border-teal-200 hover:bg-teal-50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            </div>
          )}

          {/* Progress Steps */}
          <div className="mb-6 md:mb-8">
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= 1
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep > 1 ? <CheckCircle className="h-4 w-4" /> : "1"}
                </div>
                <div
                  className={`h-1 w-16 ${
                    currentStep >= 2 ? "bg-teal-600" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= 2
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep > 2 ? <CheckCircle className="h-4 w-4" /> : "2"}
                </div>
                <div
                  className={`h-1 w-16 ${
                    currentStep >= 3 ? "bg-teal-600" : "bg-gray-300"
                  }`}
                />
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    currentStep >= 3
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {currentStep > 3 ? <CheckCircle className="h-4 w-4" /> : "3"}
                </div>
              </div>
            </div>
            <div className="flex justify-center mt-2 text-sm text-gray-600">
              <span
                className={currentStep >= 1 ? "text-teal-600 font-medium" : ""}
              >
                Customer Details
              </span>
              <span className="mx-4">→</span>
              <span
                className={currentStep >= 2 ? "text-teal-600 font-medium" : ""}
              >
                Seat Selection
              </span>
              <span className="mx-4">→</span>
              <span
                className={currentStep >= 3 ? "text-teal-600 font-medium" : ""}
              >
                Payment & Confirm
              </span>
            </div>
          </div>

          {/* Schedule Summary */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 mb-6 md:mb-8">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-teal-600" />
                Schedule Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="font-medium">
                      {schedule.route.origin} → {schedule.route.destination}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Bus className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-600">Bus</p>
                    <p className="font-medium">{schedule.bus.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-600">Departure</p>
                    <p className="font-medium">
                      {format(
                        new Date(schedule.departure),
                        "MMM d, yyyy 'at' HH:mm"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-teal-600" />
                  <div>
                    <p className="text-sm text-gray-600">Fare per Seat</p>
                    <p className="font-medium">Rs. {schedule.fare}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Seat Selection */}
              {currentStep === 1 && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-teal-600" />
                      Select Seats
                    </CardTitle>
                    <CardDescription>
                      Choose seats for your customer. Available seats are shown
                      in green.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4 text-lg font-semibold text-teal-700">
                      Selected Seats:{" "}
                      {bookingData.selectedSeats.length > 0
                        ? bookingData.selectedSeats.join(", ")
                        : "None"}
                    </div>
                    <BusSeatLayout
                      seats={schedule.seats.map((seat) => ({
                        ...seat,
                        booking: undefined,
                        reservation: undefined,
                      }))}
                      layoutType={schedule.bus.layoutType}
                      busName={schedule.bus.name}
                      onSeatClick={(seat) => {
                        if (!seat.isBooked)
                          handleSeatSelection(seat.seatNumber);
                      }}
                      showLegend={true}
                      selectedSeats={bookingData.selectedSeats}
                    />
                    <div className="mt-6 flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-100 rounded"></div>
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-teal-600 rounded"></div>
                          <span>Selected</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-red-100 rounded"></div>
                          <span>Booked</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setCurrentStep(2)}
                        disabled={selectedSeatsCount === 0}
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                      >
                        Continue ({selectedSeatsCount} seats selected)
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 2: Customer Details */}
              {currentStep === 2 && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5 text-teal-600" />
                      Customer Information
                    </CardTitle>
                    <CardDescription>
                      Enter the customer's details for the booking.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerName">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="customerName"
                            value={bookingData.customerName}
                            onChange={(e) =>
                              setBookingData((prev) => ({
                                ...prev,
                                customerName: e.target.value,
                              }))
                            }
                            className="pl-10"
                            placeholder="Enter customer name"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="customerPhone">Phone Number *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <Input
                            id="customerPhone"
                            value={bookingData.customerPhone}
                            onChange={(e) =>
                              setBookingData((prev) => ({
                                ...prev,
                                customerPhone: e.target.value,
                              }))
                            }
                            className="pl-10"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">Email (Optional)</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="customerEmail"
                          type="email"
                          value={bookingData.customerEmail}
                          onChange={(e) =>
                            setBookingData((prev) => ({
                              ...prev,
                              customerEmail: e.target.value,
                            }))
                          }
                          className="pl-10"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(1)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>

                      <Button
                        onClick={() => setCurrentStep(3)}
                        disabled={
                          !bookingData.customerName ||
                          !bookingData.customerPhone
                        }
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700"
                      >
                        Continue
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Step 3: Payment & Confirmation */}
              {currentStep === 3 && (
                <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30">
                  <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-teal-600" />
                      Payment & Confirmation
                    </CardTitle>
                    <CardDescription>
                      Choose payment method and review booking details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Payment Method */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold">
                        Payment Method
                      </Label>
                      <RadioGroup
                        value={bookingData.paymentMethod}
                        onValueChange={(
                          value:
                            | "ESEWA"
                            | "KHALTI"
                            | "IPS_CONNECT"
                            | "BANK"
                            | "CASH"
                        ) =>
                          setBookingData((prev) => ({
                            ...prev,
                            paymentMethod: value,
                          }))
                        }
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="CASH" id="cash" />
                          <Label
                            htmlFor="cash"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Receipt className="h-5 w-5 text-green-600" />
                            <div>
                              <div className="font-medium">Cash Payment</div>
                              <div className="text-sm text-gray-500">
                                Pay at counter
                              </div>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="ESEWA" id="esewa" />
                          <Label
                            htmlFor="esewa"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <CreditCard className="h-5 w-5 text-blue-600" />
                            <div>
                              <div className="font-medium">ESEWA</div>
                              <div className="text-sm text-gray-500">
                                Digital wallet
                              </div>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="KHALTI" id="khalti" />
                          <Label
                            htmlFor="khalti"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <CreditCard className="h-5 w-5 text-purple-600" />
                            <div>
                              <div className="font-medium">KHALTI</div>
                              <div className="text-sm text-gray-500">
                                Digital wallet
                              </div>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem
                            value="IPS_CONNECT"
                            id="ips_connect"
                          />
                          <Label
                            htmlFor="ips_connect"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <CreditCard className="h-5 w-5 text-pink-600" />
                            <div>
                              <div className="font-medium">IPS Connect</div>
                              <div className="text-sm text-gray-500">
                                Bank transfer
                              </div>
                            </div>
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <RadioGroupItem value="BANK" id="bank" />
                          <Label
                            htmlFor="bank"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <CreditCard className="h-5 w-5 text-yellow-600" />
                            <div>
                              <div className="font-medium">Bank Transfer</div>
                              <div className="text-sm text-gray-500">
                                Direct transfer
                              </div>
                            </div>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Booking Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <h3 className="font-semibold text-lg">Booking Summary</h3>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Customer:</span>
                          <span className="font-medium">
                            {bookingData.customerName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">
                            {bookingData.customerPhone}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seats:</span>
                          <span className="font-medium">
                            {bookingData.selectedSeats.join(", ")}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Seats Count:</span>
                          <span className="font-medium">
                            {selectedSeatsCount}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price per Seat:</span>
                          <span className="font-medium">
                            Rs. {schedule.fare}
                          </span>
                        </div>
                        <div className="border-t pt-2">
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total Amount:</span>
                            <span className="text-teal-600">
                              Rs. {totalAmount}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                      </Button>

                      <Button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 px-8"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Confirm Booking
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Booking Summary Card */}
              <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 sticky top-24">
                <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-teal-600" />
                    Booking Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Route:</span>
                      <span className="font-medium">
                        {schedule.route.origin} → {schedule.route.destination}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">
                        {format(new Date(schedule.departure), "MMM dd, yyyy")}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">
                        {format(new Date(schedule.departure), "HH:mm")}
                      </span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bus:</span>
                      <span className="font-medium">{schedule.bus.name}</span>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Selected Seats:</span>
                      <span className="font-medium">{selectedSeatsCount}</span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span className="text-teal-600">Rs. {totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {bookingData.paymentMethod && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <Shield className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          {bookingData.paymentMethod === "CASH"
                            ? "Cash Payment - Immediate Confirmation"
                            : `${bookingData.paymentMethod} Payment - Pending Confirmation`}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
