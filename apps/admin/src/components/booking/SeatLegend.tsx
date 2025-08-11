export function SeatLegend() {
  return (
    <div className="flex flex-wrap gap-4 text-sm">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 bg-green-50 border-green-200"></div>
        <span>Available</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 bg-primary border-primary"></div>
        <span>Selected</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 bg-red-50 border-red-200"></div>
        <span>Booked</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded border-2 bg-blue-50 border-blue-200"></div>
        <span>Premium (+$10)</span>
      </div>
    </div>
  );
}