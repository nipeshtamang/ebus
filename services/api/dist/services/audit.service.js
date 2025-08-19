"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAudit = logAudit;
const db_1 = require("../config/db");
async function logAudit({ userId, action, entity, entityId, before, after, }) {
    await db_1.prisma.auditLog.create({
        data: {
            userId,
            action,
            entity,
            entityId,
            before,
            after,
        },
    });
}
