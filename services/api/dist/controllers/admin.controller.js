import * as adminService from "../services/admin.service";
export async function revenueTrends(req, res) {
    try {
        const data = await adminService.revenueTrends();
        res.json(data);
    }
    catch (error) {
        console.error("Error in revenueTrends:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function seatUtilization(req, res) {
    try {
        const data = await adminService.seatUtilization();
        res.json(data);
    }
    catch (error) {
        console.error("Error in seatUtilization:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function cancellationStats(req, res) {
    try {
        const data = await adminService.cancellationStats();
        res.json(data);
    }
    catch (error) {
        console.error("Error in cancellationStats:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function reservationHoldAnalytics(req, res) {
    try {
        const data = await adminService.reservationHoldAnalytics();
        res.json(data);
    }
    catch (error) {
        console.error("Error in reservationHoldAnalytics:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
export async function listAuditLogs(req, res) {
    try {
        const logs = await adminService.listAuditLogs();
        res.json(logs);
    }
    catch (error) {
        console.error("Error in listAuditLogs:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Internal server error",
        });
    }
}
