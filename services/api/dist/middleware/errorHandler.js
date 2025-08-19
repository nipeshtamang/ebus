"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, req, res, _next) {
    const status = err.status || 500;
    res.status(status).json({
        status: "error",
        message: err.message || "Internal Server Error",
        details: err.details || null,
    });
}
