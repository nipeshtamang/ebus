import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

async function testMultipleSeatBooking() {
  try {
    console.log("🧪 Testing Multiple Seat Booking with Single Ticket...\n");

    // Step 1: Login as admin
    console.log("1. Logging in as admin...");
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: "admin@ebusewa.com",
      password: "admin123",
    });

    const adminToken = loginResponse.data.token;
    console.log("✅ Admin login successful\n");

    // Step 2: Get available schedules
    console.log("2. Getting available schedules...");
    const schedulesResponse = await axios.get(`${API_BASE_URL}/schedules`);
    const schedules = schedulesResponse.data;

    if (schedules.length === 0) {
      console.log("❌ No schedules available. Please create a schedule first.");
      return;
    }

    const schedule = schedules[0];
    console.log(
      `✅ Found schedule: ${schedule.route.origin} → ${schedule.route.destination} (ID: ${schedule.id})\n`
    );

    // Step 3: Get schedule with seats
    console.log("3. Getting schedule with seats...");
    const scheduleWithSeatsResponse = await axios.get(
      `${API_BASE_URL}/schedules/${schedule.id}/seats`
    );
    const scheduleWithSeats = scheduleWithSeatsResponse.data;

    const availableSeats = scheduleWithSeats.seats.filter(
      (seat) => !seat.isBooked
    );
    if (availableSeats.length < 2) {
      console.log("❌ Not enough available seats. Need at least 2 seats.");
      return;
    }

    const selectedSeats = availableSeats
      .slice(0, 2)
      .map((seat) => seat.seatNumber);
    console.log(`✅ Selected seats: ${selectedSeats.join(", ")}\n`);

    // Step 4: Create booking for multiple seats
    console.log("4. Creating booking for multiple seats...");
    const bookingResponse = await axios.post(
      `${API_BASE_URL}/bookings/admin`,
      {
        scheduleId: schedule.id,
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerPhone: "9876543210",
        seatNumbers: selectedSeats,
        paymentMethod: "CASH",
      },
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    const bookingResult = bookingResponse.data;
    console.log("✅ Booking created successfully");
    console.log(`   - Order ID: ${bookingResult.order.id}`);
    console.log(`   - Bookings created: ${bookingResult.bookings.length}`);
    console.log(`   - Ticket Number: ${bookingResult.ticketNumber}`);
    console.log(`   - Total Amount: Rs. ${bookingResult.payment.amount}\n`);

    // Step 5: Verify all bookings show the same ticket
    console.log("5. Verifying ticket information for all bookings...");
    const allBookingsResponse = await axios.get(`${API_BASE_URL}/bookings`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    const allBookings = allBookingsResponse.data.bookings;
    const orderBookings = allBookings.filter(
      (booking) => booking.orderId === bookingResult.order.id
    );

    console.log(`   Found ${orderBookings.length} bookings for this order:`);

    let ticketCount = 0;
    orderBookings.forEach((booking, index) => {
      console.log(`   Booking ${index + 1}:`);
      console.log(`     - Seat: ${booking.seat.seatNumber}`);
      console.log(`     - Has Ticket: ${booking.ticket ? "Yes" : "No"}`);
      if (booking.ticket) {
        console.log(`     - Ticket Number: ${booking.ticket.ticketNumber}`);
        ticketCount++;
      }
    });

    if (ticketCount === orderBookings.length) {
      console.log(
        "\n✅ SUCCESS: All bookings show the same ticket information!"
      );
    } else {
      console.log("\n❌ ISSUE: Not all bookings show ticket information");
    }

    console.log("\n🎯 Test Summary:");
    console.log(`   - Multiple seats booked: ${selectedSeats.join(", ")}`);
    console.log(`   - Single ticket generated: ${bookingResult.ticketNumber}`);
    console.log(
      `   - All bookings show ticket: ${ticketCount === orderBookings.length ? "Yes" : "No"}`
    );
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
}

// Run the test
testMultipleSeatBooking();
