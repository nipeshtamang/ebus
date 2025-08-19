"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const process_1 = require("process");
exports.prisma = new client_1.PrismaClient({
    datasources: { db: { url: process_1.env.DATABASE_URL } },
});
