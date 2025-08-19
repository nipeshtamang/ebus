"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRoutes = getAllRoutes;
exports.getRouteById = getRouteById;
exports.getAllLocations = getAllLocations;
exports.createRoute = createRoute;
exports.updateRoute = updateRoute;
exports.deleteRoute = deleteRoute;
exports.createBus = createBus;
exports.updateBus = updateBus;
exports.deleteBus = deleteBus;
exports.createSchedule = createSchedule;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
exports.getAllBuses = getAllBuses;
const db_1 = require("../config/db");
const audit_service_1 = require("./audit.service");
// Public endpoints
async function getAllRoutes() {
    return db_1.prisma.route.findMany({
        include: {
            schedules: {
                include: {
                    bus: true,
                },
            },
        },
    });
}
async function getRouteById(routeId) {
    return db_1.prisma.route.findUnique({
        where: { id: routeId },
        include: {
            schedules: {
                include: {
                    bus: true,
                },
            },
        },
    });
}
async function getAllLocations() {
    const routes = await db_1.prisma.route.findMany({
        select: {
            origin: true,
            destination: true,
        },
    });
    // Extract unique locations
    const locations = new Set();
    routes.forEach((route) => {
        locations.add(route.origin);
        locations.add(route.destination);
    });
    return Array.from(locations).sort();
}
// Routes
async function createRoute(data) {
    const route = await db_1.prisma.route.create({ data });
    await (0, audit_service_1.logAudit)({
        action: "CREATE_ROUTE",
        entity: "Route",
        entityId: route.id,
        after: route,
    });
    return route;
}
async function updateRoute(routeId, data) {
    const before = await db_1.prisma.route.findUnique({ where: { id: routeId } });
    const route = await db_1.prisma.route.update({ where: { id: routeId }, data });
    await (0, audit_service_1.logAudit)({
        action: "UPDATE_ROUTE",
        entity: "Route",
        entityId: routeId,
        before,
        after: route,
    });
    return route;
}
async function deleteRoute(routeId) {
    const before = await db_1.prisma.route.findUnique({ where: { id: routeId } });
    await db_1.prisma.route.delete({ where: { id: routeId } });
    await (0, audit_service_1.logAudit)({
        action: "DELETE_ROUTE",
        entity: "Route",
        entityId: routeId,
        before,
    });
}
// Buses
async function createBus(data) {
    const bus = await db_1.prisma.bus.create({ data });
    await (0, audit_service_1.logAudit)({
        action: "CREATE_BUS",
        entity: "Bus",
        entityId: bus.id,
        after: bus,
    });
    return bus;
}
async function updateBus(busId, data) {
    const before = await db_1.prisma.bus.findUnique({ where: { id: busId } });
    const bus = await db_1.prisma.bus.update({ where: { id: busId }, data });
    await (0, audit_service_1.logAudit)({
        action: "UPDATE_BUS",
        entity: "Bus",
        entityId: busId,
        before,
        after: bus,
    });
    return bus;
}
async function deleteBus(busId) {
    const before = await db_1.prisma.bus.findUnique({ where: { id: busId } });
    await db_1.prisma.bus.delete({ where: { id: busId } });
    await (0, audit_service_1.logAudit)({
        action: "DELETE_BUS",
        entity: "Bus",
        entityId: busId,
        before,
    });
}
// Schedules
async function createSchedule(data) {
    const schedule = await db_1.prisma.schedule.create({ data });
    await (0, audit_service_1.logAudit)({
        action: "CREATE_SCHEDULE",
        entity: "Schedule",
        entityId: schedule.id,
        after: schedule,
    });
    return schedule;
}
async function updateSchedule(scheduleId, data) {
    const before = await db_1.prisma.schedule.findUnique({
        where: { id: scheduleId },
    });
    const schedule = await db_1.prisma.schedule.update({
        where: { id: scheduleId },
        data,
    });
    await (0, audit_service_1.logAudit)({
        action: "UPDATE_SCHEDULE",
        entity: "Schedule",
        entityId: scheduleId,
        before,
        after: schedule,
    });
    return schedule;
}
async function deleteSchedule(scheduleId) {
    const before = await db_1.prisma.schedule.findUnique({
        where: { id: scheduleId },
    });
    await db_1.prisma.schedule.delete({ where: { id: scheduleId } });
    await (0, audit_service_1.logAudit)({
        action: "DELETE_SCHEDULE",
        entity: "Schedule",
        entityId: scheduleId,
        before,
    });
}
async function getAllBuses() {
    return db_1.prisma.bus.findMany({
        include: {
            schedules: {
                include: {
                    route: true,
                },
            },
        },
    });
}
