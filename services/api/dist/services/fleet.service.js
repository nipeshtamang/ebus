import { prisma } from "../config/db";
import { logAudit } from "./audit.service";
// Public endpoints
export async function getAllRoutes() {
    return prisma.route.findMany({
        include: {
            schedules: {
                include: {
                    bus: true,
                },
            },
        },
    });
}
export async function getRouteById(routeId) {
    return prisma.route.findUnique({
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
export async function getAllLocations() {
    const routes = await prisma.route.findMany({
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
export async function createRoute(data) {
    const route = await prisma.route.create({ data });
    await logAudit({
        action: "CREATE_ROUTE",
        entity: "Route",
        entityId: route.id,
        after: route,
    });
    return route;
}
export async function updateRoute(routeId, data) {
    const before = await prisma.route.findUnique({ where: { id: routeId } });
    const route = await prisma.route.update({ where: { id: routeId }, data });
    await logAudit({
        action: "UPDATE_ROUTE",
        entity: "Route",
        entityId: routeId,
        before,
        after: route,
    });
    return route;
}
export async function deleteRoute(routeId) {
    const before = await prisma.route.findUnique({ where: { id: routeId } });
    await prisma.route.delete({ where: { id: routeId } });
    await logAudit({
        action: "DELETE_ROUTE",
        entity: "Route",
        entityId: routeId,
        before,
    });
}
// Buses
export async function createBus(data) {
    const bus = await prisma.bus.create({ data });
    await logAudit({
        action: "CREATE_BUS",
        entity: "Bus",
        entityId: bus.id,
        after: bus,
    });
    return bus;
}
export async function updateBus(busId, data) {
    const before = await prisma.bus.findUnique({ where: { id: busId } });
    const bus = await prisma.bus.update({ where: { id: busId }, data });
    await logAudit({
        action: "UPDATE_BUS",
        entity: "Bus",
        entityId: busId,
        before,
        after: bus,
    });
    return bus;
}
export async function deleteBus(busId) {
    const before = await prisma.bus.findUnique({ where: { id: busId } });
    await prisma.bus.delete({ where: { id: busId } });
    await logAudit({
        action: "DELETE_BUS",
        entity: "Bus",
        entityId: busId,
        before,
    });
}
// Schedules
export async function createSchedule(data) {
    const schedule = await prisma.schedule.create({ data });
    await logAudit({
        action: "CREATE_SCHEDULE",
        entity: "Schedule",
        entityId: schedule.id,
        after: schedule,
    });
    return schedule;
}
export async function updateSchedule(scheduleId, data) {
    const before = await prisma.schedule.findUnique({
        where: { id: scheduleId },
    });
    const schedule = await prisma.schedule.update({
        where: { id: scheduleId },
        data,
    });
    await logAudit({
        action: "UPDATE_SCHEDULE",
        entity: "Schedule",
        entityId: scheduleId,
        before,
        after: schedule,
    });
    return schedule;
}
export async function deleteSchedule(scheduleId) {
    const before = await prisma.schedule.findUnique({
        where: { id: scheduleId },
    });
    await prisma.schedule.delete({ where: { id: scheduleId } });
    await logAudit({
        action: "DELETE_SCHEDULE",
        entity: "Schedule",
        entityId: scheduleId,
        before,
    });
}
export async function getAllBuses() {
    return prisma.bus.findMany({
        include: {
            schedules: {
                include: {
                    route: true,
                },
            },
        },
    });
}
