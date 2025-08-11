import { useState, useCallback } from "react";
import { paymentsAPI, Payment } from "@/services/superadminApi";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(
    async (params?: {
      page?: number;
      limit?: number;
      userId?: number;
      status?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const res = await paymentsAPI.getAllPayments(params);
        setPayments(res.data.payments);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load payments"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    payments,
    total,
    totalPages,
    currentPage,
    loading,
    error,
    fetchPayments,
    setCurrentPage,
  };
}
