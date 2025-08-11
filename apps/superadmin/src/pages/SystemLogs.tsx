import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Filter, Calendar, User, Activity } from "lucide-react";
import { useSystemLogs } from "@/hooks/useSystemLogs";

const SystemLogs: React.FC = () => {
  const {
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
    goToPreviousPage,
    goToNextPage,
    getPaginationInfo,
  } = useSystemLogs();

  const actions = getUniqueActions();
  const entities = getUniqueEntities();
  const users = getUniqueUsers();
  const paginationInfo = getPaginationInfo();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              System Logs
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor system activities and user actions
            </p>
          </div>
          <Button
            onClick={fetchLogs}
            variant="outline"
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters Card */}
        <Card className="shadow-sm border-gray-200 mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date From
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) =>
                    handleFilterChange("dateFrom", e.target.value)
                  }
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Date To
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Action
                </label>
                <Select
                  value={filters.action}
                  onValueChange={(value) => handleFilterChange("action", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {actions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Activity className="h-4 w-4" />
                  Entity
                </label>
                <Select
                  value={filters.entity}
                  onValueChange={(value) => handleFilterChange("entity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Entities</SelectItem>
                    {entities.map((entity) => (
                      <SelectItem key={entity} value={entity}>
                        {entity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <User className="h-4 w-4" />
                  User
                </label>
                <Select
                  value={filters.userId}
                  onValueChange={(value) => handleFilterChange("userId", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.name} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <div className="flex gap-2 w-full">
                  <Button onClick={fetchLogs} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <ErrorMessage message={error} onRetry={fetchLogs} />}

        {/* Logs Table Card */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">System Activity Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No logs found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or check back later.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-900 px-6 py-4">
                        Action
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-6 py-4">
                        Entity
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-6 py-4">
                        User
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-6 py-4">
                        Date & Time
                      </TableHead>
                      <TableHead className="font-semibold text-gray-900 px-6 py-4">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <TableCell className="px-6 py-4">
                          <Badge className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="font-medium text-gray-900 cursor-help">
                                  {log.entity}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Entity ID: {log.entityId}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          {log.user ? (
                            <div>
                              <div className="font-medium text-gray-900">
                                {log.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {log.user.email}
                              </div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {log.user.role}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">System</span>
                          )}
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">
                              {format(new Date(log.createdAt), "MMM dd, yyyy")}
                            </div>
                            <div className="text-gray-500">
                              {format(new Date(log.createdAt), "HH:mm:ss")}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {log.before && log.after ? (
                              <span className="text-blue-600">
                                Data changed
                              </span>
                            ) : log.after ? (
                              <span className="text-green-600">Created</span>
                            ) : log.before ? (
                              <span className="text-red-600">Deleted</span>
                            ) : (
                              <span className="text-gray-500">No details</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {paginationInfo.start} to {paginationInfo.end} of {paginationInfo.total} logs
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={goToPreviousPage}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm font-medium text-gray-700">
                Page {page} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPages}
                onClick={goToNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemLogs;
