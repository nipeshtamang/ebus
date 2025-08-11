import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { useSystemHealth } from "@/hooks/useSystemHealth";

const SystemHealth: React.FC = () => {
  const {
    health,
    loading,
    error,
    fetchHealth,
    getStatusColor,
    formatUptime,
    formatErrorRate,
    getOverallStatus,
    getOverallStatusText,
  } = useSystemHealth();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            System Health
          </h1>
          <Button
            onClick={fetchHealth}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        {error && <ErrorMessage message={error} onRetry={fetchHealth} />}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Database Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <Badge
                  className={getStatusColor(
                    health?.databaseStatus || "unknown"
                  )}
                >
                  {health?.databaseStatus || "Unknown"}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <Badge
                  className={getStatusColor(health?.apiStatus || "unknown")}
                >
                  {health?.apiStatus || "Unknown"}
                </Badge>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Last Backup</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <span className="text-sm">
                  {health?.lastBackup
                    ? new Date(health.lastBackup).toLocaleString()
                    : "No backup found"}
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <span className="text-sm font-mono">
                  {health?.systemUptime
                    ? formatUptime(health.systemUptime)
                    : "Unknown"}
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Error Rate (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <span
                  className={`text-sm font-semibold ${
                    (health?.errorRate || 0) > 10
                      ? "text-red-600"
                      : (health?.errorRate || 0) > 5
                        ? "text-yellow-600"
                        : "text-green-600"
                  }`}
                >
                  {health?.errorRate !== undefined
                    ? formatErrorRate(health.errorRate)
                    : "Unknown"}
                </span>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall Status</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <Badge className={getStatusColor(getOverallStatus())}>
                  {getOverallStatusText()}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
