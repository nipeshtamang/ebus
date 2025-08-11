const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testSeatGeneration() {
  try {
    console.log("Testing seat generation...\n");

    // Test 1: Create a bus with 1/2 layout and 35 seats
    console.log("Test 1: Creating bus with 1/2 layout and 35 seats");
    const bus1 = await prisma.bus.create({
      data: {
        name: "Test Bus 1/2",
        layoutType: "1/2",
        seatCount: 35,
      },
    });
    console.log(`Created bus: ${bus1.name} (ID: ${bus1.id})`);

    // Test 2: Create a bus with 2/2 layout and 40 seats
    console.log("\nTest 2: Creating bus with 2/2 layout and 40 seats");
    const bus2 = await prisma.bus.create({
      data: {
        name: "Test Bus 2/2",
        layoutType: "2/2",
        seatCount: 40,
      },
    });
    console.log(`Created bus: ${bus2.name} (ID: ${bus2.id})`);

    // Test 3: Create a route
    console.log("\nTest 3: Creating test route");
    const route = await prisma.route.create({
      data: {
        name: "Test Route",
        origin: "Kathmandu",
        destination: "Pokhara",
      },
    });
    console.log(`Created route: ${route.name} (ID: ${route.id})`);

    // Test 4: Create schedules and check seat generation
    console.log("\nTest 4: Creating schedules and checking seat generation");

    const schedule1 = await prisma.schedule.create({
      data: {
        routeId: route.id,
        busId: bus1.id,
        departure: new Date("2024-12-25T08:00:00Z"),
        fare: 500,
        isReturn: false,
      },
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

    console.log(`Schedule 1 created (ID: ${schedule1.id})`);
    console.log(`Bus: ${schedule1.bus.name} (${schedule1.bus.layoutType})`);
    console.log(`Expected seats: ${schedule1.bus.seatCount}`);
    console.log(`Generated seats: ${schedule1.seats.length}`);
    console.log(
      "First 10 seats:",
      schedule1.seats.slice(0, 10).map((s) => s.seatNumber)
    );

    const schedule2 = await prisma.schedule.create({
      data: {
        routeId: route.id,
        busId: bus2.id,
        departure: new Date("2024-12-25T10:00:00Z"),
        fare: 600,
        isReturn: false,
      },
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

    console.log(`\nSchedule 2 created (ID: ${schedule2.id})`);
    console.log(`Bus: ${schedule2.bus.name} (${schedule2.bus.layoutType})`);
    console.log(`Expected seats: ${schedule2.bus.seatCount}`);
    console.log(`Generated seats: ${schedule2.seats.length}`);
    console.log(
      "First 10 seats:",
      schedule2.seats.slice(0, 10).map((s) => s.seatNumber)
    );

    // Test 5: Test unsupported layout
    console.log("\nTest 5: Testing unsupported layout");
    try {
      const bus3 = await prisma.bus.create({
        data: {
          name: "Test Bus Invalid",
          layoutType: "invalid",
          seatCount: 30,
        },
      });

      const schedule3 = await prisma.schedule.create({
        data: {
          routeId: route.id,
          busId: bus3.id,
          departure: new Date("2024-12-25T12:00:00Z"),
          fare: 400,
          isReturn: false,
        },
      });
    } catch (error) {
      console.log("Expected error for invalid layout:", error.message);
    }

    console.log("\n✅ Seat generation test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testSeatGeneration();
