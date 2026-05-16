import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { findById } from '../db/users';
import { JwtPayload } from '../types';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(401).json({ message: 'Not authenticated', status: 401 });
      return;
    }

    // C2: Pin algorithm + verify issuer/audience to prevent alg=none and
    // cross-service token reuse.
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    }) as JwtPayload;
    const user = await findById(decoded.userId);

    if (!user) {
      res.status(401).json({ message: 'Not authenticated', status: 401 });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Not authenticated', status: 401 });
  }
}
