"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const env_1 = require("./config/env");
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
// <- import prisma
const port = parseInt(env_1.env.PORT, 10);
// Function to test DB connection
async function testDatabaseConnection() {
    try {
        await db_1.prisma.$queryRaw `SELECT 1`; // Lightweight test query
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
app_1.default.listen(port, '0.0.0.0', async () => {
    console.log(`API running on port ${port} and accessible from external IPs`);
    await testDatabaseConnection(); // <- call the test
});
