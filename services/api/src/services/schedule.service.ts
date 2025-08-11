import { SearchSchedulesInput } from "@ebusewa/common";
import { prisma } from "../config/db";
import { Prisma } from "@prisma/client";

interface CreateScheduleData {
  routeId: number;
  busId: number;
  departure: string | Date;
  isReturn?: boolean;
  fare: number;
}

interface UpdateScheduleData {
  routeId?: number;
  busId?: number;
  departure?: string | Date;
  isReturn?: boolean;
  fare?: number;
}

// Seat generation based on layout patterns
interface LayoutConfig {
  seatsPerRow: number;
  totalRows: number;
  seatNumbering: (row: number, col: number) => string;
}

const LAYOUT_CONFIGS: Record<string, LayoutConfig> = {
  "1/2": {
    seatsPerRow: 3, // 1 left, 2 right
    totalRows: 0, // Will be calculated based on seat count
    seatNumbering: (row: number, col: number) => {
      const rowNum = row + 1;
      if (col === 0) return `${rowNum}A`; // Left seat
      if (col === 1) return `${rowNum}B`; // Right seat 1
      if (col === 2) return `${rowNum}C`; // Right seat 2
      return `${rowNum}${String.fromCharCode(65 + col)}`;
    },
  },
  "2/1": {
    seatsPerRow: 3, // 2 left, 1 right
    totalRows: 0,
    seatNumbering: (row: number, col: number) => {
      const rowNum = row + 1;
      if (col === 0) return `${rowNum}A`; // Left seat 1
      if (col === 1) return `${rowNum}B`; // Left seat 2
      if (col === 2) return `${rowNum}C`; // Right seat
      return `${rowNum}${String.fromCharCode(65 + col)}`;
    },
  },
  "2/2": {
    seatsPerRow: 4, // 2 left, 2 right
    totalRows: 0,
    seatNumbering: (row: number, col: number) => {
      const rowNum = row + 1;
      if (col === 0) return `${rowNum}A`; // Left seat 1
      if (col === 1) return `${rowNum}B`; // Left seat 2
      if (col === 2) return `${rowNum}C`; // Right seat 1
      if (col === 3) return `${rowNum}D`; // Right seat 2
      return `${rowNum}${String.fromCharCode(65 + col)}`;
    },
  },
  "3/2": {
    seatsPerRow: 5, // 3 left, 2 right
    totalRows: 0,
    seatNumbering: (row: number, col: number) => {
      const rowNum = row + 1;
      if (col === 0) return `${rowNum}A`; // Left seat 1
      if (col === 1) return `${rowNum}B`; // Left seat 2
      if (col === 2) return `${rowNum}C`; // Left seat 3
      if (col === 3) return `${rowNum}D`; // Right seat 1
      if (col === 4) return `${rowNum}E`; // Right seat 2
      return `${rowNum}${String.fromCharCode(65 + col)}`;
    },
  },
  "4/2": {
    seatsPerRow: 6, // 4 left, 2 right
    totalRows: 0,
    seatNumbering: (row: number, col: number) => {
      const rowNum = row + 1;
      if (col === 0) return `${rowNum}A`; // Left seat 1
      if (col === 1) return `${rowNum}B`; // Left seat 2
      if (col === 2) return `${rowNum}C`; // Left seat 3
      if (col === 3) return `${rowNum}D`; // Left seat 4
      if (col === 4) return `${rowNum}E`; // Right seat 1
      if (col === 5) return `${rowNum}F`; // Right seat 2
      return `${rowNum}${String.fromCharCode(65 + col)}`;
    },
  },
};

// Generate seats based on bus layout and seat count
async function generateSeatsForSchedule(scheduleId: number, busId: number) {
  try {
    // Get bus details
    const bus = await prisma.bus.findUnique({
      where: { id: busId },
    });

    if (!bus) {
      throw new Error(`Bus with ID ${busId} not found`);
    }

    const layoutConfig = LAYOUT_CONFIGS[bus.layoutType];
    if (!layoutConfig) {
      throw new Error(
        `Unsupported layout type: ${bus.layoutType}. Supported types: ${Object.keys(LAYOUT_CONFIGS).join(", ")}`
      );
    }

    // Calculate rows needed
    const totalRows = Math.ceil(bus.seatCount / layoutConfig.seatsPerRow);

    // Generate seat data
    const seatsToCreate = [];
    let seatCount = 0;

    for (let row = 0; row < totalRows && seatCount < bus.seatCount; row++) {
      for (
        let col = 0;
        col < layoutConfig.seatsPerRow && seatCount < bus.seatCount;
        col++
      ) {
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
      await prisma.seat.createMany({
        data: seatsToCreate,
        skipDuplicates: true,
      });
    }

    console.log(
      `Generated ${seatsToCreate.length} seats for schedule ${scheduleId} with layout ${bus.layoutType}`
    );
    return seatsToCreate.length;
  } catch (error) {
    console.error("Error generating seats:", error);
    throw error;
  }
}

// Regenerate seats for an existing schedule
export async function regenerateSeatsForSchedule(scheduleId: number) {
  try {
    // Get schedule with bus details
    const schedule = await prisma.schedule.findUnique({
      where: { id: scheduleId },
      include: { bus: true },
    });

    if (!schedule) {
      throw new Error(`Schedule with ID ${scheduleId} not found`);
    }

    // Check if there are any bookings for this schedule
    const existingBookings = await prisma.booking.findMany({
      where: { scheduleId },
    });

    if (existingBookings.length > 0) {
      throw new Error(
        `Cannot regenerate seats for schedule with existing bookings. Please cancel all bookings first.`
      );
    }

    // Delete existing seats
    await prisma.seat.deleteMany({
      where: { scheduleId },
    });

    // Generate new seats
    const seatCount = await generateSeatsForSchedule(
      scheduleId,
      schedule.busId
    );

    console.log(`Regenerated ${seatCount} seats for schedule ${scheduleId}`);
    return seatCount;
  } catch (error) {
    console.error("Error regenerating seats:", error);
    throw error;
  }
}

export async function findSchedules(filters: SearchSchedulesInput) {
  try {
    if (!filters.departureDate) throw new Error("departureDate is required");
    const dayStart = new Date(filters.departureDate);
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    return await prisma.schedule.findMany({
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
  } catch (error) {
    console.error("Error in findSchedules:", error);
    throw error;
  }
}

export async function findSchedulesByOriginDestination(
  origin: string,
  destination: string,
  departureDate: string,
  isReturn?: boolean
) {
  try {
    if (!departureDate) throw new Error("departureDate is required");
    const dayStart = new Date(departureDate);
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    return await prisma.schedule.findMany({
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
  } catch (error) {
    console.error("Error in findSchedulesByOriginDestination:", error);
    throw error;
  }
}

// New function to search for round-trip schedules
export async function findRoundTripSchedules(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate: string
) {
  try {
    if (!departureDate || !returnDate) {
      throw new Error("Both departureDate and returnDate are required for round-trip search");
    }

    // Search for outbound schedules (origin to destination) - ANY schedule type
    const outboundSchedules = await findSchedulesByOriginDestination(
      origin,
      destination,
      departureDate
      // Don't filter by isReturn - get all schedules for this route and date
    );

    // Search for return schedules (destination back to origin) - ANY schedule type
    const returnSchedules = await findSchedulesByOriginDestination(
      destination, // swap origin and destination for return
      origin,
      returnDate
      // Don't filter by isReturn - get all schedules for this route and date
    );

    return {
      outbound: outboundSchedules,
      return: returnSchedules,
      totalOutbound: outboundSchedules.length,
      totalReturn: returnSchedules.length,
    };
  } catch (error) {
    console.error("Error in findRoundTripSchedules:", error);
    throw error;
  }
}

// Enhanced search function that handles both one-way and round-trip
export async function searchSchedulesEnhanced(
  origin: string,
  destination: string,
  departureDate: string,
  returnDate?: string,
  tripType: 'oneway' | 'roundtrip' = 'oneway'
) {
  try {
    if (tripType === 'roundtrip' && returnDate) {
      // For round-trip, return both outbound and return schedules
      return await findRoundTripSchedules(origin, destination, departureDate, returnDate);
    } else {
      // For one-way, return only outbound schedules (don't filter by isReturn)
      const schedules = await findSchedulesByOriginDestination(
        origin,
        destination,
        departureDate
        // Don't filter by isReturn for one-way searches
      );
      return {
        outbound: schedules,
        return: [],
        totalOutbound: schedules.length,
        totalReturn: 0,
      };
    }
  } catch (error) {
    console.error("Error in searchSchedulesEnhanced:", error);
    throw error;
  }
}

export async function getScheduleWithSeats(scheduleId: number) {
  try {
    return await prisma.schedule.findUnique({
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
  } catch (error) {
    console.error("Error in getScheduleWithSeats:", error);
    throw error;
  }
}

export async function getAllSchedules() {
  try {
    return await prisma.schedule.findMany({
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
  } catch (error) {
    console.error("Error in getAllSchedules:", error);
    throw error;
  }
}

export async function createSchedule(data: CreateScheduleData) {
  try {
    const schedule = await prisma.schedule.create({
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
    return await prisma.schedule.findUnique({
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
  } catch (error) {
    console.error("Error in createSchedule:", error);
    throw error;
  }
}

export async function updateSchedule(
  scheduleId: number,
  data: UpdateScheduleData
) {
  try {
    const updateData: UpdateScheduleData = {};
    if (data.routeId) updateData.routeId = data.routeId;
    if (data.busId) updateData.busId = data.busId;
    if (data.departure) updateData.departure = new Date(data.departure);
    if (data.isReturn !== undefined) updateData.isReturn = data.isReturn;
    if (data.fare) updateData.fare = data.fare;

    return await prisma.schedule.update({
      where: { id: scheduleId },
      data: updateData,
      include: {
        bus: true,
        route: true,
      },
    });
  } catch (error) {
    console.error("Error in updateSchedule:", error);
    throw error;
  }
}

export async function deleteSchedule(scheduleId: number) {
  try {
    // Check if there are any bookings for this schedule
    const bookings = await prisma.booking.findMany({
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
      throw new Error(
        `Cannot delete schedule with ${bookings.length} existing bookings. Please cancel all bookings first.`
      );
    }

    // Check if there are any reservations for this schedule
    const reservations = await prisma.reservation.findMany({
      where: { scheduleId },
    });

    if (reservations.length > 0) {
      throw new Error(
        `Cannot delete schedule with ${reservations.length} existing reservations. Please cancel all reservations first.`
      );
    }

    // Delete all related data in a transaction
    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
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
      }
    );

    console.log(
      `Successfully deleted schedule ${scheduleId} and all related data`
    );
    return result;
  } catch (error) {
    console.error("Error in deleteSchedule:", error);
    throw error;
  }
}

export async function forceDeleteSchedule(scheduleId: number) {
  try {
    console.log(`Force deleting schedule ${scheduleId}...`);

    const result = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
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

        console.log(
          `Found ${schedule.bookings.length} bookings and ${reservationsCount} reservations to cancel`
        );

        // Get all order IDs from bookings
        const orderIds = schedule.bookings
          .map((b) => b.orderId)
          .filter((id): id is number => id !== null);

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
      }
    );

    console.log(`Successfully force deleted schedule ${scheduleId}:`, {
      success: result.success,
      message: result.message,
      deletedSchedule: result.deletedSchedule,
    });

    return result;
  } catch (error) {
    console.error("Error in forceDeleteSchedule:", error);
    throw error;
  }
}
