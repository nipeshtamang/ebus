import { prisma } from "../config/db";

export async function logAudit({
  userId,
  action,
  entity,
  entityId,
  before,
  after,
}: {
  userId?: number;
  action: string;
  entity: string;
  entityId: number;
  before?: any;
  after?: any;
}) {
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
