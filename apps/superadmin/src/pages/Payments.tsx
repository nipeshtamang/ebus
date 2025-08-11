// import React, { useEffect, useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Table } from "@/components/ui/table";
// import { Skeleton } from "@/components/ui/skeleton";
// import { ErrorMessage } from "@/components/ui/error-message";
// import { usePayments } from "@/hooks/usePayments";
// import { Badge } from "@/components/ui/badge";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Search, Filter } from "lucide-react";

// const Payments: React.FC = () => {
//   const {
//     payments,
//     totalPages,
//     currentPage,
//     loading,
//     error,
//     fetchPayments,
//     setCurrentPage,
//   } = usePayments();

//   // Filter states
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [methodFilter, setMethodFilter] = useState("all");
//   const [filteredPayments, setFilteredPayments] = useState(payments);

//   useEffect(() => {
//     fetchPayments({ page: currentPage });
//   }, [fetchPayments, currentPage]);

//   // Filter payments based on search term, status, and method
//   useEffect(() => {
//     let filtered = payments;

//     // Filter by search term (user name, booking ID, or payment ID)
//     if (searchTerm) {
//       filtered = filtered.filter(
//         (payment) =>
//           payment.id.toString().includes(searchTerm.toLowerCase()) ||
//           payment.bookingId?.toString().includes(searchTerm.toLowerCase()) ||
//           payment.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Filter by status
//     if (statusFilter !== "all") {
//       filtered = filtered.filter((payment) => payment.status === statusFilter);
//     }

//     // Filter by method
//     if (methodFilter !== "all") {
//       filtered = filtered.filter((payment) => payment.method === methodFilter);
//     }

//     setFilteredPayments(filtered);
//   }, [payments, searchTerm, statusFilter, methodFilter]);

//   // Function to get status badge color
//   const getStatusBadgeVariant = (status: string) => {
//     switch (status) {
//       case "COMPLETED":
//       case "SUCCESS":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "FAILED":
//       case "CANCELLED":
//         return "bg-red-100 text-red-800 border-red-200";
//       case "PENDING":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   // Function to get method badge color
//   const getMethodBadgeVariant = (method: string) => {
//     switch (method) {
//       case "CASH":
//         return "bg-green-100 text-green-800 border-green-200";
//       case "ESEWA":
//         return "bg-blue-100 text-blue-800 border-blue-200";
//       case "KHALTI":
//         return "bg-purple-100 text-purple-800 border-purple-200";
//       case "IPS_CONNECT":
//         return "bg-pink-100 text-pink-800 border-pink-200";
//       case "BANK":
//         return "bg-yellow-100 text-yellow-800 border-yellow-200";
//       default:
//         return "bg-gray-100 text-gray-800 border-gray-200";
//     }
//   };

//   return (
//     <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
//           Payments
//         </h1>
//         {error && (
//           <ErrorMessage
//             message={error}
//             onRetry={() => fetchPayments({ page: currentPage })}
//           />
//         )}

//         {/* Filters */}
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle className="flex items-center gap-2">
//               <Filter className="h-5 w-5" />
//               Filters
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1">
//                 <div className="relative">
//                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                   <Input
//                     placeholder="Search by payment ID, booking ID, or user name..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="pl-10"
//                   />
//                 </div>
//               </div>
//               <div className="w-full sm:w-48">
//                 <Select value={statusFilter} onValueChange={setStatusFilter}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Filter by status" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Statuses</SelectItem>
//                     <SelectItem value="PENDING">Pending</SelectItem>
//                     <SelectItem value="COMPLETED">Completed</SelectItem>
//                     <SelectItem value="SUCCESS">Success</SelectItem>
//                     <SelectItem value="FAILED">Failed</SelectItem>
//                     <SelectItem value="CANCELLED">Cancelled</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="w-full sm:w-48">
//                 <Select value={methodFilter} onValueChange={setMethodFilter}>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Filter by method" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="all">All Methods</SelectItem>
//                     <SelectItem value="CASH">Cash</SelectItem>
//                     <SelectItem value="ESEWA">eSewa</SelectItem>
//                     <SelectItem value="KHALTI">Khalti</SelectItem>
//                     <SelectItem value="IPS_CONNECT">IPS Connect</SelectItem>
//                     <SelectItem value="BANK">Bank Transfer</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>All Payments ({filteredPayments.length})</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {loading ? (
//               <Skeleton className="h-8 w-full" />
//             ) : filteredPayments.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 {searchTerm || statusFilter !== "all" || methodFilter !== "all"
//                   ? "No payments match your filters"
//                   : "No payments found"}
//               </div>
//             ) : (
//               <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
//                 <thead>
//                   <tr>
//                     <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       ID
//                     </th>
//                     <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       User
//                     </th>
//                     <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       Booking
//                     </th>
//                     <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       Amount
//                     </th>
//                     <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       Method
//                     </th>
//                     <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       Status
//                     </th>
//                     <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
//                       Created At
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredPayments.map((payment) => (
//                     <tr
//                       key={payment.id}
//                       className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
//                     >
//                       <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
//                         {payment.id}
//                       </td>
//                       <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <span>{payment.user?.name || "-"}</span>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                               {payment.user?.name || "No user info"}
//                             </TooltipContent>
//                           </Tooltip>
//                         </TooltipProvider>
//                       </td>
//                       <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
//                         <TooltipProvider>
//                           <Tooltip>
//                             <TooltipTrigger asChild>
//                               <span>{payment.bookingId || "-"}</span>
//                             </TooltipTrigger>
//                             <TooltipContent>
//                               {payment.bookingId
//                                 ? `Booking ID: ${payment.bookingId}`
//                                 : "No booking info"}
//                             </TooltipContent>
//                           </Tooltip>
//                         </TooltipProvider>
//                       </td>
//                       <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
//                         <span className="font-semibold text-green-600">
//                           Rs. {payment.amount}
//                         </span>
//                       </td>
//                       <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
//                         <Badge
//                           className={`${getMethodBadgeVariant(payment.method)} border`}
//                         >
//                           {payment.method}
//                         </Badge>
//                       </td>
//                       <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
//                         <Badge
//                           className={`${getStatusBadgeVariant(payment.status)} border`}
//                         >
//                           {payment.status}
//                         </Badge>
//                       </td>
//                       <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
//                         {new Date(payment.createdAt).toLocaleString()}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             )}
//           </CardContent>
//         </Card>
//         {/* Pagination Controls */}
//         <div className="flex justify-end gap-2 mt-4">
//           <Button
//             size="sm"
//             variant="outline"
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage(currentPage - 1)}
//           >
//             Previous
//           </Button>
//           <span className="px-2 py-1">
//             Page {currentPage} of {totalPages}
//           </span>
//           <Button
//             size="sm"
//             variant="outline"
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage(currentPage + 1)}
//           >
//             Next
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Payments;

import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import { usePayments } from "@/hooks/usePayments";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Filter } from "lucide-react";

const Payments: React.FC = () => {
  const {
    payments,
    totalPages,
    currentPage,
    loading,
    error,
    fetchPayments,
    setCurrentPage,
  } = usePayments();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  // Filter payments as before
  const filteredPayments = useMemo(() => {
    let filtered = payments;
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.id.toString().includes(searchTerm.toLowerCase()) ||
          payment.bookingId?.toString().includes(searchTerm.toLowerCase()) ||
          payment.user?.name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          (payment.booking as any)?.order?.id
            ?.toString()
            .includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }
    if (methodFilter !== "all") {
      filtered = filtered.filter((payment) => payment.method === methodFilter);
    }
    return filtered;
  }, [payments, searchTerm, statusFilter, methodFilter]);

  // Group by order.id (acts as ticket number)
  const groupedPayments = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredPayments.forEach((payment) => {
      const orderId = (payment.booking as any)?.order?.id || "NO_ORDER";
      if (!map[orderId]) map[orderId] = [];
      map[orderId].push(payment);
    });
    return Object.entries(map); // [ [orderId, [payments...]], ... ]
  }, [filteredPayments]);

  useEffect(() => {
    fetchPayments({ page: currentPage });
  }, [fetchPayments, currentPage]);

  // Function to get status badge color
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "COMPLETED":
      case "SUCCESS":
        return "bg-green-100 text-green-800 border-green-200";
      case "FAILED":
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Function to get method badge color
  const getMethodBadgeVariant = (method: string) => {
    switch (method) {
      case "CASH":
        return "bg-green-100 text-green-800 border-green-200";
      case "ESEWA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "KHALTI":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "IPS_CONNECT":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "BANK":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Optional: State for viewing details
  const [viewOrder, setViewOrder] = useState<null | {
    orderId: string;
    payments: any[];
  }>(null);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white to-teal-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
          Payments
        </h1>
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => fetchPayments({ page: currentPage })}
          />
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by payment ID, booking ID, user name, or order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="w-full sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="SUCCESS">Success</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full sm:w-48">
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ESEWA">eSewa</SelectItem>
                    <SelectItem value="KHALTI">Khalti</SelectItem>
                    <SelectItem value="IPS_CONNECT">IPS Connect</SelectItem>
                    <SelectItem value="BANK">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Payments ({groupedPayments.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-full" />
            ) : groupedPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || statusFilter !== "all" || methodFilter !== "all"
                  ? "No payments match your filters"
                  : "No payments found"}
              </div>
            ) : (
              <Table className="min-w-[900px] border-separate border-spacing-y-2 border-spacing-x-4 rounded-xl bg-white shadow-md">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      User
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Seats
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Total Amount
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupedPayments.map(([orderId, group]) => {
                    const first = group[0];
                    const totalAmount = group.reduce(
                      (sum, p) => sum + (p.amount || 0),
                      0
                    );
                    return (
                      <tr
                        key={orderId}
                        className="even:bg-gray-50 hover:bg-teal-50 transition-colors rounded-xl"
                      >
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          {orderId}
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          {first.user?.name || "-"}
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          {[
                            ...new Set(
                              group.map((p) => p.booking?.seat?.seatNumber)
                            ),
                          ].join(", ") || "-"}
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          <span className="font-semibold text-green-600">
                            Rs. {totalAmount}
                          </span>
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          <Badge
                            className={`${getMethodBadgeVariant(first.method)} border`}
                          >
                            {first.method}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          <Badge
                            className={`${getStatusBadgeVariant(first.status)} border`}
                          >
                            {first.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 bg-white rounded-lg shadow-sm whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              setViewOrder({ orderId, payments: group })
                            }
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </CardContent>
        </Card>
        {/* Pagination Controls */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="px-2 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
        {/* Simple Modal for View (optional, basic example) */}
        {viewOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
              <h2 className="text-lg font-bold mb-4">
                Order #{viewOrder.orderId} Payments
              </h2>
              <ul className="mb-4">
                {viewOrder.payments.map((p) => (
                  <li key={p.id} className="mb-2 border-b pb-2">
                    <div>
                      <span className="font-semibold">Payment ID:</span> {p.id}
                    </div>
                    <div>
                      <span className="font-semibold">Amount:</span> Rs.{" "}
                      {p.amount}
                    </div>
                    <div>
                      <span className="font-semibold">Method:</span> {p.method}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span> {p.status}
                    </div>
                    <div>
                      <span className="font-semibold">Booking ID:</span>{" "}
                      {p.bookingId}
                    </div>
                  </li>
                ))}
              </ul>
              <Button onClick={() => setViewOrder(null)}>Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
