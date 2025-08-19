"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// This script marks bookings as COMPLETED if their schedule date/time has passed.
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function completePastBookings() {
    const now = new Date();
    // Find all bookings that are still BOOKED but their schedule has passed
    const bookings = await prisma.booking.findMany({
        where: {
            status: "BOOKED",
            schedule: {
                departure: { lt: now },
            },
        },
        include: { schedule: true },
    });
    for (const booking of bookings) {
        await prisma.booking.update({
            where: { id: booking.id },
            data: { status: "COMPLETED" },
        });
        console.log(`Booking ${booking.id} marked as COMPLETED.`);
    }
    console.log("Completed status update for past bookings.");
}
completePastBookings()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
