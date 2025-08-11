import { useState, useEffect, useCallback } from "react";
import { superAdminAPI } from "@/services/superadminApi";

interface SystemHealthData {
  databaseStatus: string;
  apiStatus: string;
  lastBackup: string | null;
  systemUptime: number;
  errorRate: number;
}

export const useSystemHealth = () => {
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await superAdminAPI.getSystemHealth();
      setHealth(res.data);
    } catch (err) {
      setError("Failed to fetch system health");
    } finally {
      setLoading(false);
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "degraded":
        return "bg-orange-100 text-orange-800";
      case "error":
      case "slow":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  }, []);

  const formatUptime = useCallback((seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }, []);

  const formatErrorRate = useCallback((rate: number) => {
    return `${rate.toFixed(2)}%`;
  }, []);

  const getOverallStatus = useCallback(() => {
    if (!health) return "unknown";
    
    return health.databaseStatus === "healthy" &&
           health.apiStatus === "healthy" &&
           (health.errorRate || 0) < 5
      ? "healthy"
      : "degraded";
  }, [health]);

  const getOverallStatusText = useCallback(() => {
    const status = getOverallStatus();
    return status === "healthy"
      ? "All Systems Operational"
      : "System Issues Detected";
  }, [getOverallStatus]);

  useEffect(() => {
    fetchHealth();
    // Refresh every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  return {
    health,
    loading,
    error,
    fetchHealth,
    getStatusColor,
    formatUptime,
    formatErrorRate,
    getOverallStatus,
    getOverallStatusText,
  };
};