export enum BookingStatus {
  BOOKED = "BOOKED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  ESEWA = "ESEWA",
  KHALTI = "KHALTI",
  IPS_CONNECT = "IPS_CONNECT",
  BANK = "BANK",
  CASH = "CASH",
}

export interface Booking {
  id: number;
  userId: number;
  scheduleId: number;
  seatId: number;
  status: BookingStatus;
  cancellationFee?: number;
  refundedAmount?: number;
  createdAt: Date;
  deletedAt?: Date;
}
