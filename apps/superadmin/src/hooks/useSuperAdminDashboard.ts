import { useState, useEffect, useCallback } from "react";
import {
  superAdminAPI,
  DashboardStats,
  SystemLog,
} from "../services/superadminApi";

interface UseSuperAdminDashboardReturn {
  stats: DashboardStats | null;
  recentActivity: SystemLog[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refreshDashboard: () => Promise<void>;
  setRefreshing: (refreshing: boolean) => void;
}

export function useSuperAdminDashboard(): UseSuperAdminDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setError(null);
      const [statsResponse, activityResponse] = await Promise.all([
        superAdminAPI.getDashboardStats(),
        superAdminAPI.getRecentActivity(20),
      ]);

      setStats(statsResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (err: unknown) {
      console.error("Error fetching dashboard data:", err);
      let message = "Failed to load dashboard data";
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchDashboardData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData().finally(() => {
      setLoading(false);
    });
  }, [fetchDashboardData]);

  return {
    stats,
    recentActivity,
    loading,
    error,
    refreshing,
    refreshDashboard,
    setRefreshing,
  };
}
