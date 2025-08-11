import { prisma } from "../config/db";
import { SendOTPInput, VerifyOTPInput } from "@ebusewa/common";
import * as nodemailer from "nodemailer";
import { env } from "../config/env";
import { logAudit } from "./audit.service";
import { htmlToPdfBuffer } from "./pdf.service";

// Generate a 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP via email using nodemailer and Gmail SMTP
async function sendEmailOTP(email: string, otp: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  // Verify transporter configuration
  await transporter.verify();

  await transporter.sendMail({
    from: `"Ebusewa" <${env.SMTP_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
    html: `<p>Your OTP code is: <b>${otp}</b></p>`,
  });
}

export async function sendOTP(data: SendOTPInput): Promise<void> {
  const { email } = data;

  // Generate OTP
  const otp = generateOTP();

  // Set expiration (15 minutes from now)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  // Delete any existing OTPs for this email
  await prisma.emailOTP.deleteMany({
    where: { email },
  });

  // Create new OTP record
  await prisma.emailOTP.create({
    data: {
      email,
      otp,
      expiresAt,
    },
  });

  // Send OTP via email
  await sendEmailOTP(email, otp);
}

export async function verifyOTP(data: VerifyOTPInput): Promise<boolean> {
  const { email, otp } = data;

  // Find the OTP record
  const otpRecord = await prisma.emailOTP.findFirst({
    where: {
      email,
      otp,
      used: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });

  if (!otpRecord) {
    return false;
  }

  // Check if user is SUPERADMIN
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.role === "SUPERADMIN") {
    return false;
  }

  // Mark OTP as used
  await prisma.emailOTP.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  // Mark user as email verified
  await prisma.user.updateMany({
    where: { email },
    data: { emailVerified: true },
  });

  return true;
}

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface TicketEmailData {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  ticketNumber: string;
  seatNumbers: string[];
  departureTime: string;
  departureDate: string;
  origin: string;
  destination: string;
  busName: string;
  totalAmount: number;
  paymentMethod: string;
  qrCodeData: string;
}

interface CancellationEmailData {
  customerPhone?: string;
  paymentMethod?: string;
  qrCodeData?: string;
  customerName: string;
  customerEmail: string;
  ticketNumber: string;
  seatNumbers: string[];
  departureTime: string;
  departureDate: string;
  origin: string;
  destination: string;
  busName: string;
  totalAmount: number;
  refundedAmount: number;
  cancellationFee: number;
  reason?: string;
  cancelledBy: "CUSTOMER" | "ADMIN";
}

export async function sendTicketEmail(data: TicketEmailData) {
  try {
    // Use the same HTML (with QR code) for both email and PDF, as before
    const htmlContent = generateTicketEmailHTMLWithQR(data);
    let pdfBuffer: Buffer | undefined = undefined;
    try {
      pdfBuffer = await htmlToPdfBuffer(htmlContent);
    } catch (err) {
      console.error("Failed to generate PDF for ticket email:", err);
    }

    const mailOptions: any = {
      from: process.env.SMTP_USER,
      to: data.customerEmail,
      subject: `Your Bus Ticket - ${data.ticketNumber}`,
      html: htmlContent,
      attachments: pdfBuffer
        ? [
            {
              filename: `ticket-${data.ticketNumber}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : [],
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("Ticket email sent successfully:", result.messageId);

    // Fetch ticket by ticketNumber to get its id for audit log
    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber: data.ticketNumber },
    });
    const entityId = ticket?.id;
    if (!entityId) {
      console.error("Could not find ticket for audit log", data.ticketNumber);
    }
    await logAudit({
      action: "TICKET_EMAIL_SENT",
      entity: "Ticket",
      entityId: entityId || 0, // fallback to 0 if not found
      after: {
        email: data.customerEmail,
        ticketNumber: data.ticketNumber,
        messageId: result.messageId,
      },
    });

    return result;
  } catch (error) {
    console.error("Error sending ticket email:", error);
    throw error;
  }
  // PDF template: includes QR code
  function generateTicketEmailHTMLWithQR(data: TicketEmailData): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Bus Ticket - ${data.ticketNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .ticket-table-outer { max-width: 420px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; padding: 24px 12px; }
        .ticket-title { text-align: center; font-size: 1.7rem; font-weight: bold; color: #222; margin-bottom: 12px; }
        .qr-row { text-align: center; padding-bottom: 12px; }
        .qr-img { border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; padding: 8px; display: inline-block; }
        .info-label { color: #888; font-size: 0.98rem; padding-right: 8px; white-space: nowrap; }
        .info-value { font-size: 1.08rem; font-weight: 600; color: #222; }
        .main-footer { font-size: 0.95rem; color: #888; margin-top: 18px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="ticket-table-outer">
        <div class="qr-row">
          <span class="qr-img">
            ${data.qrCodeData ?
              `<img src="data:image/png;base64,${data.qrCodeData}" alt="QR Code" width="110" height="110" style="display:block; margin:auto;" />` :
              `<div style="width:110px; height:110px; background:#f3f4f6; border:2px solid #e5e7eb; border-radius:8px; display:flex; align-items:center; justify-content:center; margin:auto;">
                <span style="color:#9ca3af; font-size:12px;">QR Code<br/>Not Available</span>
               </div>`
            }
          </span>
        </div>
        <div class="ticket-title">BUS TICKET</div>
        <table width="100%" cellpadding="6" cellspacing="0" style="margin-bottom: 10px;">
          <tr><td class="info-label">Ticket No:</td><td class="info-value">${data.ticketNumber}</td></tr>
          <tr><td class="info-label">Passenger:</td><td class="info-value">${data.customerName}</td></tr>
          <tr><td class="info-label">Phone:</td><td class="info-value">${data.customerPhone ? data.customerPhone : "-"}</td></tr>
          <tr><td class="info-label">Bus:</td><td class="info-value">${data.busName}</td></tr>
          <tr><td class="info-label">Seats:</td><td class="info-value">${data.seatNumbers.join(", ")}</td></tr>
          <tr><td class="info-label">From:</td><td class="info-value">${data.origin}</td></tr>
          <tr><td class="info-label">To:</td><td class="info-value">${data.destination}</td></tr>
          <tr><td class="info-label">Date:</td><td class="info-value">${data.departureDate}</td></tr>
          <tr><td class="info-label">Time:</td><td class="info-value">${data.departureTime}</td></tr>
          <tr><td class="info-label">Payment:</td><td class="info-value">${data.paymentMethod}</td></tr>
          <tr><td class="info-label">Amount:</td><td class="info-value">Rs. ${data.totalAmount}</td></tr>
        </table>
        <div class="main-footer">
          <b>Important:</b> Please arrive at least 30 minutes before departure. Show this ticket (or the QR code) to the bus conductor for boarding.<br/>
          <span style="color:#bbb;">${data.ticketNumber}</span>
        </div>
      </div>
    </body>
    </html>
  `;
  }
}

export async function sendCancellationEmail(data: CancellationEmailData) {
  try {
    const htmlContent = generateCancellationEmailHTML(data);
    // Generate PDF from HTML
    let pdfBuffer: Buffer | undefined = undefined;
    try {
      pdfBuffer = await htmlToPdfBuffer(htmlContent);
    } catch (err) {
      console.error("Failed to generate PDF for cancellation email:", err);
    }

    const mailOptions: any = {
      from: process.env.SMTP_USER,
      to: data.customerEmail,
      subject: `Booking Cancelled - ${data.ticketNumber}`,
      html: htmlContent,
      attachments: [],
    };
    if (pdfBuffer) {
      mailOptions.attachments.push({
        filename: `cancellation-${data.ticketNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }

    const result = await transporter.sendMail(mailOptions);

    console.log("Cancellation email sent successfully:", result.messageId);

    // Fetch ticket by ticketNumber to get its id for audit log
    const ticket = await prisma.ticket.findUnique({
      where: { ticketNumber: data.ticketNumber },
    });
    const entityId = ticket?.id;
    if (!entityId) {
      console.error("Could not find ticket for audit log", data.ticketNumber);
    }
    await logAudit({
      action: "CANCELLATION_EMAIL_SENT",
      entity: "Ticket",
      entityId: entityId || 0, // fallback to 0 if not found
      after: {
        email: data.customerEmail,
        ticketNumber: data.ticketNumber,
        messageId: result.messageId,
      },
    });

    return result;
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    throw error;
  }
}

function generateTicketEmailHTML(data: TicketEmailData): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Bus Ticket - ${data.ticketNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .ticket-table-outer { max-width: 420px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; padding: 24px 12px; }
        .ticket-title { text-align: center; font-size: 1.7rem; font-weight: bold; color: #222; margin-bottom: 12px; }
        .info-label { color: #888; font-size: 0.98rem; padding-right: 8px; white-space: nowrap; }
        .info-value { font-size: 1.08rem; font-weight: 600; color: #222; }
        .main-footer { font-size: 0.95rem; color: #888; margin-top: 18px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="ticket-table-outer">
        <div class="ticket-title">BUS TICKET</div>
        <table width="100%" cellpadding="6" cellspacing="0" style="margin-bottom: 10px;">
          <tr><td class="info-label">Ticket No:</td><td class="info-value">${data.ticketNumber}</td></tr>
          <tr><td class="info-label">Passenger:</td><td class="info-value">${data.customerName}</td></tr>
          <tr><td class="info-label">Phone:</td><td class="info-value">${data.customerPhone ? data.customerPhone : "-"}</td></tr>
          <tr><td class="info-label">Bus:</td><td class="info-value">${data.busName}</td></tr>
          <tr><td class="info-label">Seats:</td><td class="info-value">${data.seatNumbers.join(", ")}</td></tr>
          <tr><td class="info-label">From:</td><td class="info-value">${data.origin}</td></tr>
          <tr><td class="info-label">To:</td><td class="info-value">${data.destination}</td></tr>
          <tr><td class="info-label">Date:</td><td class="info-value">${data.departureDate}</td></tr>
          <tr><td class="info-label">Time:</td><td class="info-value">${data.departureTime}</td></tr>
          <tr><td class="info-label">Payment:</td><td class="info-value">${data.paymentMethod}</td></tr>
          <tr><td class="info-label">Amount:</td><td class="info-value">Rs. ${data.totalAmount}</td></tr>
        </table>
        <div class="main-footer">
          <b>Important:</b> Please arrive at least 30 minutes before departure. Show this ticket to the bus conductor for boarding.<br/>
          <span style="color:#bbb;">${data.ticketNumber}</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateCancellationEmailHTML(data: CancellationEmailData): string {
  // Use the same design as the ticket email, but with a CANCELLED label and refund info
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Cancelled - ${data.ticketNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
        .ticket-table-outer { max-width: 420px; margin: 32px auto; background: #fff; border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; padding: 24px 12px; }
        .ticket-title { text-align: center; font-size: 1.7rem; font-weight: bold; color: #222; margin-bottom: 12px; }
        .cancelled-label { text-align: center; font-size: 1.1rem; font-weight: bold; color: #fff; background: #e53e3e; border-radius: 6px; padding: 4px 0; margin-bottom: 12px; letter-spacing: 0.1em; }
        .qr-row { text-align: center; padding-bottom: 12px; }
        .qr-img { border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; padding: 8px; display: inline-block; }
        .info-label { color: #888; font-size: 0.98rem; padding-right: 8px; white-space: nowrap; }
        .info-value { font-size: 1.08rem; font-weight: 600; color: #222; }
        .main-footer { font-size: 0.95rem; color: #888; margin-top: 18px; text-align: center; }
        .refund-row { margin-top: 16px; text-align: center; }
        .refund-label { color: #e53e3e; font-weight: bold; font-size: 1.1rem; }
        .refund-value { color: #222; font-weight: bold; font-size: 1.1rem; }
      </style>
    </head>
    <body>
      <div class="ticket-table-outer">
        <div class="cancelled-label">BOOKING CANCELLED</div>
        <div class="qr-row">
          <span class="qr-img">
            ${data.qrCodeData ?
              `<img src="data:image/png;base64,${data.qrCodeData}" alt="QR Code" width="110" height="110" style="display:block; margin:auto;" />` :
              `<div style="width:110px; height:110px; background:#f3f4f6; border:2px solid #e5e7eb; border-radius:8px; display:flex; align-items:center; justify-content:center; margin:auto;">
                <span style="color:#9ca3af; font-size:12px;">QR Code<br/>Not Available</span>
               </div>`
            }
          </span>
        </div>
        <div class="ticket-title">BUS TICKET</div>
        <table width="100%" cellpadding="6" cellspacing="0" style="margin-bottom: 10px;">
          <tr><td class="info-label">Ticket No:</td><td class="info-value">${data.ticketNumber}</td></tr>
          <tr><td class="info-label">Passenger:</td><td class="info-value">${data.customerName}</td></tr>
          <tr><td class="info-label">Phone:</td><td class="info-value">${data.customerPhone ? data.customerPhone : "-"}</td></tr>
          <tr><td class="info-label">Bus:</td><td class="info-value">${data.busName}</td></tr>
          <tr><td class="info-label">Seats:</td><td class="info-value">${data.seatNumbers.join(", ")}</td></tr>
          <tr><td class="info-label">From:</td><td class="info-value">${data.origin}</td></tr>
          <tr><td class="info-label">To:</td><td class="info-value">${data.destination}</td></tr>
          <tr><td class="info-label">Date:</td><td class="info-value">${data.departureDate}</td></tr>
          <tr><td class="info-label">Time:</td><td class="info-value">${data.departureTime}</td></tr>
          <tr><td class="info-label">Payment:</td><td class="info-value">${data.paymentMethod || "-"}</td></tr>
          <tr><td class="info-label">Amount:</td><td class="info-value">Rs. ${data.totalAmount}</td></tr>
        </table>
        <div class="refund-row">
          <span class="refund-label">Refund Amount:</span> <span class="refund-value">Rs. ${data.refundedAmount}</span><br/>
          <span class="refund-label">Cancellation Fee:</span> <span class="refund-value">Rs. ${data.cancellationFee}</span><br/>
          <span class="refund-label">Reason:</span> <span class="refund-value">${data.reason || "No reason provided"}</span>
        </div>
        <div class="main-footer">
          <b>Important:</b> Refunds will be processed within 7 working days.<br/>
          <span style="color:#bbb;">${data.ticketNumber}</span>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Password Reset Request - Ebusewa",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Password Reset Request</h2>
          <p>You requested a password reset for your Ebusewa account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Reset Password
          </a>
          <p>If you didn't request this, please ignore this email.</p>
          <p>This link will expire in 1 hour.</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Password reset email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: "Welcome to Ebusewa!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">Welcome to Ebusewa, ${name}!</h2>
          <p>Thank you for creating an account with us. We're excited to have you on board!</p>
          <p>You can now:</p>
          <ul>
            <li>Book bus tickets online</li>
            <li>View your booking history</li>
            <li>Manage your profile</li>
            <li>Receive ticket confirmations via email</li>
          </ul>
          <p>If you have any questions, feel free to contact our support team.</p>
          <p>Happy travels!</p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("Welcome email sent:", result.messageId);
    return result;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
}
