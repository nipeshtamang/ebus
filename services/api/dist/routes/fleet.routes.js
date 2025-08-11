import { Router } from "express";
import { authorizeRoles } from "../middleware/authorizeRoles";
import * as fleetController from "../controllers/fleet.controller";
import { getAllBuses } from "../controllers/fleet.controller";
import { authenticateJWT } from "../middleware/authenticateJWT";
const router = Router();
// Public endpoints for getting routes and locations
router.get("/routes", fleetController.getAllRoutes);
router.get("/routes/:routeId", fleetController.getRouteById);
router.get("/locations", fleetController.getAllLocations);
// All endpoints restricted to SUPERADMIN
router.use(authenticateJWT, authorizeRoles("SUPERADMIN"));
// Routes
router.post("/routes", fleetController.createRoute);
router.patch("/routes/:routeId", fleetController.updateRoute);
router.delete("/routes/:routeId", fleetController.deleteRoute);
// Buses
router.get("/buses", getAllBuses);
router.post("/buses", fleetController.createBus);
router.patch("/buses/:busId", fleetController.updateBus);
router.delete("/buses/:busId", fleetController.deleteBus);
// Schedules
router.post("/schedules", fleetController.createSchedule);
router.patch("/schedules/:scheduleId", fleetController.updateSchedule);
router.delete("/schedules/:scheduleId", fleetController.deleteSchedule);
export default router;
