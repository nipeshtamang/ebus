import {
  Bus,
  Calendar,
  Clock,
  CreditCard,
  MapPin,
  Users,
  CheckCircle,
  Info,
  Minus,
  Plus,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminLayout } from "../layouts/AdminLayout";
import { useBusBooking, type BusRoute, type SearchForm } from "@/hooks/useBusBooking";
import { SeatButton } from "@/components/booking/SeatButton";
import { SeatLegend } from "@/components/booking/SeatLegend";

interface BusBookingPageProps {
  selectedBus?: BusRoute;
  searchForm?: SearchForm;
}

export function BusBookingPage({
  selectedBus,
  searchForm,
}: BusBookingPageProps) {
  const {
    selectedSeats,
    passengers,
    currentStep,
    handleSeatSelect,
    addPassenger,
    removePassenger,
    updatePassenger,
    goToStep,
    canProceedFromSeats,
    canProceedFromDetails,
    totalAmount,
    taxes,
    finalAmount,
    seatRows,
    getBusInfo,
  } = useBusBooking();

  const busInfo = getBusInfo(selectedBus, searchForm);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 w-full flex-1">
        {/* Header */}
        <header className="bg-white border-b px-4 py-4 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-primary" />
                <span className="font-semibold">BusBooking Pro</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {busInfo.from} → {busInfo.to}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{busInfo.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{busInfo.departureTime}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="w-full flex-1 p-4">
          <div className="grid lg:grid-cols-3 gap-6 w-full">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {currentStep === "seats" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bus className="h-5 w-5" />
                      Select Your Seats
                    </CardTitle>
                    <CardDescription>
                      Choose your preferred seats. Premium seats offer extra
                      legroom and priority boarding. Click again to deselect.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <SeatLegend />

                    {/* Bus Layout */}
                    <div className="bg-gray-100 p-6 rounded-lg">
                      <div className="max-w-md mx-auto">
                        {/* Driver Section */}
                        <div className="flex justify-end mb-4">
                          <div className="w-12 h-8 bg-gray-300 rounded-t-lg flex items-center justify-center text-xs">
                            Driver
                          </div>
                        </div>

                        {/* Seat Rows */}
                        <div className="space-y-3">
                          {seatRows.map((row, rowIndex) => (
                            <div
                              key={rowIndex}
                              className="flex justify-between items-center"
                            >
                              <div className="flex gap-2">
                                <SeatButton
                                  seat={row[0]}
                                  onSeatSelect={handleSeatSelect}
                                />
                                <SeatButton
                                  seat={row[1]}
                                  onSeatSelect={handleSeatSelect}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground px-2">
                                Row {rowIndex + 1}
                              </div>
                              <div className="flex gap-2">
                                <SeatButton
                                  seat={row[2]}
                                  onSeatSelect={handleSeatSelect}
                                />
                                <SeatButton
                                  seat={row[3]}
                                  onSeatSelect={handleSeatSelect}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedSeats.length > 0 && (
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          You have selected {selectedSeats.length} seat(s):{" "}
                          {selectedSeats.map((s) => s.number).join(", ")}
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-end">
                      <Button
                        onClick={() => goToStep("details")}
                        disabled={!canProceedFromSeats}
                      >
                        Continue to Passenger Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === "details" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Passenger Details
                    </CardTitle>
                    <CardDescription>
                      Please provide details for all passengers
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {passengers.map((passenger, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-4 space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">
                            Passenger {index + 1}
                            {selectedSeats[index] && (
                              <Badge variant="secondary" className="ml-2">
                                Seat {selectedSeats[index].number}
                              </Badge>
                            )}
                          </h3>
                          {passengers.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removePassenger(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${index}`}>Full Name *</Label>
                            <Input
                              id={`name-${index}`}
                              value={passenger.name}
                              onChange={(e) =>
                                updatePassenger(index, "name", e.target.value)
                              }
                              placeholder="Enter full name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`age-${index}`}>Age *</Label>
                            <Input
                              id={`age-${index}`}
                              type="number"
                              value={passenger.age}
                              onChange={(e) =>
                                updatePassenger(index, "age", e.target.value)
                              }
                              placeholder="Enter age"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Gender *</Label>
                            <RadioGroup
                              value={passenger.gender}
                              onValueChange={(value) =>
                                updatePassenger(index, "gender", value)
                              }
                              className="flex gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="male"
                                  id={`male-${index}`}
                                />
                                <Label htmlFor={`male-${index}`}>Male</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="female"
                                  id={`female-${index}`}
                                />
                                <Label htmlFor={`female-${index}`}>
                                  Female
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="other"
                                  id={`other-${index}`}
                                />
                                <Label htmlFor={`other-${index}`}>Other</Label>
                              </div>
                            </RadioGroup>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`phone-${index}`}>
                              Phone Number *
                            </Label>
                            <Input
                              id={`phone-${index}`}
                              value={passenger.phone}
                              onChange={(e) =>
                                updatePassenger(index, "phone", e.target.value)
                              }
                              placeholder="Enter phone number"
                            />
                          </div>
                          {index === 0 && (
                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor={`email-${index}`}>
                                Email Address *
                              </Label>
                              <Input
                                id={`email-${index}`}
                                type="email"
                                value={passenger.email}
                                onChange={(e) =>
                                  updatePassenger(
                                    index,
                                    "email",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter email address"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {passengers.length < selectedSeats.length && (
                      <Button
                        variant="outline"
                        onClick={addPassenger}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Passenger
                      </Button>
                    )}

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => goToStep("seats")}
                      >
                        Back to Seat Selection
                      </Button>
                      <Button
                        onClick={() => goToStep("payment")}
                        disabled={!canProceedFromDetails}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === "payment" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Payment Details
                    </CardTitle>
                    <CardDescription>
                      Complete your booking by providing payment information
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number *</Label>
                        <Input
                          id="card-number"
                          placeholder="1234 5678 9012 3456"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date *</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV *</Label>
                          <Input id="cvv" placeholder="123" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="card-name">Cardholder Name *</Label>
                        <Input
                          id="card-name"
                          placeholder="Enter cardholder name"
                        />
                      </div>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Your payment information is secure and encrypted. You
                        will receive a confirmation email after successful
                        booking.
                      </AlertDescription>
                    </Alert>

                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => goToStep("details")}
                      >
                        Back to Details
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Complete Booking - ${finalAmount.toFixed(2)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Summary Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Route:</span>
                      <span className="font-medium">
                        {busInfo.from} → {busInfo.to}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Date:</span>
                      <span className="font-medium">{busInfo.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Time:</span>
                      <span className="font-medium">
                        {busInfo.departureTime}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Duration:</span>
                      <span className="font-medium">{busInfo.duration}</span>
                    </div>
                  </div>

                  <Separator />

                  {selectedSeats.length > 0 && (
                    <>
                      <div className="space-y-2">
                        <h4 className="font-medium">Selected Seats</h4>
                        {selectedSeats.map((seat) => (
                          <div
                            key={seat.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              Seat {seat.number} ({seat.type})
                            </span>
                            <span>${seat.price}</span>
                          </div>
                        ))}
                      </div>
                      <Separator />
                    </>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxes & Fees:</span>
                      <span>${taxes.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Bus Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Bus Type:</span>
                    <span>{busInfo.busType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Operator:</span>
                    <span>{busInfo.operator}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amenities:</span>
                    <span>WiFi, Charging</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
