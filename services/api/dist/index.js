import "dotenv/config";
import { env } from "./config/env";
import app from "./app";
import { prisma } from "./config/db";
// <- import prisma
const port = parseInt(env.PORT, 10);
// Function to test DB connection
async function testDatabaseConnection() {
    try {
        await prisma.$queryRaw `SELECT 1`; // Lightweight test query
        console.log("✅ Successfully connected to the database.");
    }
    catch (error) {
        console.error("❌ Database connection failed:", error);
    }
}
process.on("unhandledRejection", (reason, _promise) => {
    console.error("Unhandled Rejection:", reason);
});
// Run server and test DB
app.listen(port, async () => {
    console.log(`API running on port ${port}`);
    await testDatabaseConnection(); // <- call the test
});
