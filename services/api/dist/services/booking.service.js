import { PrismaClient } from "@prisma/client";
import { logAudit } from "./audit.service";
import { generateOptimizedTicketData, generateTicketNumber, generateTicketQRCode, } from "./ticket.service";
import { sendTicketEmail, sendCancellationEmail } from "./email.service";
import { format } from "date-fns";
const prisma = new PrismaClient();
export async function bookSeats(userId, scheduleId, seats) {
    try {
        console.log(`Booking seats for user ${userId}, schedule ${scheduleId}, seats:`, seats);
        // Validate schedule exists
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: { route: true, bus: true },
        });
        if (!schedule) {
            throw new Error(`Schedule ${scheduleId} not found`);
        }
        // Get user details for ticket generation
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error(`User ${userId} not found`);
        }
        // Validate all seats exist and are available
        const seatValidations = await Promise.all(seats.map(async (seatNumber) => {
            const seat = await prisma.seat.findUnique({
                where: {
                    scheduleId_seatNumber: { scheduleId, seatNumber },
                },
                include: {
                    booking: true,
                    reservation: true,
                },
            });
            if (!seat) {
                throw new Error(`Seat ${seatNumber} does not exist for schedule ${scheduleId}`);
            }
            if (seat.isBooked) {
                throw new Error(`Seat ${seatNumber} is already booked`);
            }
            // Check if there's already a booking for this seat
            if (seat.booking) {
                throw new Error(`Seat ${seatNumber} is already booked by another user`);
            }
            // Check if there's an active reservation for this seat
            if (seat.reservation &&
                seat.reservation.status === "PENDING" &&
                seat.reservation.expiresAt > new Date()) {
                throw new Error(`Seat ${seatNumber} is currently reserved`);
            }
            return seat;
        }));
        // Create order, bookings, and ticket in transaction
        let result;
        try {
            result = await prisma.$transaction(async (tx) => {
                // Create order first
                const order = await tx.order.create({
                    data: { userId },
                });
                console.log("Created order:", order.id);
                // Double-check seat availability within transaction
                const seatsToBook = await Promise.all(seats.map(async (seatNumber) => {
                    const seat = seatValidations.find((s) => s.seatNumber === seatNumber);
                    if (!seat) {
                        throw new Error(`Seat ${seatNumber} validation failed`);
                    }
                    const currentSeat = await tx.seat.findUnique({
                        where: { id: seat.id },
                        include: { booking: true },
                    });
                    if (!currentSeat) {
                        throw new Error(`Seat ${seatNumber} no longer exists`);
                    }
                    if (currentSeat.isBooked || currentSeat.booking) {
                        throw new Error(`Seat ${seatNumber} is no longer available`);
                    }
                    return { seat: currentSeat, seatNumber };
                }));
                // Mark all seats as booked
                await Promise.all(seatsToBook.map(({ seat }) => tx.seat.update({
                    where: { id: seat.id },
                    data: { isBooked: true },
                })));
                // Bulk-insert all bookings in one call
                const bookingData = seatsToBook.map(({ seat }) => ({
                    userId,
                    scheduleId,
                    seatId: seat.id,
                    orderId: order.id,
                    status: "BOOKED",
                    passengerName: user.name,
                    passengerPhone: user.phoneNumber,
                    passengerEmail: user.email,
                }));
                await tx.booking.createMany({
                    data: bookingData,
                });
                // Get the created bookings for audit logging
                const createdBookings = await tx.booking.findMany({
                    where: {
                        orderId: order.id,
                    },
                    include: {
                        seat: true,
                    },
                });
                // Log audit for each booking
                await Promise.all(createdBookings.map((booking) => logAudit({
                    action: "CREATE_BOOKING",
                    entity: "Booking",
                    entityId: booking.id,
                    after: booking,
                })));
                // Generate ticket for ALL seats (one ticket per order, multiple seats)
                const ticketNumber = generateTicketNumber();
                // Extract passenger details from bookings
                const passengerDetails = createdBookings.map((booking) => ({
                    name: booking.passengerName || user.name,
                    phone: booking.passengerPhone || user.phoneNumber,
                    email: booking.passengerEmail || user.email,
                    idNumber: booking.passengerId || undefined,
                }));
                const totalAmount = schedule.fare * seats.length;
                const ticketDetails = generateOptimizedTicketData({
                    ticketNumber,
                    orderId: order.id,
                    user: {
                        id: userId,
                        name: user.name,
                        phoneNumber: user.phoneNumber,
                    },
                    bus: {
                        id: schedule.bus.id,
                        name: schedule.bus.name,
                        layoutType: schedule.bus.layoutType,
                    },
                    schedule: {
                        id: schedule.id,
                        departure: schedule.departure,
                        isReturn: schedule.isReturn,
                        fare: schedule.fare,
                        route: {
                            origin: schedule.route.origin,
                            destination: schedule.route.destination,
                        },
                    },
                    seatNumbers: seats, // All seat numbers included in ticket data
                    passengers: passengerDetails, // Individual passenger details
                    paymentMethod: "PENDING", // Client bookings start as pending
                    totalAmount,
                });
                // Generate QR code for the ticket (includes all seat numbers)
                const qrCodeData = await generateTicketQRCode(ticketDetails);
                // Create one ticket that covers all seats for this order
                const ticket = await tx.ticket.create({
                    data: {
                        orderId: order.id, // Link to order instead of individual booking
                        ticketNumber,
                        qrCode: qrCodeData, // Store the actual QR code image data
                    },
                });
                console.log("Generated ticket:", ticket.id, "with number:", ticketNumber, "for seats:", seats.join(", "));
                return { order, bookings: createdBookings, ticket, ticketNumber };
            }, {
                timeout: 15000, // Increase timeout to 15 seconds
            });
        }
        catch (error) {
            console.error("Transaction error:", error);
            // Check if it's a unique constraint violation
            if (error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "P2002") {
                const prismaError = error;
                if (prismaError.meta?.target?.includes("seatId")) {
                    throw new Error("One or more seats are no longer available. Please try again with different seats.");
                }
                if (prismaError.meta?.target?.includes("scheduleId_seatNumber")) {
                    throw new Error("One or more seats are no longer available. Please try again with different seats.");
                }
            }
            // Re-throw the original error if it's not a constraint violation
            throw error;
        }
        console.log(`Successfully booked ${seats.length} seats for user ${userId}`);
        return result;
    }
    catch (error) {
        console.error("Error in bookSeats:", error);
        throw error;
    }
}
export async function bookSeatsForUser(adminId, data) {
    try {
        console.log("Admin booking request:", { adminId, ...data });
        // Validate required fields
        if (!data.scheduleId) {
            throw new Error("Schedule ID is required");
        }
        if (!data.seatNumbers || data.seatNumbers.length === 0) {
            throw new Error("At least one seat must be selected");
        }
        if (!data.customerPhone) {
            throw new Error("Customer phone number is required");
        }
        if (!data.customerName) {
            throw new Error("Customer name is required");
        }
        if (!data.customerEmail) {
            throw new Error("Customer email is required");
        }
        // Validate schedule exists
        const schedule = await prisma.schedule.findUnique({
            where: { id: data.scheduleId },
            include: { route: true, bus: true },
        });
        if (!schedule) {
            throw new Error(`Schedule ${data.scheduleId} not found`);
        }
        // Check if user exists with this phone number
        let customerId = data.userId;
        let existingUser = null;
        if (!customerId) {
            existingUser = await prisma.user.findFirst({
                where: { phoneNumber: data.customerPhone },
            });
            if (existingUser) {
                console.log("Found existing user:", existingUser.id);
                customerId = existingUser.id;
            }
        }
        // If no existing user, create a new user with the provided information
        if (!customerId) {
            console.log("Creating new user with provided information");
            try {
                const newUser = await prisma.user.create({
                    data: {
                        name: data.customerName,
                        email: data.customerEmail,
                        phoneNumber: data.customerPhone,
                        role: "CLIENT",
                        passwordHash: "temp_password", // Will be reset on first login
                    },
                });
                customerId = newUser.id;
                console.log("Created new user:", customerId);
            }
            catch (error) {
                if (error &&
                    typeof error === "object" &&
                    "code" in error &&
                    error.code === "P2002") {
                    // Handle unique constraint violation
                    if ("meta" in error &&
                        error.meta &&
                        typeof error.meta === "object" &&
                        "target" in error.meta) {
                        const target = error.meta.target;
                        if (target.includes("email")) {
                            throw new Error("Email address is already registered");
                        }
                        else if (target.includes("phoneNumber")) {
                            throw new Error("Phone number is already registered");
                        }
                    }
                }
                throw error;
            }
        }
        // Ensure customerId is defined
        if (!customerId) {
            throw new Error("Failed to create or find user for booking");
        }
        // Validate all seats exist and are available
        const seatValidations = await Promise.all(data.seatNumbers.map(async (seatNumber) => {
            const seat = await prisma.seat.findUnique({
                where: {
                    scheduleId_seatNumber: { scheduleId: data.scheduleId, seatNumber },
                },
                include: {
                    booking: true,
                    reservation: true,
                },
            });
            if (!seat) {
                throw new Error(`Seat ${seatNumber} does not exist for schedule ${data.scheduleId}`);
            }
            if (seat.isBooked) {
                throw new Error(`Seat ${seatNumber} is already booked`);
            }
            // Check if there's already a booking for this seat
            if (seat.booking) {
                throw new Error(`Seat ${seatNumber} is already booked by another user`);
            }
            // Check if there's an active reservation for this seat
            if (seat.reservation &&
                seat.reservation.status === "PENDING" &&
                seat.reservation.expiresAt > new Date()) {
                throw new Error(`Seat ${seatNumber} is currently reserved`);
            }
            return seat;
        }));
        // Create order, bookings, payment, and ticket in transaction
        let result;
        try {
            result = await prisma.$transaction(async (tx) => {
                // Create order first
                const order = await tx.order.create({
                    data: { userId: customerId },
                });
                console.log("Created order:", order.id);
                // Double-check seat availability within transaction
                const seatsToBook = await Promise.all(data.seatNumbers.map(async (seatNumber) => {
                    const seat = seatValidations.find((s) => s.seatNumber === seatNumber);
                    if (!seat) {
                        throw new Error(`Seat ${seatNumber} validation failed`);
                    }
                    const currentSeat = await tx.seat.findUnique({
                        where: { id: seat.id },
                        include: { booking: true },
                    });
                    if (!currentSeat) {
                        throw new Error(`Seat ${seatNumber} no longer exists`);
                    }
                    if (currentSeat.isBooked || currentSeat.booking) {
                        throw new Error(`Seat ${seatNumber} is no longer available`);
                    }
                    return { seat: currentSeat, seatNumber };
                }));
                // Mark all seats as booked
                await Promise.all(seatsToBook.map(({ seat }) => tx.seat.update({
                    where: { id: seat.id },
                    data: { isBooked: true },
                })));
                // Bulk-insert all bookings in one call
                const bookingData = seatsToBook.map(({ seat, seatNumber }) => {
                    // Get passenger details for this seat
                    const passengerDetails = data.passengers?.[data.seatNumbers.indexOf(seatNumber)] || {
                        seatNumber: seatNumber,
                        passengerName: data.customerName,
                        passengerPhone: data.customerPhone,
                        passengerEmail: data.customerEmail,
                        passengerIdNumber: undefined,
                        passengerAge: undefined,
                        passengerGender: undefined,
                    };
                    return {
                        userId: customerId,
                        scheduleId: data.scheduleId,
                        seatId: seat.id,
                        orderId: order.id,
                        status: "BOOKED",
                        // Individual passenger details for this seat
                        passengerName: passengerDetails.passengerName,
                        passengerPhone: passengerDetails.passengerPhone,
                        passengerEmail: passengerDetails.passengerEmail,
                        passengerId: passengerDetails.passengerIdNumber,
                    };
                });
                await tx.booking.createMany({
                    data: bookingData,
                });
                // Get the created bookings for audit logging
                const createdBookings = await tx.booking.findMany({
                    where: {
                        orderId: order.id,
                    },
                    include: {
                        seat: true,
                    },
                });
                // Log audit for each booking
                await Promise.all(createdBookings.map((booking) => logAudit({
                    action: "CREATE_BOOKING",
                    entity: "Booking",
                    entityId: booking.id,
                    after: booking,
                })));
                console.log("Created bookings:", createdBookings.length);
                // Create payment record
                const totalAmount = schedule.fare * data.seatNumbers.length;
                const paymentMethod = data.paymentMethod || "CASH";
                // Validate payment method
                const validMethods = [
                    "ESEWA",
                    "KHALTI",
                    "IPS_CONNECT",
                    "BANK",
                    "CASH",
                ];
                if (!validMethods.includes(paymentMethod.toUpperCase())) {
                    throw new Error(`Invalid payment method. Must be one of: ${validMethods.join(", ")}`);
                }
                const payment = await tx.payment.create({
                    data: {
                        userId: customerId,
                        bookingId: createdBookings[0].id, // Link to first booking
                        amount: totalAmount,
                        method: paymentMethod.toUpperCase(),
                        status: "COMPLETED", // For admin-created bookings, mark as completed
                        transactionId: `${paymentMethod.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                    },
                });
                console.log("Created payment:", payment.id);
                // Create one ticket for all seats in the order
                const ticketNumber = generateTicketNumber();
                const ticket = await tx.ticket.create({
                    data: {
                        orderId: order.id,
                        ticketNumber,
                        qrCode: "", // Will be updated after transaction
                    },
                });
                // Log audit
                await logAudit({
                    action: "ADMIN_CREATED_MULTI_SEAT_BOOKING",
                    userId: adminId,
                    entity: "ORDER",
                    entityId: order.id,
                    after: {
                        orderId: order.id,
                        customerName: data.customerName,
                        customerPhone: data.customerPhone,
                        customerEmail: data.customerEmail,
                        route: `${schedule.route.origin} → ${schedule.route.destination}`,
                        seatCount: createdBookings.length,
                        totalAmount,
                        paymentMethod,
                    },
                });
                return {
                    order,
                    bookings: createdBookings,
                    ticket,
                    payment,
                    customerEmail: data.customerEmail,
                };
            }, {
                timeout: 30000, // Increase timeout to 30 seconds
                maxWait: 35000, // Maximum time to wait for transaction
            });
        }
        catch (error) {
            console.error("Transaction error:", error);
            // Check if it's a unique constraint violation
            if (error &&
                typeof error === "object" &&
                "code" in error &&
                error.code === "P2002") {
                const prismaError = error;
                if (prismaError.meta?.target?.includes("seatId")) {
                    throw new Error("One or more seats are no longer available. Please try again with different seats.");
                }
                if (prismaError.meta?.target?.includes("scheduleId_seatNumber")) {
                    throw new Error("One or more seats are no longer available. Please try again with different seats.");
                }
            }
            // Re-throw the original error if it's not a constraint violation
            throw error;
        }
        console.log(`Successfully booked ${data.seatNumbers.length} seats for customer ${customerId}`);
        // Generate QR code for the ticket after transaction (to avoid timeout)
        const ticketData = generateOptimizedTicketData({
            ticketNumber: result.ticket.ticketNumber,
            orderId: result.order.id,
            user: {
                id: customerId,
                name: data.customerName,
                phoneNumber: data.customerPhone,
            },
            bus: {
                id: schedule.bus.id,
                name: schedule.bus.name,
                layoutType: schedule.bus.layoutType,
            },
            schedule: {
                id: schedule.id,
                departure: schedule.departure,
                isReturn: schedule.isReturn,
                fare: schedule.fare,
                route: {
                    origin: schedule.route.origin,
                    destination: schedule.route.destination,
                },
            },
            seatNumbers: data.seatNumbers,
            passengers: data.passengers?.map((p) => ({
                name: p.passengerName,
                phone: p.passengerPhone,
                email: p.passengerEmail,
                idNumber: p.passengerIdNumber,
            })),
            paidByAdmin: adminId,
            paymentMethod: (data.paymentMethod || "CASH").toUpperCase(),
            totalAmount: schedule.fare * data.seatNumbers.length,
        });
        // Generate QR code for the ticket (minimal info: ticket number, passenger name, phone)
        // Validate required fields for QR code
        if (!result.ticket.ticketNumber ||
            !data.customerName ||
            !data.customerPhone) {
            console.error("Missing required fields for QR code generation", {
                ticketNumber: result.ticket.ticketNumber,
                customerName: data.customerName,
                customerPhone: data.customerPhone,
            });
            throw new Error("Missing required fields for QR code generation. Please ensure ticket number, customer name, and phone are provided.");
        }
        // Log ticket data for debugging
        console.log("Generating QR code with:", {
            ticketNumber: result.ticket.ticketNumber,
            customerName: data.customerName,
            customerPhone: data.customerPhone,
        });
        const qrCode = await generateTicketQRCode(ticketData);
        // Update ticket with QR code
        await prisma.ticket.update({
            where: { id: result.ticket.id },
            data: { qrCode },
        });
        // Fetch the updated ticket with QR code
        const updatedTicket = await prisma.ticket.findUnique({
            where: { id: result.ticket.id },
        });
        // Send ticket email to customer (with correct QR code and phone)
        try {
            const departureDate = new Date(schedule.departure);
            await sendTicketEmail({
                customerName: data.customerName,
                customerEmail: data.customerEmail,
                customerPhone: data.customerPhone,
                ticketNumber: result.ticket.ticketNumber,
                seatNumbers: data.seatNumbers,
                departureTime: format(departureDate, "HH:mm"),
                departureDate: format(departureDate, "EEEE, MMMM d, yyyy"),
                origin: schedule.route.origin,
                destination: schedule.route.destination,
                busName: schedule.bus.name,
                totalAmount: result.payment.amount,
                paymentMethod: result.payment.method,
                qrCodeData: (updatedTicket?.qrCode || "").replace(/^data:image\/png;base64,/, ""),
            });
            console.log("Ticket email sent successfully to:", data.customerEmail);
        }
        catch (emailError) {
            console.error("Failed to send ticket email:", emailError);
            // Don't fail the booking if email fails
        }
        return result;
    }
    catch (error) {
        console.error("Error in bookSeatsForUser:", error);
        throw error;
    }
}
export async function listMyBookings(userId) {
    try {
        const bookings = await prisma.booking.findMany({
            where: { userId },
            include: {
                schedule: {
                    include: {
                        route: true,
                        bus: true,
                    },
                },
                seat: true,
                user: true,
                order: {
                    include: {
                        ticket: true,
                        bookings: true,
                    },
                },
                payment: true,
            },
            orderBy: { createdAt: "desc" },
        });
        // For each booking, add the order's ticket information
        const bookingsWithTickets = bookings.map((booking) => {
            if (booking.order?.ticket) {
                return {
                    ...booking,
                    ticket: booking.order.ticket,
                };
            }
            return booking;
        });
        return bookingsWithTickets;
    }
    catch (error) {
        console.error("Error in listMyBookings:", error);
        throw error;
    }
}
export async function listAllBookings() {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                schedule: {
                    include: {
                        route: true,
                        bus: true,
                    },
                },
                seat: true,
                user: true,
                order: {
                    include: {
                        ticket: true,
                        bookings: { include: { seat: true } },
                    },
                },
                payment: true,
            },
            orderBy: { createdAt: "desc" },
        });
        // For each booking, add the order's ticket information and all seat numbers for the order
        const bookingsWithTickets = bookings.map((booking) => {
            if (booking.order?.ticket) {
                return {
                    ...booking,
                    ticket: booking.order.ticket,
                    allSeatNumbers: booking.order.bookings
                        ? booking.order.bookings
                            .map((b) => b.seat?.seatNumber)
                            .filter(Boolean)
                        : [],
                };
            }
            return booking;
        });
        return bookingsWithTickets;
    }
    catch (error) {
        console.error("Error in listAllBookings:", error);
        throw error;
    }
}
export async function listAllBookingsWithPagination(params) {
    try {
        const { page, limit, userId, status } = params;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        if (userId) {
            where.userId = userId;
        }
        if (status) {
            where.status = status;
        }
        const [bookings, total] = await Promise.all([
            prisma.booking.findMany({
                where,
                include: {
                    schedule: {
                        include: {
                            route: true,
                            bus: true,
                        },
                    },
                    seat: true,
                    user: true,
                    order: {
                        include: {
                            ticket: true,
                            bookings: { include: { seat: true } },
                        },
                    },
                    payment: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: limit,
            }),
            prisma.booking.count({ where }),
        ]);
        // For each booking, add the order's ticket information and all seat numbers for the order
        const bookingsWithTickets = bookings.map((booking) => {
            if (booking.order?.ticket) {
                return {
                    ...booking,
                    ticket: booking.order.ticket,
                    allSeatNumbers: booking.order.bookings
                        ? booking.order.bookings
                            .map((b) => b.seat?.seatNumber)
                            .filter(Boolean)
                        : [],
                };
            }
            return booking;
        });
        return {
            bookings: bookingsWithTickets,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    catch (error) {
        console.error("Error in listAllBookingsWithPagination:", error);
        throw error;
    }
}
export async function getBookingById(bookingId) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                schedule: {
                    include: { route: true },
                },
                seat: true,
                order: {
                    include: {
                        ticket: true,
                    },
                },
            },
        });
        if (!booking) {
            return null;
        }
        // Add the order's ticket information to the booking
        if (booking.order?.ticket) {
            return {
                ...booking,
                ticket: booking.order.ticket,
            };
        }
        return booking;
    }
    catch (error) {
        console.error("Error in getBookingById:", error);
        throw error;
    }
}
export async function cancelBooking(bookingId, userId, userRole) {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                schedule: {
                    include: { route: true },
                },
                user: true,
                seat: true,
                payment: true,
                order: {
                    include: {
                        ticket: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new Error("Booking not found");
        }
        // Check permissions
        if (userRole !== "SUPERADMIN" && booking.userId !== userId) {
            throw new Error("Forbidden: You can only cancel your own bookings");
        }
        // Check if today is the same as the travel date
        const today = new Date();
        const travelDate = new Date(booking.schedule.departure);
        if (today.getFullYear() === travelDate.getFullYear() &&
            today.getMonth() === travelDate.getMonth() &&
            today.getDate() === travelDate.getDate()) {
            throw new Error("Cannot cancel on the day of travel");
        }
        // Calculate penalty (20% of fare)
        const penaltyRate = 0.2;
        const penalty = booking.schedule.fare * penaltyRate;
        const refundedAmount = booking.schedule.fare - penalty;
        // Update booking and free up seat
        const result = await prisma.$transaction(async (tx) => {
            const cancelled = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    status: "CANCELLED",
                    cancellationFee: penalty,
                    refundedAmount,
                },
            });
            // Free up the seat
            await tx.seat.update({
                where: { id: booking.seatId },
                data: { isBooked: false },
            });
            // Log audit
            await logAudit({
                action: "UPDATE_BOOKING",
                entity: "Booking",
                entityId: bookingId,
                before: { status: booking.status },
                after: cancelled,
            });
            return cancelled;
        }, {
            timeout: 10000, // 10 second timeout
        });
        // Log audit
        await logAudit({
            action: "UPDATE_BOOKING",
            entity: "Booking",
            entityId: bookingId,
            before: { status: booking.status },
            after: result,
        });
        // Send cancellation email
        try {
            const departureDate = new Date(booking.schedule.departure);
            await sendCancellationEmail({
                customerName: booking.user.name,
                customerEmail: booking.user.email,
                customerPhone: booking.user.phoneNumber || undefined,
                ticketNumber: `EB-${booking.id.toString().padStart(5, "0")}`,
                seatNumbers: [booking.seat?.seatNumber || "N/A"],
                departureTime: format(departureDate, "HH:mm"),
                departureDate: format(departureDate, "EEEE, MMMM d, yyyy"),
                origin: booking.schedule.route.origin,
                destination: booking.schedule.route.destination,
                busName: "Bus Service",
                totalAmount: booking.schedule.fare,
                refundedAmount: refundedAmount,
                cancellationFee: penalty,
                paymentMethod: booking.payment?.method || undefined,
                qrCodeData: booking.order?.ticket?.qrCode?.replace(/^data:image\/png;base64,/, "") || undefined,
                cancelledBy: "CUSTOMER",
            });
            console.log("Cancellation email sent successfully to:", booking.user.email);
        }
        catch (emailError) {
            console.error("Failed to send cancellation email:", emailError);
            // Don't fail the cancellation if email fails
        }
        return result;
    }
    catch (error) {
        console.error("Error in cancelBooking:", error);
        throw error;
    }
}
export async function resetSeatStatus(scheduleId) {
    try {
        console.log(`Resetting seat status for schedule ${scheduleId}`);
        // First, clean up any orphaned bookings
        const orphanedBookings = await prisma.booking.findMany({
            where: {
                schedule: { id: scheduleId },
                seat: { isBooked: false },
            },
        });
        if (orphanedBookings.length > 0) {
            console.log(`Found ${orphanedBookings.length} orphaned bookings, cleaning up...`);
            await prisma.booking.deleteMany({
                where: {
                    id: { in: orphanedBookings.map((b) => b.id) },
                },
            });
        }
        // Reset all seats to unbooked
        const result = await prisma.seat.updateMany({
            where: { scheduleId },
            data: { isBooked: false },
        });
        console.log(`Reset ${result.count} seats for schedule ${scheduleId}`);
        return result;
    }
    catch (error) {
        console.error("Error in resetSeatStatus:", error);
        throw error;
    }
}
export async function cleanupOrphanedBookings() {
    try {
        console.log("Cleaning up orphaned bookings...");
        // Find bookings where seat is not booked
        const orphanedBookings = await prisma.booking.findMany({
            where: {
                seat: { isBooked: false },
            },
            include: {
                seat: true,
            },
        });
        if (orphanedBookings.length > 0) {
            console.log(`Found ${orphanedBookings.length} orphaned bookings`);
            // Delete orphaned bookings
            await prisma.booking.deleteMany({
                where: {
                    id: { in: orphanedBookings.map((b) => b.id) },
                },
            });
            console.log(`Deleted ${orphanedBookings.length} orphaned bookings`);
        }
        return { cleanedCount: orphanedBookings.length };
    }
    catch (error) {
        console.error("Error in cleanupOrphanedBookings:", error);
        throw error;
    }
}
export async function updateBookingStatus(bookingId, status, reason, adminId) {
    try {
        console.log(`Updating booking ${bookingId} status to ${status} by admin ${adminId}`);
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                schedule: { include: { route: true } },
                seat: true,
            },
        });
        if (!booking) {
            throw new Error(`Booking ${bookingId} not found`);
        }
        // Update booking status
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: status },
            include: {
                user: true,
                schedule: { include: { route: true } },
                seat: true,
            },
        });
        // Log audit
        await logAudit({
            action: "UPDATE_BOOKING",
            entity: "Booking",
            entityId: bookingId,
            before: { status: booking.status },
            after: updatedBooking,
        });
        console.log(`Successfully updated booking ${bookingId} status to ${status}`);
        return updatedBooking;
    }
    catch (error) {
        console.error("Error in updateBookingStatus:", error);
        throw error;
    }
}
export async function adminCancelBooking(bookingId, reason, adminId) {
    try {
        console.log(`Admin ${adminId} cancelling booking ${bookingId}`);
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                schedule: {
                    include: { route: true },
                },
                seat: true,
                payment: true,
                order: {
                    include: {
                        ticket: true,
                    },
                },
            },
        });
        if (!booking) {
            throw new Error(`Booking #${bookingId} not found`);
        }
        // Check if booking is already cancelled
        if (booking.status === "CANCELLED") {
            throw new Error(`Booking #${bookingId} is already cancelled`);
        }
        // Update booking status and free the seat
        const result = await prisma.$transaction(async (tx) => {
            // Update booking status
            const updatedBooking = await tx.booking.update({
                where: { id: bookingId },
                data: { status: "CANCELLED" },
                include: {
                    user: true,
                    schedule: { include: { route: true } },
                    seat: true,
                    payment: true,
                },
            });
            // Free the seat
            await tx.seat.update({
                where: { id: booking.seatId },
                data: { isBooked: false },
            });
            // If there's a payment, mark it as refunded
            if (booking.payment) {
                await tx.payment.update({
                    where: { id: booking.payment.id },
                    data: {
                        status: "REFUNDED",
                    },
                });
            }
            // Log audit
            await logAudit({
                action: "UPDATE_BOOKING",
                entity: "Booking",
                entityId: bookingId,
                before: { status: booking.status },
                after: updatedBooking,
            });
            return updatedBooking;
        }, {
            timeout: 10000, // 10 second timeout
        });
        // Log audit
        await logAudit({
            action: "ADMIN_CANCELLED_BOOKING",
            userId: adminId,
            entity: "BOOKING",
            entityId: bookingId,
            before: { status: booking.status },
            after: {
                status: "CANCELLED",
                reason: reason || "No reason provided",
                customerName: booking.user.name,
                customerPhone: booking.user.phoneNumber,
                route: `${booking.schedule.route.origin} → ${booking.schedule.route.destination}`,
                seatNumber: booking.seat.seatNumber,
            },
        });
        console.log(`Successfully cancelled booking ${bookingId} by admin ${adminId}`);
        // Send cancellation email
        try {
            const departureDate = new Date(booking.schedule.departure);
            const refundAmount = booking.payment?.amount || 0;
            await sendCancellationEmail({
                customerName: booking.user.name,
                customerEmail: booking.user.email,
                customerPhone: booking.user.phoneNumber || undefined,
                ticketNumber: `EB-${booking.id.toString().padStart(5, "0")}`,
                seatNumbers: [booking.seat?.seatNumber || "N/A"],
                departureTime: format(departureDate, "HH:mm"),
                departureDate: format(departureDate, "EEEE, MMMM d, yyyy"),
                origin: booking.schedule.route.origin,
                destination: booking.schedule.route.destination,
                busName: "Bus Service",
                totalAmount: booking.payment?.amount || 0,
                refundedAmount: refundAmount,
                cancellationFee: 0,
                paymentMethod: booking.payment?.method || undefined,
                qrCodeData: booking.order?.ticket?.qrCode?.replace(/^data:image\/png;base64,/, "") || undefined,
                reason: reason,
                cancelledBy: "ADMIN",
            });
            console.log("Cancellation email sent successfully to:", booking.user.email);
        }
        catch (emailError) {
            console.error("Failed to send cancellation email:", emailError);
            // Don't fail the cancellation if email fails
        }
        return result;
    }
    catch (error) {
        console.error("Error in adminCancelBooking:", error);
        throw error;
    }
}
export async function getBookingByTicketNumber(ticketNumber) {
    try {
        // Find the ticket by ticket number
        const ticket = await prisma.ticket.findFirst({
            where: {
                ticketNumber: {
                    contains: ticketNumber,
                },
            },
            include: {
                order: {
                    include: {
                        user: true,
                        bookings: {
                            where: { deletedAt: null },
                            include: {
                                schedule: { include: { route: true, bus: true } },
                                seat: true,
                                payment: true,
                            },
                        },
                    },
                },
            },
        });
        if (!ticket || !ticket.order || !ticket.order.bookings) {
            return null;
        }
        // Return all bookings (seats) for this ticket
        return {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            qrCode: ticket.qrCode
                ? `data:image/png;base64,${ticket.qrCode}`
                : undefined,
            bookings: ticket.order.bookings.map((booking) => ({
                id: booking.id,
                createdAt: booking.createdAt,
                status: booking.status,
                seat: booking.seat
                    ? { seatNumber: booking.seat.seatNumber }
                    : undefined,
                user: ticket.order.user
                    ? {
                        id: ticket.order.user.id,
                        name: ticket.order.user.name,
                        email: ticket.order.user.email,
                        phoneNumber: ticket.order.user.phoneNumber,
                    }
                    : undefined,
                schedule: booking.schedule
                    ? {
                        id: booking.schedule.id,
                        departure: booking.schedule.departure,
                        route: booking.schedule.route
                            ? {
                                id: booking.schedule.route.id,
                                origin: booking.schedule.route.origin,
                                destination: booking.schedule.route.destination,
                            }
                            : undefined,
                        bus: booking.schedule.bus
                            ? {
                                id: booking.schedule.bus.id,
                                name: booking.schedule.bus.name,
                            }
                            : undefined,
                    }
                    : undefined,
                payment: booking.payment
                    ? {
                        id: booking.payment.id,
                        amount: booking.payment.amount,
                        method: booking.payment.method,
                        status: booking.payment.status,
                        transactionId: booking.payment.transactionId,
                    }
                    : undefined,
            })),
        };
    }
    catch (error) {
        console.error("Error in getBookingByTicketNumber:", error);
        throw error;
    }
}
export async function createMultiSeatBooking(data) {
    // Validate schedule
    const schedule = await prisma.schedule.findUnique({
        where: { id: data.scheduleId },
        include: { route: true, bus: true },
    });
    if (!schedule)
        throw new Error("Schedule not found");
    // Validate seats
    const seatRecords = await prisma.seat.findMany({
        where: {
            scheduleId: data.scheduleId,
            seatNumber: { in: data.seats.map((s) => s.seatNumber) },
        },
    });
    if (seatRecords.length !== data.seats.length) {
        throw new Error("One or more seats not found");
    }
    for (const seat of seatRecords) {
        if (seat.isBooked)
            throw new Error(`Seat ${seat.seatNumber} is already booked`);
    }
    // Transaction: create order, bookings, ticket
    return await prisma.$transaction(async (tx) => {
        // Create order
        const order = await tx.order.create({
            data: { userId: data.mainBooker.userId },
        });
        // Create bookings
        const bookings = await Promise.all(data.seats.map(async (seatObj) => {
            const seat = seatRecords.find((s) => s.seatNumber === seatObj.seatNumber);
            if (!seat)
                throw new Error(`Seat ${seatObj.seatNumber} not found`);
            // Double-check in transaction if seat is already booked
            const existingBooking = await tx.booking.findFirst({
                where: { seatId: seat.id },
            });
            if (existingBooking) {
                throw new Error(`Seat ${seatObj.seatNumber} is already booked (concurrent)`);
            }
            await tx.seat.update({
                where: { id: seat.id },
                data: { isBooked: true },
            });
            return tx.booking.create({
                data: {
                    orderId: order.id,
                    scheduleId: data.scheduleId,
                    seatId: seat.id,
                    userId: data.mainBooker.userId,
                    passengerName: seatObj.passenger.name,
                    passengerPhone: seatObj.passenger.phone,
                    passengerEmail: seatObj.passenger.email,
                    passengerId: seatObj.passenger.id,
                    status: "BOOKED",
                },
            });
        }));
        // Generate ticket
        const ticketNumber = generateTicketNumber();
        const ticketData = generateOptimizedTicketData({
            ticketNumber,
            orderId: order.id,
            user: {
                id: data.mainBooker.userId,
                name: data.mainBooker.name,
                phoneNumber: data.mainBooker.phone,
            },
            bus: {
                id: schedule.bus.id,
                name: schedule.bus.name,
                layoutType: schedule.bus.layoutType,
            },
            schedule: {
                id: schedule.id,
                departure: schedule.departure,
                isReturn: schedule.isReturn,
                fare: schedule.fare,
                route: {
                    origin: schedule.route.origin,
                    destination: schedule.route.destination,
                },
            },
            seatNumbers: bookings.map((b) => seatRecords.find((s) => s.id === b.seatId)?.seatNumber ?? ""),
            passengers: bookings.map((b) => ({
                name: b.passengerName,
                phone: b.passengerPhone,
                email: b.passengerEmail,
                idNumber: b.passengerId,
            })),
            paymentMethod: data.paymentMethod || "PENDING",
            totalAmount: schedule.fare * bookings.length,
        });
        // Generate QR code for the ticket (minimal info: ticket number, passenger name, phone)
        const qrCode = await generateTicketQRCode(ticketData);
        // Create ticket
        const ticket = await tx.ticket.create({
            data: {
                orderId: order.id,
                ticketNumber,
                qrCode,
            },
        });
        return { order, bookings, ticket, ticketNumber };
    });
}
// Add email sending for client bookings
export async function createMultiSeatBookingWithEmail(data) {
    try {
        const result = await createMultiSeatBooking(data);
        // Get user details for email
        const user = await prisma.user.findUnique({
            where: { id: data.mainBooker.userId },
        });
        if (!user) {
            throw new Error("User not found");
        }
        // Get schedule details for email
        const schedule = await prisma.schedule.findUnique({
            where: { id: data.scheduleId },
            include: { route: true, bus: true },
        });
        if (!schedule) {
            throw new Error("Schedule not found");
        }
        // Send ticket email to customer
        try {
            const departureDate = new Date(schedule.departure);
            await sendTicketEmail({
                customerName: data.mainBooker.name,
                customerEmail: data.mainBooker.email,
                customerPhone: data.mainBooker.phone,
                ticketNumber: result.ticketNumber,
                seatNumbers: data.seats.map((s) => s.seatNumber),
                departureTime: format(departureDate, "HH:mm"),
                departureDate: format(departureDate, "EEEE, MMMM d, yyyy"),
                origin: schedule.route.origin,
                destination: schedule.route.destination,
                busName: schedule.bus.name,
                totalAmount: schedule.fare * data.seats.length,
                paymentMethod: data.paymentMethod || "PENDING",
                qrCodeData: (result.ticket.qrCode || "").replace(/^data:image\/png;base64,/, ""),
            });
            console.log("Ticket email sent successfully to:", data.mainBooker.email);
        }
        catch (emailError) {
            console.error("Failed to send ticket email:", emailError);
            // Don't fail the booking if email fails
        }
        return result;
    }
    catch (error) {
        console.error("Error in createMultiSeatBookingWithEmail:", error);
        throw error;
    }
}
export async function createMultiSeatBookingForUser(adminId, data) {
    try {
        console.log("Creating multi-seat booking for user:", data);
        // Validate schedule
        const schedule = await prisma.schedule.findUnique({
            where: { id: data.scheduleId },
            include: { route: true, bus: true },
        });
        if (!schedule)
            throw new Error("Schedule not found");
        // Validate seats
        const seatRecords = await prisma.seat.findMany({
            where: {
                scheduleId: data.scheduleId,
                seatNumber: { in: data.passengers.map((p) => p.seatNumber) },
            },
        });
        if (seatRecords.length !== data.passengers.length) {
            throw new Error("One or more seats not found");
        }
        for (const seat of seatRecords) {
            if (seat.isBooked)
                throw new Error(`Seat ${seat.seatNumber} is already booked`);
        }
        // Find or create user for the booking
        let customerId;
        if (data.userId) {
            customerId = data.userId;
        }
        else {
            // Try to find existing user by phone number
            const existingUser = await prisma.user.findFirst({
                where: { phoneNumber: data.bookerPhone },
            });
            if (existingUser) {
                customerId = existingUser.id;
            }
            else {
                // Create a new user for this booking
                const newUser = await prisma.user.create({
                    data: {
                        name: data.bookerName,
                        email: data.bookerEmail || `${data.bookerPhone}@guest.ebusewa.com`,
                        phoneNumber: data.bookerPhone,
                        passwordHash: "guest_user_no_password", // Placeholder for guest users
                        role: "CLIENT",
                    },
                });
                customerId = newUser.id;
            }
        }
        // Onward trip transaction
        const onwardResult = await prisma.$transaction(async (tx) => {
            // ...existing code for onward trip (same as before)...
            // Create order
            const order = await tx.order.create({ data: { userId: customerId } });
            // Create bookings
            await Promise.all(data.passengers.map(async (passenger) => {
                const seat = seatRecords.find((s) => s.seatNumber === passenger.seatNumber);
                if (!seat)
                    throw new Error(`Seat ${passenger.seatNumber} not found`);
                await tx.seat.update({
                    where: { id: seat.id },
                    data: { isBooked: true },
                });
                return tx.booking.create({
                    data: {
                        orderId: order.id,
                        scheduleId: data.scheduleId,
                        seatId: seat.id,
                        userId: customerId,
                        passengerName: passenger.passengerName,
                        passengerPhone: passenger.passengerPhone,
                        passengerEmail: passenger.passengerEmail,
                        passengerId: passenger.passengerIdNumber,
                        status: "BOOKED",
                    },
                });
            }));
            const bookings = await tx.booking.findMany({
                where: { orderId: order.id },
                include: { seat: true, payment: true },
            });
            const totalAmount = schedule.fare * data.passengers.length;
            const paymentMethod = data.paymentMethod || "CASH";
            await tx.payment.create({
                data: {
                    userId: customerId,
                    bookingId: bookings[0].id,
                    amount: totalAmount,
                    method: paymentMethod.toUpperCase(),
                    status: "COMPLETED",
                    transactionId: `${paymentMethod.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                },
            });
            const ticketNumber = generateTicketNumber();
            const ticket = await tx.ticket.create({
                data: { orderId: order.id, ticketNumber, qrCode: "" },
            });
            await logAudit({
                action: "ADMIN_CREATED_MULTI_SEAT_BOOKING",
                userId: adminId,
                entity: "ORDER",
                entityId: order.id,
                after: {
                    orderId: order.id,
                    customerName: data.bookerName,
                    customerPhone: data.bookerPhone,
                    customerEmail: data.bookerEmail,
                    route: `${schedule.route.origin} → ${schedule.route.destination}`,
                    seatCount: bookings.length,
                    totalAmount,
                    paymentMethod,
                },
            });
            return {
                order,
                bookings,
                ticket,
                ticketNumber,
                customerEmail: data.bookerEmail,
            };
        }, { timeout: 30000, maxWait: 35000 });
        // Generate QR code and send email for onward trip
        // Generate QR code for the ticket (minimal info: ticket number, passenger name, phone)
        const onwardTicketData = generateOptimizedTicketData({
            ticketNumber: onwardResult.ticketNumber,
            orderId: onwardResult.order.id,
            user: {
                id: customerId,
                name: data.bookerName,
                phoneNumber: data.bookerPhone,
            },
            bus: {
                id: schedule.bus.id,
                name: schedule.bus.name,
                layoutType: schedule.bus.layoutType,
            },
            schedule: {
                id: schedule.id,
                departure: schedule.departure,
                isReturn: schedule.isReturn,
                fare: schedule.fare,
                route: {
                    origin: schedule.route.origin,
                    destination: schedule.route.destination,
                },
            },
            seatNumbers: data.passengers.map((p) => p.seatNumber),
            passengers: data.passengers.map((p) => ({
                name: p.passengerName,
                phone: p.passengerPhone,
                email: p.passengerEmail,
                idNumber: p.passengerIdNumber,
            })),
            paidByAdmin: adminId,
            paymentMethod: (data.paymentMethod || "CASH").toUpperCase(),
            totalAmount: schedule.fare * data.passengers.length,
        });
        const onwardQrCode = await generateTicketQRCode(onwardTicketData);
        await prisma.ticket.update({
            where: { id: onwardResult.ticket.id },
            data: { qrCode: onwardQrCode },
        });
        try {
            const departureDate = new Date(schedule.departure);
            await sendTicketEmail({
                customerName: data.bookerName,
                customerEmail: data.bookerEmail || `${data.bookerPhone}@guest.ebusewa.com`,
                customerPhone: data.bookerPhone,
                ticketNumber: onwardResult.ticketNumber,
                seatNumbers: data.passengers.map((p) => p.seatNumber),
                departureTime: format(departureDate, "HH:mm"),
                departureDate: format(departureDate, "EEEE, MMMM d, yyyy"),
                origin: schedule.route.origin,
                destination: schedule.route.destination,
                busName: schedule.bus.name,
                totalAmount: schedule.fare * data.passengers.length,
                paymentMethod: (data.paymentMethod || "CASH").toUpperCase(),
                qrCodeData: (onwardQrCode || "").replace(/^data:image\/png;base64,/, ""),
            });
        }
        catch (emailError) {
            console.error("Failed to send ticket email (onward):", emailError);
        }
        // Handle return trip if provided
        let returnResult = null;
        if (data.returnScheduleId &&
            data.returnPassengers &&
            data.returnPassengers.length > 0) {
            // Validate return schedule
            const returnSchedule = await prisma.schedule.findUnique({
                where: { id: data.returnScheduleId },
                include: { route: true, bus: true },
            });
            if (!returnSchedule)
                throw new Error("Return schedule not found");
            // Validate return seats
            const returnSeatRecords = await prisma.seat.findMany({
                where: {
                    scheduleId: data.returnScheduleId,
                    seatNumber: { in: data.returnPassengers.map((p) => p.seatNumber) },
                },
            });
            if (returnSeatRecords.length !== data.returnPassengers.length) {
                throw new Error("One or more return seats not found");
            }
            for (const seat of returnSeatRecords) {
                if (seat.isBooked)
                    throw new Error(`Return seat ${seat.seatNumber} is already booked`);
            }
            // Transaction for return trip
            returnResult = await prisma.$transaction(async (tx) => {
                const order = await tx.order.create({ data: { userId: customerId } });
                await Promise.all(data.returnPassengers.map(async (passenger) => {
                    const seat = returnSeatRecords.find((s) => s.seatNumber === passenger.seatNumber);
                    if (!seat)
                        throw new Error(`Return seat ${passenger.seatNumber} not found`);
                    await tx.seat.update({
                        where: { id: seat.id },
                        data: { isBooked: true },
                    });
                    return tx.booking.create({
                        data: {
                            orderId: order.id,
                            scheduleId: data.returnScheduleId,
                            seatId: seat.id,
                            userId: customerId,
                            passengerName: passenger.passengerName,
                            passengerPhone: passenger.passengerPhone,
                            passengerEmail: passenger.passengerEmail,
                            passengerId: passenger.passengerIdNumber,
                            status: "BOOKED",
                        },
                    });
                }));
                const bookings = await tx.booking.findMany({
                    where: { orderId: order.id },
                    include: { seat: true, payment: true },
                });
                const totalAmount = returnSchedule.fare * data.returnPassengers.length;
                const paymentMethod = data.paymentMethod || "CASH";
                await tx.payment.create({
                    data: {
                        userId: customerId,
                        bookingId: bookings[0].id,
                        amount: totalAmount,
                        method: paymentMethod.toUpperCase(),
                        status: "COMPLETED",
                        transactionId: `${paymentMethod.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                    },
                });
                const ticketNumber = generateTicketNumber();
                const ticket = await tx.ticket.create({
                    data: { orderId: order.id, ticketNumber, qrCode: "" },
                });
                await logAudit({
                    action: "ADMIN_CREATED_MULTI_SEAT_BOOKING_RETURN",
                    userId: adminId,
                    entity: "ORDER",
                    entityId: order.id,
                    after: {
                        orderId: order.id,
                        customerName: data.bookerName,
                        customerPhone: data.bookerPhone,
                        customerEmail: data.bookerEmail,
                        route: `${returnSchedule.route.origin} → ${returnSchedule.route.destination}`,
                        seatCount: bookings.length,
                        totalAmount,
                        paymentMethod,
                    },
                });
                return {
                    order,
                    bookings,
                    ticket,
                    ticketNumber,
                    customerEmail: data.bookerEmail,
                    returnSchedule,
                };
            }, { timeout: 30000, maxWait: 35000 });
            // Generate QR code and send email for return trip
            // Generate QR code for the ticket (minimal info: ticket number, passenger name, phone)
            const returnTicketData = generateOptimizedTicketData({
                ticketNumber: returnResult.ticketNumber,
                orderId: returnResult.order.id,
                user: {
                    id: customerId,
                    name: data.bookerName,
                    phoneNumber: data.bookerPhone,
                },
                bus: {
                    id: returnResult.returnSchedule.bus.id,
                    name: returnResult.returnSchedule.bus.name,
                    layoutType: returnResult.returnSchedule.bus.layoutType,
                },
                schedule: {
                    id: returnResult.returnSchedule.id,
                    departure: returnResult.returnSchedule.departure,
                    isReturn: returnResult.returnSchedule.isReturn,
                    fare: returnResult.returnSchedule.fare,
                    route: {
                        origin: returnResult.returnSchedule.route.origin,
                        destination: returnResult.returnSchedule.route.destination,
                    },
                },
                seatNumbers: data.returnPassengers.map((p) => p.seatNumber),
                passengers: data.returnPassengers.map((p) => ({
                    name: p.passengerName,
                    phone: p.passengerPhone,
                    email: p.passengerEmail,
                    idNumber: p.passengerIdNumber,
                })),
                paidByAdmin: adminId,
                paymentMethod: (data.paymentMethod || "CASH").toUpperCase(),
                totalAmount: returnResult.returnSchedule.fare * data.returnPassengers.length,
            });
            const returnQrCode = await generateTicketQRCode(returnTicketData);
            await prisma.ticket.update({
                where: { id: returnResult.ticket.id },
                data: { qrCode: returnQrCode },
            });
            try {
                const departureDate = new Date(returnResult.returnSchedule.departure);
                await sendTicketEmail({
                    customerName: data.bookerName,
                    customerEmail: data.bookerEmail || `${data.bookerPhone}@guest.ebusewa.com`,
                    customerPhone: data.bookerPhone,
                    ticketNumber: returnResult.ticketNumber,
                    seatNumbers: data.returnPassengers.map((p) => p.seatNumber),
                    departureTime: format(departureDate, "HH:mm"),
                    departureDate: format(departureDate, "EEEE, MMMM d, yyyy"),
                    origin: returnResult.returnSchedule.route.origin,
                    destination: returnResult.returnSchedule.route.destination,
                    busName: returnResult.returnSchedule.bus.name,
                    totalAmount: returnResult.returnSchedule.fare * data.returnPassengers.length,
                    paymentMethod: (data.paymentMethod || "CASH").toUpperCase(),
                    qrCodeData: (returnQrCode || "").replace(/^data:image\/png;base64,/, ""),
                });
            }
            catch (emailError) {
                console.error("Failed to send ticket email (return):", emailError);
            }
        }
        return { onward: onwardResult, return: returnResult };
    }
    catch (error) {
        console.error("Error in createMultiSeatBookingForUser:", error);
        throw error;
    }
}
export async function removeSeatFromBooking(bookingId, seatNumber, adminId) {
    // Find the booking and seat
    const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
            seat: true,
            order: {
                include: { ticket: true, bookings: { include: { seat: true } } },
            },
        },
    });
    if (!booking)
        throw new Error("Booking not found");
    if (!booking.seat || booking.seat.seatNumber !== seatNumber) {
        throw new Error("Seat not found in this booking");
    }
    const order = booking.order;
    if (!order)
        throw new Error("Order not found for this booking");
    const ticket = order.ticket;
    // Remove the booking (for that seat)
    await prisma.booking.delete({ where: { id: bookingId } });
    // Delete the payment record for this booking (if exists)
    await prisma.payment.deleteMany({ where: { bookingId } });
    // Mark the seat as unbooked
    await prisma.seat.update({
        where: { id: booking.seat.id },
        data: { isBooked: false },
    });
    // Get remaining bookings for the order
    const remainingBookings = await prisma.booking.findMany({
        where: { orderId: order.id },
        include: { seat: true },
    });
    if (remainingBookings.length === 0) {
        // Delete ticket and order if no seats remain
        if (ticket) {
            await prisma.ticket.delete({ where: { id: ticket.id } });
        }
        await prisma.order.delete({ where: { id: order.id } });
    }
    else {
        // Update ticket QR code if needed (seat list is encoded in QR)
        if (ticket) {
            // Re-generate QR code with updated seat list
            // Find schedule and user for ticket data
            const schedule = await prisma.schedule.findUnique({
                where: { id: remainingBookings[0].scheduleId },
                include: { bus: true, route: true },
            });
            const user = await prisma.user.findUnique({
                where: { id: order.userId },
            });
            if (!schedule || !user || !schedule.bus || !schedule.route) {
                // If any required data is missing, skip QR update
                await logAudit({
                    action: "TICKET_QR_UPDATE_SKIPPED",
                    entity: "Ticket",
                    entityId: ticket.id,
                    userId: adminId,
                    before: ticket,
                    after: null,
                });
            }
            else {
                const seatNumbers = remainingBookings.map((b) => b.seat.seatNumber);
                const fare = schedule.fare;
                const totalAmount = fare * seatNumbers.length;
                // Update the payment for the first remaining booking in the order to match new totalAmount
                if (remainingBookings.length > 0) {
                    await prisma.payment.updateMany({
                        where: { bookingId: remainingBookings[0].id },
                        data: { amount: totalAmount },
                    });
                }
                const ticketDetails = generateOptimizedTicketData({
                    ticketNumber: ticket.ticketNumber,
                    orderId: order.id,
                    user: { id: user.id, name: user.name, phoneNumber: user.phoneNumber },
                    bus: {
                        id: schedule.bus.id,
                        name: schedule.bus.name,
                        layoutType: schedule.bus.layoutType,
                    },
                    schedule: {
                        id: schedule.id,
                        departure: schedule.departure,
                        isReturn: schedule.isReturn,
                        fare: schedule.fare,
                        route: {
                            origin: schedule.route.origin,
                            destination: schedule.route.destination,
                        },
                    },
                    seatNumbers,
                    passengers: remainingBookings.map((b) => ({
                        name: b.passengerName || user.name || "",
                        phone: b.passengerPhone || user.phoneNumber || "",
                        email: b.passengerEmail || user.email || "",
                        idNumber: b.passengerId || undefined,
                    })),
                    paymentMethod: "PENDING",
                    totalAmount,
                });
                const qrCodeData = await generateTicketQRCode(ticketDetails);
                await prisma.ticket.update({
                    where: { id: ticket.id },
                    data: { qrCode: qrCodeData },
                });
            }
        }
    }
    // Optionally, log audit
    await logAudit({
        action: "REMOVE_SEAT_FROM_BOOKING",
        entity: "Booking",
        entityId: bookingId,
        userId: adminId,
        before: booking,
        after: null,
    });
    return { bookingId, seatNumber };
}
