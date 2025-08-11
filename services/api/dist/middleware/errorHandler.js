export function errorHandler(err, req, res, _next) {
    const status = err.status || 500;
    res.status(status).json({
        status: "error",
        message: err.message || "Internal Server Error",
        details: err.details || null,
    });
}
