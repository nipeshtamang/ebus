"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.regenerateSeatsForSchedule = regenerateSeatsForSchedule;
exports.findSchedules = findSchedules;
exports.findSchedulesByOriginDestination = findSchedulesByOriginDestination;
exports.findRoundTripSchedules = findRoundTripSchedules;
exports.searchSchedulesEnhanced = searchSchedulesEnhanced;
exports.getScheduleWithSeats = getScheduleWithSeats;
exports.getAllSchedules = getAllSchedules;
exports.createSchedule = createSchedule;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
exports.forceDeleteSchedule = forceDeleteSchedule;
const db_1 = require("../config/db");
const LAYOUT_CONFIGS = {
    "1/2": {
        seatsPerRow: 3, // 1 left, 2 right
        totalRows: 0, // Will be calculated based on seat count
        seatNumbering: (row, col) => {
            const rowNum = row + 1;
            if (col === 0)
                return `${rowNum}A`; // Left seat
            if (col === 1)
                return `${rowNum}B`; // Right seat 1
            if (col === 2)
                return `${rowNum}C`; // Right seat 2
            return `${rowNum}${String.fromCharCode(65 + col)}`;
        },
    },
    "2/1": {
        seatsPerRow: 3, // 2 left, 1 right
        totalRows: 0,
        seatNumbering: (row, col) => {
            const rowNum = row + 1;
            if (col === 0)
                return `${rowNum}A`; // Left seat 1
            if (col === 1)
                return `${rowNum}B`; // Left seat 2
            if (col === 2)
                return `${rowNum}C`; // Right seat
            return `${rowNum}${String.fromCharCode(65 + col)}`;
        },
    },
    "2/2": {
        seatsPerRow: 4, // 2 left, 2 right
        totalRows: 0,
        seatNumbering: (row, col) => {
            const rowNum = row + 1;
            if (col === 0)
                return `${rowNum}A`; // Left seat 1
            if (col === 1)
                return `${rowNum}B`; // Left seat 2
            if (col === 2)
                return `${rowNum}C`; // Right seat 1
            if (col === 3)
                return `${rowNum}D`; // Right seat 2
            return `${rowNum}${String.fromCharCode(65 + col)}`;
        },
    },
    "3/2": {
        seatsPerRow: 5, // 3 left, 2 right
        totalRows: 0,
        seatNumbering: (row, col) => {
            const rowNum = row + 1;
            if (col === 0)
                return `${rowNum}A`; // Left seat 1
            if (col === 1)
                return `${rowNum}B`; // Left seat 2
            if (col === 2)
                return `${rowNum}C`; // Left seat 3
            if (col === 3)
                return `${rowNum}D`; // Right seat 1
            if (col === 4)
                return `${rowNum}E`; // Right seat 2
            return `${rowNum}${String.fromCharCode(65 + col)}`;
        },
    },
    "4/2": {
        seatsPerRow: 6, // 4 left, 2 right
        totalRows: 0,
        seatNumbering: (row, col) => {
            const rowNum = row + 1;
            if (col === 0)
                return `${rowNum}A`; // Left seat 1
            if (col === 1)
                return `${rowNum}B`; // Left seat 2
            if (col === 2)
                return `${rowNum}C`; // Left seat 3
            if (col === 3)
                return `${rowNum}D`; // Left seat 4
            if (col === 4)
                return `${rowNum}E`; // Right seat 1
            if (col === 5)
                return `${rowNum}F`; // Right seat 2
            return `${rowNum}${String.fromCharCode(65 + col)}`;
        },
    },
};
// Generate seats based on bus layout and seat count
async function generateSeatsForSchedule(scheduleId, busId) {
    try {
        // Get bus details
        const bus = await db_1.prisma.bus.findUnique({
            where: { id: busId },
        });
        if (!bus) {
            throw new Error(`Bus with ID ${busId} not found`);
        }
        const layoutConfig = LAYOUT_CONFIGS[bus.layoutType];
        if (!layoutConfig) {
            throw new Error(`Unsupported layout type: ${bus.layoutType}. Supported types: ${Object.keys(LAYOUT_CONFIGS).join(", ")}`);
        }
        // Calculate rows needed
        const totalRows = Math.ceil(bus.seatCount / layoutConfig.seatsPerRow);
        // Generate seat data
        const seatsToCreate = [];
        let seatCount = 0;
        for (let row = 0; row < totalRows && seatCount < bus.seatCount; row++) {
            for (let col = 0; col < layoutConfig.seatsPerRow && seatCount < bus.seatCount; col++) {
                const seatNumber = layoutConfig.seatNumbering(row, col);
                seatsToCreate.push({
                    scheduleId,
                    seatNumber,
                    isBooked: false,
                });
                seatCount++;
            }
        }
        // Create seats in database
        if (seatsToCreate.length > 0) {
            await db_1.prisma.seat.createMany({
                data: seatsToCreate,
                skipDuplicates: true,
            });
        }
        console.log(`Generated ${seatsToCreate.length} seats for schedule ${scheduleId} with layout ${bus.layoutType}`);
        return seatsToCreate.length;
    }
    catch (error) {
        console.error("Error generating seats:", error);
        throw error;
    }
}
// Regenerate seats for an existing schedule
async function regenerateSeatsForSchedule(scheduleId) {
    try {
        // Get schedule with bus details
        const schedule = await db_1.prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: { bus: true },
        });
        if (!schedule) {
            throw new Error(`Schedule with ID ${scheduleId} not found`);
        }
        // Check if there are any bookings for this schedule
        const existingBookings = await db_1.prisma.booking.findMany({
            where: { scheduleId },
        });
        if (existingBookings.length > 0) {
            throw new Error(`Cannot regenerate seats for schedule with existing bookings. Please cancel all bookings first.`);
        }
        // Delete existing seats
        await db_1.prisma.seat.deleteMany({
            where: { scheduleId },
        });
        // Generate new seats
        const seatCount = await generateSeatsForSchedule(scheduleId, schedule.busId);
        console.log(`Regenerated ${seatCount} seats for schedule ${scheduleId}`);
        return seatCount;
    }
    catch (error) {
        console.error("Error regenerating seats:", error);
        throw error;
    }
}
async function findSchedules(filters) {
    try {
        if (!filters.departureDate)
            throw new Error("departureDate is required");
        const dayStart = new Date(filters.departureDate);
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        return await db_1.prisma.schedule.findMany({
            where: {
                departure: { gte: dayStart, lt: dayEnd },
                ...(filters.routeId && { routeId: filters.routeId }),
                ...(filters.isReturn !== undefined && { isReturn: filters.isReturn }),
            },
            include: {
                bus: true,
                route: true,
                seats: {
                    include: {
                        booking: true,
                        reservation: true,
                    },
                },
            },
        });
    }
    catch (error) {
        console.error("Error in findSchedules:", error);
        throw error;
    }
}
async function findSchedulesByOriginDestination(origin, destination, departureDate, isReturn) {
    try {
        if (!departureDate)
            throw new Error("departureDate is required");
        const dayStart = new Date(departureDate);
        const dayEnd = new Date(dayStart.getTime() + 86400000);
        return await db_1.prisma.schedule.findMany({
            where: {
                departure: { gte: dayStart, lt: dayEnd },
                route: {
                    origin: origin,
                    destination: destination,
                },
                ...(isReturn !== undefined && { isReturn }),
            },
            include: {
                bus: true,
                route: true,
                seats: {
                    include: {
                        booking: true,
                        reservation: true,
                    },
                },
            },
        });
    }
    catch (error) {
        console.error("Error in findSchedulesByOriginDestination:", error);
        throw error;
    }
}
// New function to search for round-trip schedules
async function findRoundTripSchedules(origin, destination, departureDate, returnDate) {
    try {
        if (!departureDate || !returnDate) {
            throw new Error("Both departureDate and returnDate are required for round-trip search");
        }
        // Search for outbound schedules (origin to destination) - ANY schedule type
        const outboundSchedules = await findSchedulesByOriginDestination(origin, destination, departureDate
        // Don't filter by isReturn - get all schedules for this route and date
        );
        // Search for return schedules (destination back to origin) - ANY schedule type
        const returnSchedules = await findSchedulesByOriginDestination(destination, // swap origin and destination for return
        origin, returnDate
        // Don't filter by isReturn - get all schedules for this route and date
        );
        return {
            outbound: outboundSchedules,
            return: returnSchedules,
            totalOutbound: outboundSchedules.length,
            totalReturn: returnSchedules.length,
        };
    }
    catch (error) {
        console.error("Error in findRoundTripSchedules:", error);
        throw error;
    }
}
// Enhanced search function that handles both one-way and round-trip
async function searchSchedulesEnhanced(origin, destination, departureDate, returnDate, tripType = 'oneway') {
    try {
        if (tripType === 'roundtrip' && returnDate) {
            // For round-trip, return both outbound and return schedules
            return await findRoundTripSchedules(origin, destination, departureDate, returnDate);
        }
        else {
            // For one-way, return only outbound schedules (don't filter by isReturn)
            const schedules = await findSchedulesByOriginDestination(origin, destination, departureDate
            // Don't filter by isReturn for one-way searches
            );
            return {
                outbound: schedules,
                return: [],
                totalOutbound: schedules.length,
                totalReturn: 0,
            };
        }
    }
    catch (error) {
        console.error("Error in searchSchedulesEnhanced:", error);
        throw error;
    }
}
async function getScheduleWithSeats(scheduleId) {
    try {
        return await db_1.prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                bus: true,
                route: true,
                seats: {
                    include: {
                        booking: true,
                        reservation: true,
                    },
                    orderBy: {
                        seatNumber: "asc",
                    },
                },
            },
        });
    }
    catch (error) {
        console.error("Error in getScheduleWithSeats:", error);
        throw error;
    }
}
async function getAllSchedules() {
    try {
        return await db_1.prisma.schedule.findMany({
            include: {
                bus: true,
                route: true,
                seats: {
                    include: {
                        booking: true,
                        reservation: true,
                    },
                },
            },
            orderBy: {
                departure: "desc",
            },
        });
    }
    catch (error) {
        console.error("Error in getAllSchedules:", error);
        throw error;
    }
}
async function createSchedule(data) {
    try {
        const schedule = await db_1.prisma.schedule.create({
            data: {
                routeId: data.routeId,
                busId: data.busId,
                departure: new Date(data.departure),
                isReturn: data.isReturn || false,
                fare: data.fare,
            },
            include: {
                bus: true,
                route: true,
            },
        });
        // Generate seats for the new schedule
        await generateSeatsForSchedule(schedule.id, data.busId);
        // Return the schedule with generated seats
        return await db_1.prisma.schedule.findUnique({
            where: { id: schedule.id },
            include: {
                bus: true,
                route: true,
                seats: {
                    orderBy: {
                        seatNumber: "asc",
                    },
                },
            },
        });
    }
    catch (error) {
        console.error("Error in createSchedule:", error);
        throw error;
    }
}
async function updateSchedule(scheduleId, data) {
    try {
        const updateData = {};
        if (data.routeId)
            updateData.routeId = data.routeId;
        if (data.busId)
            updateData.busId = data.busId;
        if (data.departure)
            updateData.departure = new Date(data.departure);
        if (data.isReturn !== undefined)
            updateData.isReturn = data.isReturn;
        if (data.fare)
            updateData.fare = data.fare;
        return await db_1.prisma.schedule.update({
            where: { id: scheduleId },
            data: updateData,
            include: {
                bus: true,
                route: true,
            },
        });
    }
    catch (error) {
        console.error("Error in updateSchedule:", error);
        throw error;
    }
}
async function deleteSchedule(scheduleId) {
    try {
        // Check if there are any bookings for this schedule
        const bookings = await db_1.prisma.booking.findMany({
            where: { scheduleId },
            include: {
                payment: true,
                order: {
                    include: {
                        ticket: true,
                    },
                },
                reservation: true,
            },
        });
        if (bookings.length > 0) {
            throw new Error(`Cannot delete schedule with ${bookings.length} existing bookings. Please cancel all bookings first.`);
        }
        // Check if there are any reservations for this schedule
        const reservations = await db_1.prisma.reservation.findMany({
            where: { scheduleId },
        });
        if (reservations.length > 0) {
            throw new Error(`Cannot delete schedule with ${reservations.length} existing reservations. Please cancel all reservations first.`);
        }
        // Delete all related data in a transaction
        const result = await db_1.prisma.$transaction(async (tx) => {
            // Delete all seats for this schedule
            await tx.seat.deleteMany({
                where: { scheduleId },
            });
            // Delete the schedule
            const deletedSchedule = await tx.schedule.delete({
                where: { id: scheduleId },
                include: {
                    bus: true,
                    route: true,
                },
            });
            return deletedSchedule;
        });
        console.log(`Successfully deleted schedule ${scheduleId} and all related data`);
        return result;
    }
    catch (error) {
        console.error("Error in deleteSchedule:", error);
        throw error;
    }
}
async function forceDeleteSchedule(scheduleId) {
    try {
        console.log(`Force deleting schedule ${scheduleId}...`);
        const result = await db_1.prisma.$transaction(async (tx) => {
            // Get schedule details for logging
            const schedule = await tx.schedule.findUnique({
                where: { id: scheduleId },
                include: {
                    bookings: {
                        include: {
                            order: {
                                include: {
                                    ticket: true,
                                },
                            },
                        },
                    },
                    route: true,
                    bus: true,
                },
            });
            if (!schedule) {
                throw new Error(`Schedule ${scheduleId} not found`);
            }
            // Get reservations count
            const reservationsCount = await tx.reservation.count({
                where: { scheduleId },
            });
            console.log(`Found ${schedule.bookings.length} bookings and ${reservationsCount} reservations to cancel`);
            // Get all order IDs from bookings
            const orderIds = schedule.bookings
                .map((b) => b.orderId)
                .filter((id) => id !== null);
            // Delete related tickets by orderId
            if (orderIds.length > 0) {
                await tx.ticket.deleteMany({
                    where: {
                        orderId: {
                            in: orderIds,
                        },
                    },
                });
            }
            // Note: Payments are linked to bookings, not orders directly
            // They will be deleted when bookings are deleted due to foreign key constraints
            // Delete related orders
            if (orderIds.length > 0) {
                await tx.order.deleteMany({
                    where: {
                        id: {
                            in: orderIds,
                        },
                    },
                });
            }
            // Delete related reservations
            await tx.reservation.deleteMany({
                where: {
                    scheduleId,
                },
            });
            // Delete related payments by bookingId
            await tx.payment.deleteMany({
                where: {
                    bookingId: {
                        in: schedule.bookings.map((b) => b.id),
                    },
                },
            });
            // Delete all bookings
            await tx.booking.deleteMany({
                where: {
                    scheduleId,
                },
            });
            // Delete all seats
            await tx.seat.deleteMany({
                where: {
                    scheduleId,
                },
            });
            // Finally delete the schedule
            await tx.schedule.delete({
                where: { id: scheduleId },
            });
            return {
                success: true,
                message: `Schedule ${scheduleId} and all related data deleted successfully`,
                deletedSchedule: schedule,
            };
        });
        console.log(`Successfully force deleted schedule ${scheduleId}:`, {
            success: result.success,
            message: result.message,
            deletedSchedule: result.deletedSchedule,
        });
        return result;
    }
    catch (error) {
        console.error("Error in forceDeleteSchedule:", error);
        throw error;
    }
}
