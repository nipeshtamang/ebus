import { useState, useEffect, useCallback, useMemo } from "react";
import { paymentAPI } from "../services/api";

export interface Payment {
  id: number;
  amount: number;
  method: string;
  status: string;
  transactionId?: string;
  createdAt: string;
  user?: {
    name: string;
    email: string;
    phoneNumber: string;
  };
  booking?: {
    schedule: {
      route: {
        origin: string;
        destination: string;
      };
    };
    seat: {
      seatNumber: string;
    };
  };
  seatNumbers?: string[];
}

export interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  refreshPayments: () => Promise<void>;
  totalAmount: number;
  completedAmount: number;
  pendingAmount: number;
  failedAmount: number;
}

export function usePayments(): UsePaymentsReturn {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);

  const fetchPayments = useCallback(
    async (forceRefresh = false) => {
      // Prevent multiple simultaneous requests
      const now = Date.now();
      if (!forceRefresh && now - lastFetch < 2000) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log("Fetching payments...");
        const response = await paymentAPI.getPaymentHistory({
          page: 1,
          limit: 1000,
        });
        console.log("Payments response:", response.data);
        setPayments(response.data.payments || response.data);
        setLastFetch(now);
      } catch (err: unknown) {
        console.error("Error fetching payments:", err);
        let message = "Failed to load payments. Please try again.";
        if (err instanceof Error) message = err.message;
        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [lastFetch]
  );

  const refreshPayments = useCallback(async () => {
    await fetchPayments(true);
  }, [fetchPayments]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Memoize statistics to prevent recalculation on every render
  const statistics = useMemo(() => {
    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const completedAmount = payments
      .filter((p) => (p.status || "").toUpperCase() === "COMPLETED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingAmount = payments
      .filter((p) => (p.status || "").toUpperCase() === "PENDING")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const failedAmount = payments
      .filter((p) => (p.status || "").toUpperCase() === "FAILED")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      totalAmount,
      completedAmount,
      pendingAmount,
      failedAmount,
    };
  }, [payments]);

  return {
    payments,
    loading,
    error,
    refreshPayments,
    ...statistics,
  };
}
