import { Request, Response, NextFunction } from 'express';

export function authorizeUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const paramUserId = req.params.userId;
  const currentUserId = req.user?.id;

  if (!currentUserId || paramUserId !== currentUserId) {
    res.status(403).json({ message: 'Forbidden', status: 403 });
    return;
  }

  next();
}
