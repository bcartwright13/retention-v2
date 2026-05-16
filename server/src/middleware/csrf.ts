import { Request, Response, NextFunction } from 'express';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const REQUIRED_HEADER = 'x-requested-with';
const REQUIRED_VALUE = 'fetch';

// H1: Lightweight CSRF defense — a forged form submission cannot set a
// custom header. The legitimate client sends `X-Requested-With: fetch` on
// every mutating request. The OAuth flow is GET-only, so it's unaffected.
export function csrfHeaderCheck(req: Request, res: Response, next: NextFunction): void {
  if (!MUTATING_METHODS.has(req.method)) {
    next();
    return;
  }

  const header = req.header(REQUIRED_HEADER);
  if (header !== REQUIRED_VALUE) {
    res.status(403).json({ message: 'Forbidden', status: 403 });
    return;
  }

  next();
}
