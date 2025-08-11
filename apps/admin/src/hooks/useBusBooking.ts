import { useState, useCallback } from "react";

// Types
export interface Seat {
  id: string;
  number: string;
  status: "available" | "booked" | "selected";
  price: number;
  type: "regular" | "premium";
}

export interface PassengerInfo {
  name: string;
  age: string;
  gender: string;
  phone: string;
  email: string;
}

export interface BusRoute {
  id: string;
  operator: string;
  busType: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  price: number;
  rating: number;
  amenities: string[];
  seatsAvailable: number;
  totalSeats: number;
  from: string;
  to: string;
  date: string;
}

export interface SearchForm {
  from: string;
  to: string;
  departureDate: Date | null;
}

export type BookingStep = "seats" | "details" | "payment";

// Sample bus layout data - in real app this would come from API
const initialBusSeats: Seat[] = [
  // Front rows (Premium)
  { id: "1A", number: "1A", status: "available", price: 45, type: "premium" },
  { id: "1B", number: "1B", status: "booked", price: 45, type: "premium" },
  { id: "1C", number: "1C", status: "available", price: 45, type: "premium" },
  { id: "1D", number: "1D", status: "available", price: 45, type: "premium" },

  { id: "2A", number: "2A", status: "available", price: 45, type: "premium" },
  { id: "2B", number: "2B", status: "available", price: 45, type: "premium" },
  { id: "2C", number: "2C", status: "booked", price: 45, type: "premium" },
  { id: "2D", number: "2D", status: "available", price: 45, type: "premium" },

  // Regular rows
  { id: "3A", number: "3A", status: "available", price: 35, type: "regular" },
  { id: "3B", number: "3B", status: "available", price: 35, type: "regular" },
  { id: "3C", number: "3C", status: "available", price: 35, type: "regular" },
  { id: "3D", number: "3D", status: "booked", price: 35, type: "regular" },

  { id: "4A", number: "4A", status: "available", price: 35, type: "regular" },
  { id: "4B", number: "4B", status: "available", price: 35, type: "regular" },
  { id: "4C", number: "4C", status: "available", price: 35, type: "regular" },
  { id: "4D", number: "4D", status: "available", price: 35, type: "regular" },

  { id: "5A", number: "5A", status: "available", price: 35, type: "regular" },
  { id: "5B", number: "5B", status: "booked", price: 35, type: "regular" },
  { id: "5C", number: "5C", status: "available", price: 35, type: "regular" },
  { id: "5D", number: "5D", status: "available", price: 35, type: "regular" },

  { id: "6A", number: "6A", status: "available", price: 35, type: "regular" },
  { id: "6B", number: "6B", status: "available", price: 35, type: "regular" },
  { id: "6C", number: "6C", status: "available", price: 35, type: "regular" },
  { id: "6D", number: "6D", status: "available", price: 35, type: "regular" },

  { id: "7A", number: "7A", status: "available", price: 35, type: "regular" },
  { id: "7B", number: "7B", status: "available", price: 35, type: "regular" },
  { id: "7C", number: "7C", status: "available", price: 35, type: "regular" },
  { id: "7D", number: "7D", status: "available", price: 35, type: "regular" },

  { id: "8A", number: "8A", status: "available", price: 35, type: "regular" },
  { id: "8B", number: "8B", status: "available", price: 35, type: "regular" },
  { id: "8C", number: "8C", status: "available", price: 35, type: "regular" },
  { id: "8D", number: "8D", status: "available", price: 35, type: "regular" },

  { id: "9A", number: "9A", status: "available", price: 35, type: "regular" },
  { id: "9B", number: "9B", status: "available", price: 35, type: "regular" },
  { id: "9C", number: "9C", status: "available", price: 35, type: "regular" },
  { id: "9D", number: "9D", status: "available", price: 35, type: "regular" },

  { id: "10A", number: "10A", status: "available", price: 35, type: "regular" },
  { id: "10B", number: "10B", status: "available", price: 35, type: "regular" },
  { id: "10C", number: "10C", status: "available", price: 35, type: "regular" },
  { id: "10D", number: "10D", status: "available", price: 35, type: "regular" },
];

export function useBusBooking() {
  const [seats, setSeats] = useState<Seat[]>(initialBusSeats);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([
    { name: "", age: "", gender: "", phone: "", email: "" },
  ]);
  const [currentStep, setCurrentStep] = useState<BookingStep>("seats");

  // Seat selection logic
  const handleSeatSelect = useCallback((seat: Seat) => {
    setSeats((prevSeats) => {
      const updatedSeats = prevSeats.map((s) => {
        if (s.id === seat.id) {
          const newStatus = s.status === "selected" ? "available" : "selected";
          return { ...s, status: newStatus };
        }
        return s;
      });
      return updatedSeats as Seat[];
    });

    setSelectedSeats((prev) => {
      if (seat.status === "selected") {
        // Remove from selected seats
        return prev.filter((s) => s.id !== seat.id);
      } else {
        // Add to selected seats
        return [...prev, { ...seat, status: "selected" }];
      }
    });
  }, []);

  // Passenger management logic
  const addPassenger = useCallback(() => {
    setPassengers((prev) => {
      if (prev.length < selectedSeats.length) {
        return [
          ...prev,
          { name: "", age: "", gender: "", phone: "", email: "" },
        ];
      }
      return prev;
    });
  }, [selectedSeats.length]);

  const removePassenger = useCallback((index: number) => {
    setPassengers((prev) => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  }, []);

  const updatePassenger = useCallback(
    (index: number, field: keyof PassengerInfo, value: string) => {
      setPassengers((prev) =>
        prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
      );
    },
    []
  );

  // Step navigation logic
  const goToStep = useCallback((step: BookingStep) => {
    setCurrentStep(step);
  }, []);

  const canProceedFromSeats = selectedSeats.length > 0;
  const canProceedFromDetails = passengers.every(
    (p, index) =>
      p.name &&
      p.age &&
      p.gender &&
      p.phone &&
      (index === 0 ? p.email : true) // Only first passenger needs email
  );

  // Pricing calculations
  const totalAmount = selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  const taxes = totalAmount * 0.1;
  const finalAmount = totalAmount + taxes;

  // Seat layout helpers
  const seatRows = [];
  for (let i = 0; i < seats.length; i += 4) {
    seatRows.push(seats.slice(i, i + 4));
  }

  // Bus info helper
  const getBusInfo = useCallback(
    (selectedBus?: BusRoute, searchForm?: SearchForm) => {
      return (
        selectedBus || {
          operator: "Express Lines",
          busType: "AC Sleeper",
          from: searchForm?.from || "New York",
          to: searchForm?.to || "Boston",
          departureTime: "08:30 AM",
          arrivalTime: "01:00 PM",
          duration: "4h 30m",
          date: searchForm?.departureDate
            ? searchForm.departureDate.toLocaleDateString("en-US", {
                month: "short",
                day: "2-digit",
                year: "numeric",
              })
            : "Jan 15, 2024",
        }
      );
    },
    []
  );

  return {
    // State
    seats,
    selectedSeats,
    passengers,
    currentStep,
    
    // Actions
    handleSeatSelect,
    addPassenger,
    removePassenger,
    updatePassenger,
    goToStep,
    
    // Computed values
    canProceedFromSeats,
    canProceedFromDetails,
    totalAmount,
    taxes,
    finalAmount,
    seatRows,
    getBusInfo,
  };
}