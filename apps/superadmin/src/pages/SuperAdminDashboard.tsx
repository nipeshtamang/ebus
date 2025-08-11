import React from "react";
import {
  Users,
  Calendar,
  DollarSign,
  Activity,
  Shield,
  Database,
  Clock,
  UserCheck,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { useSuperAdminDashboard } from "@/hooks/useSuperAdminDashboard";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendValue?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  className = "",
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "healthy":
        return "text-green-600";
      case "warning":
        return "text-yellow-600";
      case "degraded":
        return "text-orange-600";
      case "error":
      case "slow":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const isSystemHealth = title === "System Health" || title === "API Status";
  const statusColor = isSystemHealth ? getStatusColor(value as string) : "";

  return (
    <Card className={`p-6 shadow-md rounded-2xl bg-white/90 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold text-gray-800">
          {title}
        </CardTitle>
        <div className="h-5 w-5 text-teal-600 bg-teal-50 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`text-3xl font-extrabold mb-1 ${statusColor || "text-teal-800"}`}
        >
          {value}
        </div>
        {trend && (
          <p className="text-xs text-teal-500 font-medium">
            {trend} {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const SuperAdminDashboard: React.FC = () => {
  const {
    stats,
    recentActivity,
    loading: statsLoading,
    error: statsError,
    refreshDashboard,
  } = useSuperAdminDashboard();

  if (statsLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-teal-800 mb-1 drop-shadow-sm">
              SuperAdmin Dashboard
            </h1>
            <p className="text-base sm:text-lg text-teal-600 font-medium">
              Manage users, monitor system health, and oversee operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={refreshDashboard}
              variant="outline"
              size="sm"
              className="border-teal-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {statsError && (
          <ErrorMessage message={statsError} onRetry={refreshDashboard} />
        )}

        {/* Stats Grid 1 */}
        <div className="rounded-2xl bg-white/80 shadow-lg p-4 sm:p-6 mb-6">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={<Users className="h-5 w-5" />}
              trend="+12%"
              trendValue="from last month"
            />
            <StatCard
              title="Total Admins"
              value={stats?.totalAdmins || 0}
              icon={<Shield className="h-5 w-5" />}
              trend="+5%"
              trendValue="from last month"
            />
            <StatCard
              title="Total Clients"
              value={stats?.totalClients || 0}
              icon={<UserCheck className="h-5 w-5" />}
              trend="+18%"
              trendValue="from last month"
            />
            <StatCard
              title="Total Bookings"
              value={stats?.totalBookings || 0}
              icon={<Calendar className="h-5 w-5" />}
              trend="+25%"
              trendValue="from last month"
            />
          </div>
        </div>

        {/* Stats Grid 2 */}
        <div className="rounded-2xl bg-white/80 shadow-lg p-4 sm:p-6 mb-8">
          <div className="grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
              icon={<DollarSign className="h-5 w-5" />}
              trend="+15%"
              trendValue="from last month"
            />
            <StatCard
              title="System Health"
              value={stats?.systemHealth?.databaseStatus || "Unknown"}
              icon={<CheckCircle className="h-5 w-5 text-green-500" />}
            />
            <StatCard
              title="API Status"
              value={stats?.systemHealth?.apiStatus || "Unknown"}
              icon={<Database className="h-5 w-5" />}
            />
            <StatCard
              title="Last Backup"
              value={
                stats?.systemHealth?.lastBackup
                  ? new Date(stats.systemHealth.lastBackup).toLocaleDateString()
                  : "No backup"
              }
              icon={<Clock className="h-5 w-5" />}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="rounded-2xl shadow-lg bg-white/90 p-6">
          <CardHeader className="mb-2">
            <CardTitle className="flex items-center gap-3 text-xl text-teal-800 font-bold">
              <Activity className="h-6 w-6" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {recentActivity?.slice(0, 5).map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 border border-teal-100 rounded-xl bg-teal-50/40 shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Activity className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {activity.action} {activity.entity}
                      </p>
                      <p className="text-sm text-teal-600">
                        by {activity.user?.name || "System"} •{" "}
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-xs px-3 py-1 rounded-full"
                  >
                    {activity.user?.role || "System"}
                  </Badge>
                </div>
              ))}
              {(!recentActivity || recentActivity.length === 0) && (
                <div className="text-center text-teal-400 py-8 text-lg font-medium">
                  No recent activity found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
