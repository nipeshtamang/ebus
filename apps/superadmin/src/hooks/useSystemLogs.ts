import { useState, useEffect, useCallback } from "react";
import { superAdminAPI, SystemLog } from "@/services/superadminApi";

interface LogsFilters {
  dateFrom: string;
  dateTo: string;
  action: string;
  entity: string;
  userId: string;
}

const PAGE_SIZE = 20;

export const useSystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<LogsFilters>({
    dateFrom: "",
    dateTo: "",
    action: "all",
    entity: "all",
    userId: "all",
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
        ...(filters.dateTo && { dateTo: filters.dateTo }),
        ...(filters.action &&
          filters.action !== "all" && { action: filters.action }),
        ...(filters.entity &&
          filters.entity !== "all" && { entity: filters.entity }),
        ...(filters.userId &&
          filters.userId !== "all" && { userId: Number(filters.userId) }),
      };
      const res = await superAdminAPI.getPaginatedSystemLogs(params);
      setLogs(res.data.logs);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const handleFilterChange = useCallback((name: keyof LogsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      action: "all",
      entity: "all",
      userId: "all",
    });
    setPage(1);
  }, []);

  const getActionColor = useCallback((action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "LOGIN":
        return "bg-purple-100 text-purple-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      case "BACKUP":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  // Get unique actions/entities from current logs for filter dropdowns
  const getUniqueActions = useCallback(() => {
    return Array.from(new Set(logs.map((l) => l.action))).filter(Boolean);
  }, [logs]);

  const getUniqueEntities = useCallback(() => {
    return Array.from(new Set(logs.map((l) => l.entity))).filter(Boolean);
  }, [logs]);

  const getUniqueUsers = useCallback(() => {
    return logs
      .filter((l) => l.user)
      .map((l) => l.user!)
      .filter((u, i, arr) => arr.findIndex((x) => x.id === u.id) === i);
  }, [logs]);

  const goToPage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const goToPreviousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  const getPaginationInfo = useCallback(() => {
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, logs.length);
    return { start, end, total: logs.length };
  }, [page, logs.length]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return {
    logs,
    loading,
    error,
    page,
    totalPages,
    filters,
    fetchLogs,
    handleFilterChange,
    clearFilters,
    getActionColor,
    getUniqueActions,
    getUniqueEntities,
    getUniqueUsers,
    goToPage,
    goToPreviousPage,
    goToNextPage,
    getPaginationInfo,
  };
};