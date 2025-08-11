import { Router } from "express";
import { authenticateJWT } from "../middleware/authenticateJWT";
import { authorizeRoles } from "../middleware/authorizeRoles";
import * as reportsController from "../controllers/reports.controller";

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles("SUPERADMIN"));

router.get("/summary", reportsController.getSummaryReport);

export default router;
