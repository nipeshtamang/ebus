"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOptimizedTicketData = generateOptimizedTicketData;
exports.generateTicketNumber = generateTicketNumber;
exports.generateQRCode = generateQRCode;
exports.generateTicketQRCode = generateTicketQRCode;
const qrcode_1 = require("qrcode");
// Utility function to generate optimized ticket data
function generateOptimizedTicketData(data) {
    // Optimize the data structure to reduce JSON size
    return {
        tn: data.ticketNumber, // ticketNumber
        oid: data.orderId, // orderId
        u: {
            // user
            id: data.user.id,
            n: data.user.name, // name
            p: data.user.phoneNumber, // phoneNumber
        },
        b: {
            // bus
            id: data.bus.id,
            n: data.bus.name, // name
            lt: data.bus.layoutType, // layoutType
        },
        s: {
            // schedule
            id: data.schedule.id,
            d: data.schedule.departure, // departure
            ir: data.schedule.isReturn, // isReturn
            f: data.schedule.fare, // fare
            r: {
                // route
                o: data.schedule.route.origin, // origin
                dest: data.schedule.route.destination, // destination
            },
        },
        sn: data.seatNumbers, // seatNumbers
        ps: data.passengers?.map((p) => ({
            n: p.name,
            p: p.phone,
            e: p.email,
            id: p.idNumber,
        })), // passengers
        pa: data.paidByAdmin, // paidByAdmin
        pm: data.paymentMethod, // paymentMethod
        ta: data.totalAmount, // totalAmount
    };
}
function generateTicketNumber() {
    // Generate a more professional ticket number format: EB-YYYYMMDD-XXXXX
    const date = new Date();
    const dateStr = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, "0") +
        date.getDate().toString().padStart(2, "0");
    const randomNum = Math.floor(Math.random() * 100000)
        .toString()
        .padStart(5, "0");
    return `EB-${dateStr}-${randomNum}`;
}
async function generateQRCode(data, width = 256) {
    try {
        console.log("Generating QR code with data:", JSON.stringify(data, null, 2));
        // Convert data to JSON string
        const jsonData = JSON.stringify(data);
        console.log("JSON data length:", jsonData.length);
        // Generate QR code as data URL
        const qrCodeDataURL = await (0, qrcode_1.toDataURL)(jsonData, {
            errorCorrectionLevel: "M",
            type: "image/png",
            margin: 1,
            color: {
                dark: "#000000",
                light: "#FFFFFF",
            },
            width: width,
        });
        console.log("QR code generated successfully, data URL length:", qrCodeDataURL.length);
        // Extract base64 data from data URL
        const base64Data = qrCodeDataURL.split(",")[1];
        if (!base64Data) {
            throw new Error("Failed to extract base64 data from QR code data URL");
        }
        console.log("Base64 data extracted, length:", base64Data.length);
        return base64Data;
    }
    catch (error) {
        console.error("Error generating QR code:", error);
        console.error("Error details:", {
            message: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
        });
        throw new Error("Failed to generate QR code");
    }
}
async function generateTicketQRCode(ticketData) {
    try {
        console.log("Generating ticket QR code for ticket:", ticketData.tn);
        // Create a simplified ticket data for QR code with return trip information
        const qrData = {
            ticketNumber: ticketData.tn,
            orderId: ticketData.oid,
            booker: ticketData.u.n,
            bookerPhone: ticketData.u.p,
            route: `${ticketData.s.r.o} → ${ticketData.s.r.dest}`,
            date: ticketData.s.d,
            seats: ticketData.sn.join(", "),
            bus: ticketData.b.n,
            amount: ticketData.ta,
            paymentMethod: ticketData.pm,
            isReturn: ticketData.s.ir, // Include return trip indicator
            tripType: ticketData.s.ir ? "Return Trip" : "Outbound Trip", // Clear trip type
            passengers: ticketData.ps?.map((p) => ({
                name: p.n,
                phone: p.p,
                email: p.e,
                idNumber: p.id,
            })),
        };
        console.log("QR data prepared:", JSON.stringify(qrData, null, 2));
        const qrCode = await generateQRCode(qrData);
        console.log("Ticket QR code generated successfully for ticket:", ticketData.tn);
        return qrCode;
    }
    catch (error) {
        console.error("Error generating ticket QR code:", error);
        console.error("Ticket data that failed:", JSON.stringify(ticketData, null, 2));
        throw new Error("Failed to generate ticket QR code");
    }
}
