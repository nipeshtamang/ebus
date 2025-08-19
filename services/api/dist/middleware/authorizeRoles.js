"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = authorizeRoles;
function authorizeRoles(...allowed) {
    return (req, res, next) => {
        const user = req.user;
        if (!user || !allowed.includes(user.role))
            return res.status(403).json({ message: "Forbidden" });
        next();
    };
}
