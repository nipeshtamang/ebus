import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function markCompletedBookings() {
  const now = new Date();
  const result = await prisma.booking.updateMany({
    where: {
      status: { in: ["BOOKED"] },
      schedule: {
        departure: { lt: now },
      },
    },
    data: { status: "COMPLETED" },
  });
  console.log(`Updated ${result.count} bookings to COMPLETED.`);
}
markCompletedBookings()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
