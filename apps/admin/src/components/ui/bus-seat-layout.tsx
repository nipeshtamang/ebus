import React from "react";
import { Bus, User, UserCheck, UserX } from "lucide-react";
import { Badge } from "./badge";

interface Booking {
  id: number;
  status: string;
  createdAt: string;
}

interface Reservation {
  id: number;
  expiresAt: string;
}

interface Seat {
  id: number;
  seatNumber: string;
  isBooked: boolean;
  booking?: Booking;
  reservation?: Reservation;
}

interface BusSeatLayoutProps {
  seats: Seat[];
  layoutType: string;
  busName: string;
  className?: string;
  onSeatClick?: (seat: Seat) => void;
  showLegend?: boolean;
  compact?: boolean;
  selectedSeats?: string[];
}

export function BusSeatLayout({
  seats,
  layoutType,
  busName,
  className = "",
  onSeatClick,
  showLegend = true,
  compact = false,
  selectedSeats = [],
}: BusSeatLayoutProps) {
  const seatSize = compact ? "w-10 h-8 text-xs" : "w-14 h-10 text-base";
  const gapSize = compact ? "gap-2" : "gap-4";

  const renderSeat = (seat: Seat, row: number, col: number) => {
    const isDriverSeat = row === 0 && col === 3;
    const isDoor = false; // No door for now
    const isAvailable = !seat.isBooked;
    const isReserved = seat.reservation && !seat.booking;
    const isSelected = selectedSeats.includes(seat.seatNumber);

    if (isDriverSeat) {
      return (
        <div
          key={`driver-${row}-${col}`}
          className={`${seatSize} flex items-center justify-center rounded-lg bg-blue-100 text-blue-700 border-2 border-blue-300 font-bold`}
          title="Driver Seat"
        >
          <Bus className="w-6 h-6" />
        </div>
      );
    }

    if (isDoor) {
      // Not used, but kept for future
      return null;
    }

    let seatClass = "";
    if (isSelected) {
      seatClass = "bg-teal-600 text-white border-teal-700 shadow-lg";
    } else if (isAvailable) {
      seatClass =
        "bg-green-100 text-green-700 border-green-300 hover:bg-green-200 cursor-pointer";
    } else if (isReserved) {
      seatClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
    } else {
      seatClass = "bg-red-100 text-red-700 border-red-300";
    }

    return (
      <div
        key={seat.id}
        className={`${seatSize} flex flex-col items-center justify-center rounded-lg border-2 font-semibold transition-all duration-200 ${seatClass} ${
          onSeatClick && isAvailable ? "hover:scale-105" : ""
        }`}
        onClick={() => onSeatClick && isAvailable && onSeatClick(seat)}
        title={`Seat ${seat.seatNumber} - ${isSelected ? "Selected" : isAvailable ? "Available" : isReserved ? "Reserved" : "Booked"}`}
      >
        <div className="text-base font-bold mb-1">{seat.seatNumber}</div>
        {isAvailable || isSelected ? (
          <User className="w-4 h-4" />
        ) : isReserved ? (
          <UserCheck className="w-4 h-4" />
        ) : (
          <UserX className="w-4 h-4" />
        )}
      </div>
    );
  };

  // Dynamic seat layout based on layoutType and seat count
  const generateDynamicSeatGrid = () => {
    const grid = [];
    const totalSeats = seats.length;
    let seatIndex = 0;

    // Determine layout based on layoutType or seat count
    let cols = 4;
    let seatsPerRow = 4;
    
    // Adjust layout based on bus type or seat count
    if (layoutType?.toLowerCase().includes('2+1') || totalSeats <= 30) {
      cols = 4;
      seatsPerRow = 3; // 2 left + 1 right with aisle
    } else if (layoutType?.toLowerCase().includes('2+2') || totalSeats > 30) {
      cols = 4;
      seatsPerRow = 4; // 2 left + 2 right with aisle
    }

    // Calculate rows needed
    const rows = Math.ceil(totalSeats / seatsPerRow);

    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      
      if (seatsPerRow === 3) {
        // 2+1 layout: seat, seat, aisle, seat
        for (let col = 0; col < cols; col++) {
          if (col === 2) {
            // Aisle
            rowSeats.push(
              <div
                key={`aisle-${row}`}
                className={`${seatSize} rounded-md bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center`}
              >
                <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
              </div>
            );
          } else if (col === 0 || col === 1 || col === 3) {
            // Only place seats in columns 0, 1, and 3
            if (seatIndex < seats.length) {
              rowSeats.push(renderSeat(seats[seatIndex], row, col));
              seatIndex++;
            } else {
              rowSeats.push(
                <div
                  key={`empty-${row}-${col}`}
                  className={`${seatSize} rounded-md bg-gray-50 border border-gray-100`}
                />
              );
            }
          }
        }
      } else {
        // 2+2 layout: seat, seat, aisle, seat, seat
        for (let col = 0; col < cols; col++) {
          if (col === 2) {
            // Aisle
            rowSeats.push(
              <div
                key={`aisle-${row}`}
                className={`${seatSize} rounded-md bg-gradient-to-b from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center`}
              >
                <div className="w-1 h-3 bg-gray-300 rounded-full"></div>
              </div>
            );
          } else {
            // Place seats in columns 0, 1, 3
            if (seatIndex < seats.length) {
              rowSeats.push(renderSeat(seats[seatIndex], row, col));
              seatIndex++;
            } else {
              rowSeats.push(
                <div
                  key={`empty-${row}-${col}`}
                  className={`${seatSize} rounded-md bg-gray-50 border border-gray-100`}
                />
              );
            }
          }
        }
      }
      
      grid.push(
        <div key={row} className={`flex ${gapSize} justify-center`}>
          {rowSeats}
        </div>
      );
    }
    return grid;
  };

  const generateSeatGrid = () => {
    // Use dynamic layout based on bus configuration
    return generateDynamicSeatGrid();
  };

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      {/* Bus Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Bus className="h-5 w-5 text-teal-600" />
          <h3 className="font-semibold text-gray-800">{busName}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {layoutType}
        </Badge>
      </div>

      {/* Seat Layout */}
      <div className="flex justify-center">
        <div className={`space-y-${compact ? "1" : "2"}`}>
          {/* Bus Front */}
          <div className="flex justify-center mb-2">
            <div className="bg-gradient-to-r from-gray-300 to-gray-400 rounded-t-lg px-4 py-2 text-xs font-medium text-gray-700">
              🚌 Bus Front
            </div>
          </div>

          {generateSeatGrid()}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded flex items-center justify-center">
                <User className="w-2 h-2 text-green-700" />
              </div>
              <span className="text-gray-600">Available</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded flex items-center justify-center">
                <UserCheck className="w-2 h-2 text-yellow-700" />
              </div>
              <span className="text-gray-600">Reserved</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded flex items-center justify-center">
                <UserX className="w-2 h-2 text-red-700" />
              </div>
              <span className="text-gray-600">Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded flex items-center justify-center">
                <Bus className="w-2 h-2 text-blue-700" />
              </div>
              <span className="text-gray-600">Driver</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
