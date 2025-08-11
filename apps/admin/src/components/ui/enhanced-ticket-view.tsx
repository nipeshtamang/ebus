import React from "react";
import { Button } from "./button";
import {
  Printer,
  Download,
  Share2,
  QrCode,
  MapPin,
  Clock,
  Calendar,
  User,
  Phone,
  CreditCard,
} from "lucide-react";

interface TicketData {
  ticketNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  seatNumbers: string[];
  departureTime: string;
  departureDate: string;
  origin: string;
  destination: string;
  busName: string;
  totalAmount: number;
  paymentMethod: string;
  qrCodeData: string;
  bookingId: number;
  orderId: number;
  isReturn?: boolean; // Add return trip indicator
  tripType?: string; // Add trip type display
}

interface EnhancedTicketViewProps {
  ticket: TicketData;
  onClose?: () => void;
  showActions?: boolean;
}

export function EnhancedTicketView({
  ticket,
  onClose,
  showActions = true,
}: EnhancedTicketViewProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatePrintableTicket(ticket));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const htmlContent = generatePrintableTicket(ticket);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-${ticket.ticketNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Bus Ticket - ${ticket.ticketNumber}`,
          text: `Your bus ticket from ${ticket.origin} to ${ticket.destination} on ${ticket.departureDate}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      const text = `Bus Ticket #${ticket.ticketNumber}\nFrom: ${ticket.origin}\nTo: ${ticket.destination}\nDate: ${ticket.departureDate}\nTime: ${ticket.departureTime}\nPassenger: ${ticket.customerName}`;
      await navigator.clipboard.writeText(text);
      alert("Ticket details copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className={`text-white p-6 ${
          ticket.isReturn
            ? "bg-gradient-to-r from-green-600 to-teal-600"
            : "bg-gradient-to-r from-blue-600 to-purple-600"
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">🚌 Ebusewa</h1>
              <p className={ticket.isReturn ? "text-green-100" : "text-blue-100"}>
                Your Journey Partner
              </p>
              {ticket.tripType && (
                <p className={`text-sm font-medium mt-1 ${
                  ticket.isReturn ? "text-green-200" : "text-blue-200"
                }`}>
                  {ticket.tripType}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className={`text-sm ${
                ticket.isReturn ? "text-green-100" : "text-blue-100"
              }`}>
                Ticket Number
              </p>
              <p className="text-xl font-bold">{ticket.ticketNumber}</p>
              {ticket.isReturn && (
                <p className="text-sm text-green-200 mt-1">Return Journey</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Left Section - Ticket Stub */}
          <div className="w-1/3 bg-gray-50 border-r-2 border-dashed border-gray-300 p-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-800 mb-2">
                  BOARDING PASS
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">
                  {ticket.isReturn ? "Return Service" : "Express Service"}
                </div>
                {ticket.isReturn && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    Return Trip
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 uppercase">From</div>
                  <div className="font-semibold text-gray-800">
                    {ticket.origin}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">To</div>
                  <div className="font-semibold text-gray-800">
                    {ticket.destination}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Date</div>
                  <div className="font-semibold text-gray-800">
                    {ticket.departureDate}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Time</div>
                  <div className="font-semibold text-gray-800">
                    {ticket.departureTime}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 uppercase">Seat(s)</div>
                  <div className="font-semibold text-gray-800">
                    {ticket.seatNumbers.join(", ")}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-300">
                <div className="text-xs text-gray-400 text-center">
                  {ticket.ticketNumber}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Main Ticket */}
          <div className="w-2/3 p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {ticket.isReturn ? "RETURN BUS TICKET" : "BUS TICKET"}
                </h2>
                <p className="text-gray-500">
                  {ticket.isReturn
                    ? "Return journey ticket - Keep safe for boarding"
                    : "Keep this ticket safe for your journey"
                  }
                </p>
                {ticket.tripType && (
                  <p className={`text-sm font-medium mt-1 ${
                    ticket.isReturn ? "text-green-600" : "text-blue-600"
                  }`}>
                    {ticket.tripType}
                  </p>
                )}
              </div>

              {/* QR Code */}
              <div className="text-center">
                {ticket.qrCodeData ? (
                  <div className="bg-white p-3 rounded-lg border-2 border-gray-200 shadow-sm">
                    <img
                      src={`data:image/png;base64,${ticket.qrCodeData}`}
                      alt="QR Code"
                      className="w-20 h-20"
                      onError={(e) => {
                        console.error("Failed to load QR code image");
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                    <div className="flex items-center justify-center w-20 h-20 bg-gray-100 border border-gray-300 rounded text-xs text-gray-400">
                      <QrCode className="w-8 h-8" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-20 h-20 bg-gray-100 border-2 border-gray-200 rounded-lg">
                    <QrCode className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Scan to verify</p>
              </div>
            </div>

            {/* Journey Details */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Route</div>
                    <div className="font-semibold">
                      {ticket.origin} → {ticket.destination}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Travel Date</div>
                    <div className="font-semibold">{ticket.departureDate}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Departure Time</div>
                    <div className="font-semibold">{ticket.departureTime}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Passenger</div>
                    <div className="font-semibold">{ticket.customerName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Contact</div>
                    <div className="font-semibold">{ticket.customerPhone}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-gray-500">Payment</div>
                    <div className="font-semibold">{ticket.paymentMethod}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bus and Seat Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-gray-500">Bus</div>
                  <div className="font-semibold text-gray-800">
                    {ticket.busName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Seat Numbers</div>
                  <div className="font-semibold text-gray-800">
                    {ticket.seatNumbers.join(", ")}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Amount</div>
                  <div className="font-semibold text-green-600 text-lg">
                    Rs. {ticket.totalAmount}
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notice */}
            <div className={`border-l-4 p-4 mb-6 ${
              ticket.isReturn
                ? "bg-green-50 border-green-400"
                : "bg-yellow-50 border-yellow-400"
            }`}>
              <div className="flex">
                <div className="ml-3">
                  <p className={`text-sm ${
                    ticket.isReturn ? "text-green-800" : "text-yellow-800"
                  }`}>
                    <strong>Important:</strong>
                    {ticket.isReturn
                      ? " This is your return journey ticket. Please arrive at the boarding point at least 30 minutes before departure time. Present this ticket or scan the QR code for boarding verification."
                      : " Please arrive at the boarding point at least 30 minutes before departure time. Present this ticket or scan the QR code for boarding verification."
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" /> Print
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" /> Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="flex-1"
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
              </div>
            )}

            {onClose && (
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full mt-4"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function generatePrintableTicket(ticket: TicketData): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Bus Ticket - ${ticket.ticketNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Inter', sans-serif; 
            background: #f8fafc;
            padding: 20px;
            color: #1e293b;
          }
          .ticket-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            border: 1px solid #e2e8f0;
          }
          .ticket-header {
            background: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);
            color: white;
            padding: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .company-info h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 4px;
          }
          .company-info p {
            opacity: 0.9;
            font-size: 14px;
          }
          .ticket-number {
            text-align: right;
          }
          .ticket-number p:first-child {
            font-size: 12px;
            opacity: 0.8;
            margin-bottom: 4px;
          }
          .ticket-number p:last-child {
            font-size: 20px;
            font-weight: 700;
          }
          .ticket-content {
            display: flex;
          }
          .ticket-stub {
            width: 33.333%;
            background: #f8fafc;
            border-right: 2px dashed #cbd5e1;
            padding: 24px;
          }
          .stub-title {
            text-align: center;
            font-size: 16px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 8px;
          }
          .stub-subtitle {
            text-align: center;
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 20px;
          }
          .stub-info {
            space-y: 12px;
          }
          .stub-info > div {
            margin-bottom: 12px;
          }
          .stub-label {
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .stub-value {
            font-weight: 600;
            color: #1e293b;
          }
          .main-ticket {
            width: 66.667%;
            padding: 24px;
          }
          .main-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 24px;
          }
          .main-title h2 {
            font-size: 24px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 4px;
          }
          .main-title p {
            color: #64748b;
          }
          .qr-section {
            text-align: center;
          }
          .qr-container {
            background: white;
            padding: 12px;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            display: inline-block;
          }
          .qr-code {
            width: 80px;
            height: 80px;
            border-radius: 4px;
          }
          .qr-text {
            font-size: 10px;
            color: #64748b;
            margin-top: 8px;
          }
          .journey-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 24px;
          }
          .detail-item {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }
          .detail-icon {
            width: 20px;
            height: 20px;
            color: #2563eb;
          }
          .detail-content .label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 2px;
          }
          .detail-content .value {
            font-weight: 600;
            color: #1e293b;
          }
          .bus-info {
            background: #f8fafc;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 24px;
          }
          .bus-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 16px;
            text-align: center;
          }
          .bus-item .label {
            font-size: 12px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .bus-item .value {
            font-weight: 600;
            color: #1e293b;
          }
          .amount {
            color: #059669;
            font-size: 18px;
          }
          .notice {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 16px;
            border-radius: 0 8px 8px 0;
          }
          .notice p {
            font-size: 12px;
            color: #92400e;
            line-height: 1.5;
          }
          @media print {
            body { background: white; padding: 0; }
            .ticket-container { box-shadow: none; border: 2px solid #333; }
          }
        </style>
      </head>
      <body>
        <div class="ticket-container">
          <div class="ticket-header">
            <div class="company-info">
              <h1>🚌 Ebusewa</h1>
              <p>Your Journey Partner</p>
            </div>
            <div class="ticket-number">
              <p>Ticket Number</p>
              <p>${ticket.ticketNumber}</p>
            </div>
          </div>
          
          <div class="ticket-content">
            <div class="ticket-stub">
              <div class="stub-title">BOARDING PASS</div>
              <div class="stub-subtitle">Express Service</div>
              <div class="stub-info">
                <div>
                  <div class="stub-label">From</div>
                  <div class="stub-value">${ticket.origin}</div>
                </div>
                <div>
                  <div class="stub-label">To</div>
                  <div class="stub-value">${ticket.destination}</div>
                </div>
                <div>
                  <div class="stub-label">Date</div>
                  <div class="stub-value">${ticket.departureDate}</div>
                </div>
                <div>
                  <div class="stub-label">Time</div>
                  <div class="stub-value">${ticket.departureTime}</div>
                </div>
                <div>
                  <div class="stub-label">Seat(s)</div>
                  <div class="stub-value">${ticket.seatNumbers.join(", ")}</div>
                </div>
              </div>
            </div>
            
            <div class="main-ticket">
              <div class="main-header">
                <div class="main-title">
                  <h2>BUS TICKET</h2>
                  <p>Keep this ticket safe for your journey</p>
                </div>
                <div class="qr-section">
                  <div class="qr-container">
                    <img src="data:image/png;base64,${ticket.qrCodeData}" alt="QR Code" class="qr-code" onerror="this.style.display='none';">
                    <div class="qr-text">Scan to verify</div>
                  </div>
                </div>
              </div>
              
              <div class="journey-details">
                <div>
                  <div class="detail-item">
                    <div class="detail-content">
                      <div class="label">Route</div>
                      <div class="value">${ticket.origin} → ${ticket.destination}</div>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-content">
                      <div class="label">Travel Date</div>
                      <div class="value">${ticket.departureDate}</div>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-content">
                      <div class="label">Departure Time</div>
                      <div class="value">${ticket.departureTime}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div class="detail-item">
                    <div class="detail-content">
                      <div class="label">Passenger</div>
                      <div class="value">${ticket.customerName}</div>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-content">
                      <div class="label">Contact</div>
                      <div class="value">${ticket.customerPhone}</div>
                    </div>
                  </div>
                  <div class="detail-item">
                    <div class="detail-content">
                      <div class="label">Payment</div>
                      <div class="value">${ticket.paymentMethod}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="bus-info">
                <div class="bus-grid">
                  <div class="bus-item">
                    <div class="label">Bus</div>
                    <div class="value">${ticket.busName}</div>
                  </div>
                  <div class="bus-item">
                    <div class="label">Seat Numbers</div>
                    <div class="value">${ticket.seatNumbers.join(", ")}</div>
                  </div>
                  <div class="bus-item">
                    <div class="label">Total Amount</div>
                    <div class="value amount">Rs. ${ticket.totalAmount}</div>
                  </div>
                </div>
              </div>
              
              <div class="notice">
                <p><strong>Important:</strong> Please arrive at the boarding point at least 30 minutes before departure time. Present this ticket or scan the QR code for boarding verification.</p>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}
