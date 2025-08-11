import { prisma } from "../config/db";
export async function logAudit({ userId, action, entity, entityId, before, after, }) {
    await prisma.auditLog.create({
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
