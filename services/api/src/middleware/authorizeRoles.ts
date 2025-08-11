import { Request, Response, NextFunction } from "express";

export function authorizeRoles(...allowed: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user || !allowed.includes(user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };
}
