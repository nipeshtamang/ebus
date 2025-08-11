import { useState } from "react";
import {
  Search,
  Filter,
  DollarSign,
  Calendar,
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Receipt,
  Loader2,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "../../layouts/AdminLayout";
import { usePayments, Payment } from "../../hooks/usePayments";
import { ErrorMessage } from "../../components/ui/error-message";
import { SuccessMessage } from "../../components/ui/success-message";
import { paymentAPI } from "../../services/api";

export function PaymentHistory() {
  const {
    payments,
    loading,
    error,
    refreshPayments,
    totalAmount,
    completedAmount,
    pendingAmount,
  } = usePayments();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Refund modal state
  const [showRefundDialog, setShowRefundDialog] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshPayments();
    setRefreshing(false);
  };

  const handleRefund = async () => {
    if (!selectedPayment || !refundReason.trim()) {
      setErrorMessage("Please provide a refund reason");
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage(null);

      await paymentAPI.refundPayment(selectedPayment.id, {
        reason: refundReason,
      });

      setSuccessMessage("Refund processed successfully!");
      setShowRefundDialog(false);
      setSelectedPayment(null);
      setRefundReason("");

      // Refresh the list after refund
      await refreshPayments();

      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: unknown) {
      console.error("Error processing refund:", err);
      setErrorMessage(
        "Failed to process refund: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const closeRefundDialog = () => {
    setShowRefundDialog(false);
    setSelectedPayment(null);
    setRefundReason("");
    setErrorMessage(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4" />;
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "FAILED":
        return <XCircle className="h-4 w-4" />;
      case "REFUNDED":
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case "CASH":
        return "bg-green-100 text-green-800";
      case "ESEWA":
        return "bg-purple-100 text-purple-800";
      case "KHALTI":
        return "bg-blue-100 text-blue-800";
      case "IPS_CONNECT":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
          <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex items-center justify-center min-h-[60vh]">
              <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30 flex items-center justify-center p-4">
          <ErrorMessage message={error} onRetry={handleRefresh} />
        </div>
      </AdminLayout>
    );
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.user?.phoneNumber.includes(searchTerm) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.booking?.schedule.route.origin
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.booking?.schedule.route.destination
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || payment.status.toUpperCase() === statusFilter;

    const matchesMethod =
      methodFilter === "all" || payment.method.toUpperCase() === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-teal-50/30 to-cyan-50/30">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-gradient-to-r from-white via-teal-50/50 to-cyan-50/50 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-teal-100 shadow-sm px-4 py-4 md:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 text-white shadow-lg">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                    Payment History
                  </h1>
                  <p className="text-xs md:text-sm text-gray-600">
                    Track all payment transactions and refunds
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="border-teal-200 hover:bg-teal-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
          {successMessage && (
            <SuccessMessage
              message={successMessage}
              onDismiss={() => setSuccessMessage(null)}
              className="mb-6"
            />
          )}

          {errorMessage && (
            <ErrorMessage message={errorMessage} className="mb-6" />
          )}

          {/* Stats Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Revenue
                </CardTitle>
                <DollarSign className="h-4 w-4 text-teal-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {formatPrice(totalAmount)}
                </div>
                <p className="text-xs text-gray-500">All payments</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-green-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completed
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatPrice(completedAmount)}
                </div>
                <p className="text-xs text-gray-500">Successful payments</p>
              </CardContent>
            </Card>

            <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-yellow-50/30 hover:shadow-2xl transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {formatPrice(pendingAmount)}
                </div>
                <p className="text-xs text-gray-500">Awaiting completion</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30 mb-6 md:mb-8">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-teal-600" />
                Search & Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="search">Search Payments</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Search by name, phone, transaction ID..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSearchTerm(e.target.value)
                      }
                      className="pl-10 border-teal-200 focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="FAILED">Failed</SelectItem>
                      <SelectItem value="REFUNDED">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method-filter">Payment Method</Label>
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger className="border-teal-200 focus:border-teal-500">
                      <SelectValue placeholder="All methods" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Methods</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="ESEWA">eSewa</SelectItem>
                      <SelectItem value="KHALTI">Khalti</SelectItem>
                      <SelectItem value="IPS_CONNECT">IPS Connect</SelectItem>
                      <SelectItem value="BANK">Bank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clear-filters">Actions</Label>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setMethodFilter("all");
                    }}
                    className="w-full border-teal-200 hover:bg-teal-50"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payments List */}
          <Card className="shadow-xl border-0 bg-gradient-to-br from-white to-teal-50/30">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-teal-600" />
                Payment Transactions ({filteredPayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6">
              {filteredPayments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">
                    No payments found
                  </h3>
                  <p className="text-sm">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    methodFilter !== "all"
                      ? "Try adjusting your search criteria."
                      : "No payment transactions have been recorded yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-teal-100 rounded-lg hover:bg-teal-50/50 transition-all duration-200 gap-4"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <span className="font-medium truncate">
                              {payment.user?.name || "N/A"}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({payment.user?.phoneNumber || "N/A"})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 truncate">
                              {payment.booking?.schedule.route.origin} →{" "}
                              {payment.booking?.schedule.route.destination}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-500">
                              {formatDate(payment.createdAt)}
                            </span>
                            {payment.transactionId && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-xs text-gray-400">
                                  ID: {payment.transactionId}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium text-teal-600">
                            {formatPrice(payment.amount)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.seatNumbers &&
                            payment.seatNumbers.length > 0
                              ? payment.seatNumbers.join(", ")
                              : payment.booking?.seat?.seatNumber || "N/A"}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getMethodColor(payment.method)}>
                            {payment.method}
                          </Badge>
                          <Badge className={getStatusColor(payment.status)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(payment.status)}
                              {payment.status}
                            </div>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Refund Dialog */}
      <Dialog open={showRefundDialog} onOpenChange={closeRefundDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Refund Payment</DialogTitle>
            <DialogDescription>
              Process a refund for this payment. Please provide a reason for the
              refund.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedPayment && (
              <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Payment ID:</span>
                  <span className="text-sm">#{selectedPayment.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Amount:</span>
                  <span className="text-sm font-semibold">
                    {formatPrice(selectedPayment.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Method:</span>
                  <Badge variant="outline" className="text-xs">
                    {selectedPayment.method}
                  </Badge>
                </div>
                {selectedPayment.user && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Customer:</span>
                    <span className="text-sm">{selectedPayment.user.name}</span>
                  </div>
                )}
                {selectedPayment.booking?.schedule?.route && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Route:</span>
                    <span className="text-sm">
                      {selectedPayment.booking.schedule.route.origin} →{" "}
                      {selectedPayment.booking.schedule.route.destination}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason *
              </Label>
              <Textarea
                id="reason"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="col-span-3"
                placeholder="Enter the reason for this refund..."
                rows={3}
              />
            </div>
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700 text-sm">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errorMessage}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeRefundDialog}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefund}
              disabled={actionLoading || !refundReason.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Process Refund
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {errorMessage && (
        <ErrorMessage message={errorMessage} onRetry={handleRefresh} />
      )}
    </AdminLayout>
  );
}
