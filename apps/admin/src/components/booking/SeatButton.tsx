import { Seat } from "@/hooks/useBusBooking";

interface SeatButtonProps {
  seat: Seat;
  onSeatSelect: (seat: Seat) => void;
}

export function SeatButton({ seat, onSeatSelect }: SeatButtonProps) {
  const getSeatColor = () => {
    switch (seat.status) {
      case "available":
        return seat.type === "premium"
          ? "bg-blue-50 border-blue-200 hover:bg-blue-100 text-blue-700"
          : "bg-green-50 border-green-200 hover:bg-green-100 text-green-700";
      case "booked":
        return "bg-red-50 border-red-200 text-red-400 cursor-not-allowed";
      case "selected":
        return "bg-primary border-primary text-primary-foreground";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <button
      className={`w-10 h-10 rounded-lg border-2 text-xs font-medium transition-all ${getSeatColor()}`}
      onClick={() => seat.status !== "booked" && onSeatSelect(seat)}
      disabled={seat.status === "booked"}
      title={`Seat ${seat.number} - $${seat.price} (${seat.type})`}
    >
      {seat.number}
    </button>
  );
}