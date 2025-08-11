import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { useReports } from "@/hooks/useReports";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Reports: React.FC = () => {
  const {
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
  } = useReports();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Reports
            </h1>
            <div className="flex flex-col sm:flex-row gap-2 mt-2 flex-wrap">
              <div>
                <label className="block text-xs mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter("dateFrom", e.target.value)}
                  className="border rounded px-2 py-1 w-full sm:w-auto"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter("dateTo", e.target.value)}
                  className="border rounded px-2 py-1 w-full sm:w-auto"
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Route</label>
                <select
                  value={filters.routeId}
                  onChange={(e) => updateFilter("routeId", e.target.value)}
                  className="border rounded px-2 py-1 w-full sm:w-auto"
                >
                  <option value="">All</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name || `${r.origin} - ${r.destination}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1">Bus</label>
                <select
                  value={filters.busId}
                  onChange={(e) => updateFilter("busId", e.target.value)}
                  className="border rounded px-2 py-1 w-full sm:w-auto"
                >
                  <option value="">All</option>
                  {buses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                onClick={fetchReport}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Apply
              </Button>
            </div>
          </div>
          <Button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            Refresh
          </Button>
        </div>
        {error && <ErrorMessage message={error} onRetry={fetchReport} />}
        {loading ? (
          <Skeleton className="h-32 w-full" />
        ) : !report ? (
          <div className="text-center py-8 text-muted-foreground">
            No report data found
          </div>
        ) : (
          <>
            {/* Revenue Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadCSV(
                      report.revenue.byMonth,
                      ["month", "revenue"],
                      "revenue_by_month.csv"
                    )
                  }
                >
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4" style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={report.revenue.byMonth}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-green-50 rounded">
                    <div className="text-xs text-muted-foreground">
                      Total Revenue
                    </div>
                    <div className="text-xl font-bold">
                      NPR {report.revenue.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded">
                    <div className="text-xs text-muted-foreground">
                      Top Route
                    </div>
                    <div className="text-lg font-semibold">
                      {report.revenue.byRoute[0]?.routeName || "-"}
                    </div>
                    <div className="text-xs">
                      NPR{" "}
                      {report.revenue.byRoute[0]?.revenue?.toLocaleString() ||
                        0}
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded">
                    <div className="text-xs text-muted-foreground">
                      Top Payment Method
                    </div>
                    <div className="text-lg font-semibold">
                      {report.revenue.byPaymentMethod[0]?.method || "-"}
                    </div>
                    <div className="text-xs">
                      NPR{" "}
                      {report.revenue.byPaymentMethod[0]?._sum.amount?.toLocaleString() ||
                        0}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded">
                    <div className="text-xs text-muted-foreground">
                      Revenue This Month
                    </div>
                    <div className="text-lg font-semibold">
                      NPR{" "}
                      {report.revenue.byMonth
                        .slice(-1)[0]
                        ?.revenue?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto mt-4">
                  <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          Revenue (NPR)
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.revenue.byMonth.map((row) => (
                        <tr
                          key={row.month}
                          className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                        >
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {row.month}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {Number(row.revenue).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* User Growth Section */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Growth</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadCSV(
                      report.users.newByMonth,
                      ["month", "count"],
                      "user_growth_by_month.csv"
                    )
                  }
                >
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4" style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={report.users.newByMonth}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#6366f1" name="New Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Booking Trends Section */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Booking Trends</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadCSV(
                      report.bookings.byMonth,
                      ["month", "count"],
                      "bookings_by_month.csv"
                    )
                  }
                >
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4" style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={report.bookings.byMonth}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={false}
                        name="Bookings"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Revenue by Route Section */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue by Route</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadCSV(
                      report.revenue.byRoute,
                      ["routeName", "revenue"],
                      "revenue_by_route.csv"
                    )
                  }
                >
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4" style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={report.revenue.byRoute}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="routeName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="revenue" fill="#f59e42" name="Revenue" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Revenue by Bus Section */}
            <Card className="mt-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue by Bus</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadCSV(
                      report.fleet.busUsage.map((b) => ({
                        busName: b.busName,
                        trips: b.trips,
                      })),
                      ["busName", "trips"],
                      "bus_usage.csv"
                    )
                  }
                >
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4" style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={report.fleet.busUsage}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="busName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="trips" fill="#3b82f6" name="Trips" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            {/* Bookings Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Bookings</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadCSV(
                      report.bookings.byMonth,
                      ["month", "count"],
                      "bookings_by_month.csv"
                    )
                  }
                >
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4" style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={report.bookings.byMonth}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#16a34a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <div className="text-xs text-muted-foreground">
                      Total Bookings
                    </div>
                    <div className="text-xl font-bold">
                      {report.bookings.total.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <div className="text-xs text-muted-foreground">
                      Top Route
                    </div>
                    <div className="text-lg font-semibold">
                      {report.bookings.byRoute[0]?.routeName || "-"}
                    </div>
                    <div className="text-xs">
                      {report.bookings.byRoute[0]?.count?.toLocaleString() || 0}{" "}
                      bookings
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded">
                    <div className="text-xs text-muted-foreground">
                      Most Common Status
                    </div>
                    <div className="text-lg font-semibold">
                      {report.bookings.byStatus[0]?.status || "-"}
                    </div>
                    <div className="text-xs">
                      {report.bookings.byStatus[0]?._count.status?.toLocaleString() ||
                        0}{" "}
                      bookings
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto mt-4">
                  <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          Bookings
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.bookings.byMonth.map((row) => (
                        <tr
                          key={row.month}
                          className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                        >
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {row.month}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {Number(row.count).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* Users Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Users</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadCSV(
                      report.users.newByMonth,
                      ["month", "count"],
                      "new_users_by_month.csv"
                    )
                  }
                >
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4" style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={report.users.newByMonth}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#f59e42"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 bg-blue-50 rounded">
                    <div className="text-xs text-muted-foreground">
                      New Users This Month
                    </div>
                    <div className="text-xl font-bold">
                      {report.users.newByMonth
                        .slice(-1)[0]
                        ?.count?.toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded">
                    <div className="text-xs text-muted-foreground">
                      Active Users This Month
                    </div>
                    <div className="text-xl font-bold">
                      {report.users.activeByMonth
                        .slice(-1)[0]
                        ?.count?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>
                <div className="overflow-x-auto mt-4">
                  <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          Month
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          New Users
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          Active Users
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.users.newByMonth.map((row, idx) => (
                        <tr
                          key={row.month}
                          className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                        >
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {row.month}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {Number(row.count).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {Number(
                              report.users.activeByMonth[idx]?.count || 0
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardContent>
            </Card>
            {/* Fleet Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Fleet Utilization</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    downloadCSV(
                      report.fleet.busUsage,
                      ["busName", "trips"],
                      "bus_usage.csv"
                    )
                  }
                >
                  Download CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4" style={{ width: "100%", height: 250 }}>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart
                      data={report.fleet.busUsage}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="busName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="trips" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="overflow-x-auto">
                  <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          Bus
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          Trips
                        </th>
                        <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                          Occupancy Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.fleet.busUsage.map((bus, idx) => (
                        <tr
                          key={bus.busId}
                          className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                        >
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {bus.busName}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {bus.trips}
                          </td>
                          <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                            {report.fleet.occupancyRate[idx]?.occupancy !==
                            undefined
                              ? `${(Number(report.fleet.occupancyRate[idx].occupancy) * 100).toFixed(1)}%`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
