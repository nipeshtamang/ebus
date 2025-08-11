import React from "react";
import { Button } from "./button";
import { Printer, Download, Share2 } from "lucide-react";

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
}

interface TicketViewProps {
  ticket: TicketData;
  onClose?: () => void;
  showActions?: boolean;
}

export function TicketView({
  ticket,
  onClose,
  showActions = true,
}: TicketViewProps) {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bus Ticket - ${ticket.ticketNumber}</title>
            <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Inter', sans-serif; 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
              }
              .ticket-container {
                max-width: 400px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                position: relative;
              }
              .ticket-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px 20px;
                text-align: center;
                position: relative;
                overflow: hidden;
              }
              .ticket-header::before {
                content: '';
                position: absolute;
                top: -50%;
                left: -50%;
                width: 200%;
                height: 200%;
                background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
                animation: float 20s infinite linear;
              }
              @keyframes float {
                0% { transform: translate(0, 0) rotate(0deg); }
                100% { transform: translate(100px, 100px) rotate(360deg); }
              }
              .company-logo {
                font-size: 28px;
                font-weight: 700;
                margin-bottom: 10px;
                position: relative;
                z-index: 1;
              }
              .ticket-number {
                font-size: 16px;
                opacity: 0.9;
                position: relative;
                z-index: 1;
              }
              .route-section {
                background: #f8fafc;
                padding: 25px 20px;
                text-align: center;
                border-bottom: 2px dashed #e2e8f0;
              }
              .route-arrow {
                font-size: 24px;
                color: #667eea;
                margin: 10px 0;
              }
              .origin, .destination {
                font-size: 18px;
                font-weight: 600;
                color: #1e293b;
              }
              .travel-info {
                padding: 25px 20px;
                background: white;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 20px;
              }
              .info-item {
                background: #f8fafc;
                padding: 15px;
                border-radius: 12px;
                border-left: 4px solid #667eea;
              }
              .info-label {
                font-size: 11px;
                font-weight: 600;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .info-value {
                font-size: 14px;
                font-weight: 600;
                color: #1e293b;
              }
              .qr-section {
                background: #f8fafc;
                padding: 25px 20px;
                text-align: center;
                border-top: 2px dashed #e2e8f0;
              }
              .qr-container {
                background: white;
                padding: 20px;
                border-radius: 15px;
                display: inline-block;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
              }
              .qr-code {
                width: 120px;
                height: 120px;
                border-radius: 8px;
              }
              .qr-text {
                font-size: 12px;
                color: #64748b;
                margin-top: 10px;
                font-weight: 500;
              }
              .footer {
                background: #1e293b;
                color: white;
                padding: 20px;
                text-align: center;
                font-size: 12px;
              }
              .footer-title {
                font-weight: 600;
                margin-bottom: 5px;
              }
              .footer-subtitle {
                opacity: 0.8;
                font-size: 11px;
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
                <div className="company-logo">🚌 Ebusewa</div>
                <div className="ticket-number">Ticket #${ticket.ticketNumber}</div>
              </div>
              
              <div className="route-section">
                <div className="origin">${ticket.origin}</div>
                <div className="route-arrow">→</div>
                <div className="destination">${ticket.destination}</div>
                <div style="margin-top: 10px; font-size: 14px; color: #64748b;">
                  ${ticket.departureDate} at ${ticket.departureTime}
                </div>
              </div>
              
              <div className="travel-info">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Passenger</div>
                    <div className="info-value">${ticket.customerName}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Phone</div>
                    <div className="info-value">${ticket.customerPhone}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Bus</div>
                    <div className="info-value">${ticket.busName}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Seats</div>
                    <div className="info-value">${ticket.seatNumbers.join(", ")}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Amount</div>
                    <div className="info-value">Rs. ${ticket.totalAmount}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Payment</div>
                    <div className="info-value">${ticket.paymentMethod}</div>
                  </div>
                </div>
              </div>
              
              <div className="qr-section">
                <div className="qr-container">
                  <img src="data:image/png;base64,${ticket.qrCodeData}" alt="QR Code" className="qr-code" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                  <div className="qr-text" style="display: none;">QR Code Not Available</div>
                  <div className="qr-text">Scan for boarding verification</div>
                </div>
              </div>
              
              <div className="footer">
                <div className="footer-title">Ebusewa - Your Journey Partner</div>
                <div className="footer-subtitle">Please arrive 30 minutes before departure • Keep this ticket safe</div>
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bus Ticket - ${ticket.ticketNumber}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Inter', sans-serif; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              padding: 20px;
            }
            .ticket-container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              border-radius: 20px;
              overflow: hidden;
              box-shadow: 0 20px 40px rgba(0,0,0,0.1);
              position: relative;
            }
            .ticket-header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
              position: relative;
              overflow: hidden;
            }
            .ticket-header::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.1)"/><circle cx="80" cy="40" r="1.5" fill="rgba(255,255,255,0.1)"/><circle cx="40" cy="80" r="1" fill="rgba(255,255,255,0.1)"/></svg>');
              animation: float 20s infinite linear;
            }
            @keyframes float {
              0% { transform: translate(0, 0) rotate(0deg); }
              100% { transform: translate(100px, 100px) rotate(360deg); }
            }
            .company-logo {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 10px;
            }
            .ticket-number {
              font-size: 16px;
              opacity: 0.9;
            }
            .route-section {
              background: #f8fafc;
              padding: 25px 20px;
              text-align: center;
              border-bottom: 2px dashed #e2e8f0;
            }
            .route-arrow {
              font-size: 24px;
              color: #667eea;
              margin: 10px 0;
            }
            .origin, .destination {
              font-size: 18px;
              font-weight: 600;
              color: #1e293b;
            }
            .travel-info {
              padding: 25px 20px;
              background: white;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-item {
              background: #f8fafc;
              padding: 15px;
              border-radius: 12px;
              border-left: 4px solid #667eea;
            }
            .info-label {
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
            }
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: #1e293b;
            }
            .qr-section {
              background: #f8fafc;
              padding: 25px 20px;
              text-align: center;
              border-top: 2px dashed #e2e8f0;
            }
            .qr-container {
              background: white;
              padding: 20px;
              border-radius: 15px;
              display: inline-block;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            .qr-code {
              width: 120px;
              height: 120px;
              border-radius: 8px;
            }
            .qr-text {
              font-size: 12px;
              color: #64748b;
              margin-top: 10px;
              font-weight: 500;
            }
            .footer {
              background: #1e293b;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 12px;
            }
            .footer-title {
              font-weight: 600;
              margin-bottom: 5px;
            }
            .footer-subtitle {
              opacity: 0.8;
              font-size: 11px;
            }
          </style>
        </head>
        <body>
          <div class="ticket-container">
            <div class="ticket-header">
              <div className="company-logo">🚌 Ebusewa</div>
              <div className="ticket-number">Ticket #${ticket.ticketNumber}</div>
            </div>
            
            <div className="route-section">
              <div className="origin">${ticket.origin}</div>
              <div className="route-arrow">→</div>
              <div className="destination">${ticket.destination}</div>
              <div style="margin-top: 10px; font-size: 14px; color: #64748b;">
                ${ticket.departureDate} at ${ticket.departureTime}
              </div>
            </div>
            
            <div className="travel-info">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label">Passenger</div>
                  <div className="info-value">${ticket.customerName}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Phone</div>
                  <div className="info-value">${ticket.customerPhone}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Bus</div>
                  <div className="info-value">${ticket.busName}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Seats</div>
                  <div className="info-value">${ticket.seatNumbers.join(", ")}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Amount</div>
                  <div className="info-value">Rs. ${ticket.totalAmount}</div>
                </div>
                <div className="info-item">
                  <div className="info-label">Payment</div>
                  <div className="info-value">${ticket.paymentMethod}</div>
                </div>
              </div>
            </div>
            
            <div className="qr-section">
              <div className="qr-container">
                <img src="data:image/png;base64,${ticket.qrCodeData}" alt="QR Code" className="qr-code" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
                <div className="qr-text" style="display: none;">QR Code Not Available</div>
                <div className="qr-text">Scan for boarding verification</div>
              </div>
            </div>
            
            <div className="footer">
              <div className="footer-title">Ebusewa - Your Journey Partner</div>
              <div className="footer-subtitle">Please arrive 30 minutes before departure • Keep this ticket safe</div>
            </div>
          </div>
        </body>
      </html>
    `;

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
      // Fallback: copy to clipboard
      const text = `Bus Ticket #${ticket.ticketNumber}\nFrom: ${ticket.origin}\nTo: ${ticket.destination}\nDate: ${ticket.departureDate}\nTime: ${ticket.departureTime}\nPassenger: ${ticket.customerName}`;
      await navigator.clipboard.writeText(text);
      alert("Ticket details copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl flex overflow-hidden border border-gray-200">
        {/* Left stub */}
        <div className="w-1/3 bg-gray-50 border-r border-dashed border-gray-300 flex flex-col justify-between p-6">
          <div>
            <div className="text-2xl font-extrabold tracking-widest text-gray-800 mb-2">
              BUS TICKET
            </div>
            <div className="text-xs font-semibold text-gray-500 mb-4">
              EXPRESS
            </div>
            <div className="text-sm text-gray-700 mb-2">
              Number: <span className="font-bold">{ticket.ticketNumber}</span>
            </div>
            <div className="text-sm text-gray-700 mb-2">
              Bus: <span className="font-bold">{ticket.busName}</span>
            </div>
            <div className="text-sm text-gray-700 mb-2">
              Seat:{" "}
              <span className="font-bold">{ticket.seatNumbers.join(", ")}</span>
            </div>
            <div className="text-xs text-gray-500 mt-6">{ticket.origin}</div>
            <div className="text-xs text-gray-500">{ticket.destination}</div>
            <div className="text-xs text-gray-400 mt-2">
              {ticket.departureTime}
            </div>
            <div className="text-xs text-gray-400">{ticket.departureDate}</div>
            <div className="text-xs text-gray-400 mt-4">
              {ticket.ticketNumber}
            </div>
          </div>
        </div>
        {/* Main section */}
        <div className="w-2/3 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl font-extrabold tracking-widest text-gray-800">
                BUS TICKET
              </div>
              {ticket.qrCodeData ? (
                <img
                  src={`data:image/png;base64,${ticket.qrCodeData}`}
                  alt="QR Code"
                  className="w-20 h-20 border border-gray-300 rounded"
                  onError={(e) => {
                    console.error("Failed to load QR code image");
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center bg-gray-100 border border-gray-300 rounded text-xs text-gray-400">
                  No QR
                </div>
              )}
            </div>
            <div className="text-xs text-gray-500 mb-4">
              The terminal COMPANY
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              <div>
                Date: <span className="font-bold">{ticket.departureDate}</span>
              </div>
              <div>
                Number: <span className="font-bold">{ticket.ticketNumber}</span>
              </div>
              <div>
                From: <span className="font-bold">{ticket.origin}</span>
              </div>
              <div>
                To: <span className="font-bold">{ticket.destination}</span>
              </div>
              <div>
                Time: <span className="font-bold">{ticket.departureTime}</span>
              </div>
              <div>
                Seat:{" "}
                <span className="font-bold">
                  {ticket.seatNumbers.join(", ")}
                </span>
              </div>
              <div>
                Class: <span className="font-bold">EXPRESS</span>
              </div>
              <div>
                Passenger:{" "}
                <span className="font-bold">{ticket.customerName}</span>
              </div>
              <div>
                Payment:{" "}
                <span className="font-bold">{ticket.paymentMethod}</span>
              </div>
              <div>
                Amount:{" "}
                <span className="font-bold">Rs. {ticket.totalAmount}</span>
              </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {ticket.ticketNumber}
            </div>
          </div>
          {showActions && (
            <div className="flex gap-2 mt-6">
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
            <Button variant="outline" onClick={onClose} className="w-full mt-4">
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
