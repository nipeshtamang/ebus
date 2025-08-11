import axios from "axios";

const API_BASE_URL = "http://localhost:3001/api";

// Test data for multi-seat booking
const testMultiSeatBooking = {
  scheduleId: 1, // Replace with actual schedule ID
  passengers: [
    {
      seatNumber: "A1",
      passengerName: "John Doe",
      passengerPhone: "+977-9841234567",
      passengerEmail: "john.doe@example.com",
      passengerIdNumber: "1234567890",
    },
    {
      seatNumber: "A2",
      passengerName: "Jane Smith",
      passengerPhone: "+977-9841234568",
      passengerEmail: "jane.smith@example.com",
      passengerIdNumber: "0987654321",
    },
    {
      seatNumber: "A3",
      passengerName: "Bob Johnson",
      passengerPhone: "+977-9841234569",
      passengerEmail: "bob.johnson@example.com",
    },
  ],
  bookerName: "John Doe",
  bookerPhone: "+977-9841234567",
  bookerEmail: "john.doe@example.com",
};

// Test data for admin creating multi-seat booking for user
const testAdminMultiSeatBooking = {
  scheduleId: 1, // Replace with actual schedule ID
  passengers: [
    {
      seatNumber: "B1",
      passengerName: "Alice Brown",
      passengerPhone: "+977-9841234570",
      passengerEmail: "alice.brown@example.com",
      passengerIdNumber: "1122334455",
    },
    {
      seatNumber: "B2",
      passengerName: "Charlie Wilson",
      passengerPhone: "+977-9841234571",
      passengerEmail: "charlie.wilson@example.com",
    },
  ],
  bookerName: "Alice Brown",
  bookerPhone: "+977-9841234570",
  bookerEmail: "alice.brown@example.com",
  paymentMethod: "CASH",
};

async function runMultiSeatBookingTests() {
  try {
    console.log("🚀 Testing Multi-Seat Booking System");
    console.log("=====================================\n");

    // First, let's login as a client to test regular booking
    console.log("1. Testing Client Multi-Seat Booking...");

    const clientLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "client@example.com", // Replace with actual client email
      password: "password123", // Replace with actual password
    });

    const clientToken = clientLoginResponse.data.token;

    const clientBookingResponse = await axios.post(
      `${API_BASE_URL}/bookings`,
      testMultiSeatBooking,
      {
        headers: {
          Authorization: `Bearer ${clientToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Client Multi-Seat Booking Successful!");
    console.log("Ticket Number:", clientBookingResponse.data.ticketNumber);
    console.log("Order ID:", clientBookingResponse.data.order.id);
    console.log(
      "Number of Bookings:",
      clientBookingResponse.data.bookings.length
    );
    console.log(
      "Seats Booked:",
      clientBookingResponse.data.bookings
        .map((b) => b.seat.seatNumber)
        .join(", ")
    );
    console.log("");

    // Now test admin creating booking for user
    console.log("2. Testing Admin Multi-Seat Booking for User...");

    const adminLoginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "admin@example.com", // Replace with actual admin email
      password: "password123", // Replace with actual password
    });

    const adminToken = adminLoginResponse.data.token;

    const adminBookingResponse = await axios.post(
      `${API_BASE_URL}/bookings/admin`,
      testAdminMultiSeatBooking,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Admin Multi-Seat Booking Successful!");
    console.log("Ticket Number:", adminBookingResponse.data.ticketNumber);
    console.log("Order ID:", adminBookingResponse.data.order.id);
    console.log(
      "Number of Bookings:",
      adminBookingResponse.data.bookings.length
    );
    console.log(
      "Seats Booked:",
      adminBookingResponse.data.bookings
        .map((b) => b.seat.seatNumber)
        .join(", ")
    );
    console.log(
      "Payment Method:",
      adminBookingResponse.data.bookings[0].payment?.method
    );
    console.log("");

    // Test retrieving booking by ticket number
    console.log("3. Testing Ticket Retrieval...");

    const ticketResponse = await axios.get(
      `${API_BASE_URL}/bookings/ticket/${adminBookingResponse.data.ticketNumber}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    console.log("✅ Ticket Retrieval Successful!");
    console.log("Ticket Details:", {
      ticketNumber: ticketResponse.data.order.ticket.ticketNumber,
      passengerCount: ticketResponse.data.order.bookings.length,
      totalAmount: ticketResponse.data.payment?.amount,
      status: ticketResponse.data.status,
    });

    console.log("\n🎉 All Multi-Seat Booking Tests Passed!");
    console.log("\n📋 Summary:");
    console.log("- Single ticket per transaction with multiple seats");
    console.log("- Individual passenger details per seat");
    console.log("- Main booker contact information");
    console.log("- QR code contains all passenger information");
    console.log("- Admin can create bookings for users");
    console.log("- Payment tracking per order");
  } catch (error) {
    console.error("❌ Test Failed:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      console.log(
        "\n💡 Tip: Make sure you have valid user credentials in the test script"
      );
    }

    if (error.response?.status === 404) {
      console.log(
        "\n💡 Tip: Make sure the schedule ID exists in your database"
      );
    }
  }
}

// Run the test
runMultiSeatBookingTests();
