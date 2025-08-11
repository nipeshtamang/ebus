import { useState, useEffect, useCallback } from "react";
import { superAdminAPI, SummaryReport, Bus } from "@/services/superadminApi";

interface ReportsFilters {
  dateFrom: string;
  dateTo: string;
  routeId: string;
  busId: string;
}

export const useReports = () => {
  const [report, setReport] = useState<SummaryReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [routes, setRoutes] = useState<
    { id: number; name: string; origin: string; destination: string }[]
  >([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [filters, setFilters] = useState<ReportsFilters>({
    dateFrom: "",
    dateTo: "",
    routeId: "",
    busId: "",
  });

  const fetchReport = useCallback(() => {
    setLoading(true);
    setError(null);
    superAdminAPI
      .getSummaryReport({
        params: {
          ...(filters.dateFrom && { dateFrom: filters.dateFrom }),
          ...(filters.dateTo && { dateTo: filters.dateTo }),
          ...(filters.routeId && { routeId: filters.routeId }),
          ...(filters.busId && { busId: filters.busId }),
        },
      })
      .then((res) => setReport(res.data))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load report")
      )
      .finally(() => setLoading(false));
  }, [filters]);

  const fetchRoutesAndBuses = useCallback(async () => {
    try {
      const [routesRes, busesRes] = await Promise.all([
        superAdminAPI.getAllRoutes(),
        superAdminAPI.getAllBuses(),
      ]);
      setRoutes(routesRes.data);
      setBuses(busesRes.data);
    } catch (err) {
      console.error("Failed to fetch routes and buses:", err);
    }
  }, []);

  const updateFilter = useCallback((name: keyof ReportsFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      routeId: "",
      busId: "",
    });
  }, []);

  // CSV download helper
  const downloadCSV = useCallback(<T extends Record<string, unknown>>(
    rows: T[],
    columns: string[],
    filename: string
  ) => {
    const csv = [columns.join(",")]
      .concat(
        rows.map((row) =>
          columns.map((col) => String(row[col] ?? "")).join(",")
        )
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  useEffect(() => {
    fetchRoutesAndBuses();
  }, [fetchRoutesAndBuses]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  return {
    report,
    loading,
    error,
    routes,
    buses,
    filters,
    updateFilter,
    clearFilters,
    fetchReport,
    downloadCSV,
  };
};