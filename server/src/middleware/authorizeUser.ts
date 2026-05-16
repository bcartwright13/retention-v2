import { Request, Response, NextFunction } from 'express';

export function authorizeUser(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const paramUserId = req.params.userId;
  const currentUserId = req.user?.id;

  // M5: Return 404 instead of 403 so we don't leak the existence of other
  // users' resources to an authenticated attacker enumerating IDs.
  if (!currentUserId || paramUserId !== currentUserId) {
    res.status(404).json({ message: 'Not found', status: 404 });
    return;
  }

  next();
}
