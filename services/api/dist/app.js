"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const errorHandler_1 = require("./middleware/errorHandler");
// Import routes
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const schedule_routes_1 = __importDefault(require("./routes/schedule.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const payment_routes_1 = __importDefault(require("./routes/payment.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const fleet_routes_1 = __importDefault(require("./routes/fleet.routes"));
const superadmin_routes_1 = __importDefault(require("./routes/superadmin.routes"));
const reports_routes_1 = __importDefault(require("./routes/reports.routes"));
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Compression middleware
app.use((0, compression_1.default)());
// CORS configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:3002",
    "http://localhost:3006",
    "http://161.129.67.102:3000",
    "http://161.129.67.102:3002",
    "http://161.129.67.102:3006",
    "http://161.129.67.102:3001",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // Allow any origin in development
        if (process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Body parsing middleware with increased limits
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Request timeout middleware
app.use((req, res, next) => {
    req.setTimeout(30000, () => {
        res.status(408).json({ error: "Request timeout" });
    });
    next();
});
// Cache control middleware for static responses
app.use((req, res, next) => {
    // Cache successful GET requests for 5 minutes
    if (req.method === "GET") {
        res.set("Cache-Control", "public, max-age=300");
    }
    next();
});
// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/schedules", schedule_routes_1.default);
app.use("/api/bookings", booking_routes_1.default);
app.use("/api/payments", payment_routes_1.default);
app.use("/api/admin", admin_routes_1.default);
app.use("/api/fleet", fleet_routes_1.default);
app.use("/api/superadmin", superadmin_routes_1.default);
app.use("/api/reports", reports_routes_1.default);
// 404 handler
app.use("*", (req, res) => {
    res.status(404).json({ error: "Route not found" });
});
// Error handling middleware
app.use(errorHandler_1.errorHandler);
exports.default = app;
