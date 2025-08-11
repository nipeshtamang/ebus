import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function autoCompleteBookings() {
  const now = new Date();
  // Find all bookings that are BOOKED and their schedule departure is in the past
  const bookings = await prisma.booking.findMany({
    where: {
      status: "BOOKED",
      schedule: {
        departure: {
          lt: now,
        },
      },
    },
    include: {
      schedule: true,
    },
  });

  for (const booking of bookings) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: "COMPLETED" },
    });
    console.log(`Booking ${booking.id} marked as COMPLETED.`);
  }
}

autoCompleteBookings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
