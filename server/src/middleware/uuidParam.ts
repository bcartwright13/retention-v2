import { RequestParamHandler } from 'express';

// RFC 4122 v1–v5 UUID. Accepts any version since we use Postgres `gen_random_uuid()`
// (v4) but a stricter regex offers no real benefit.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// H5: Reject non-UUID path params with 404 before they hit the DB layer
// (where they'd otherwise produce a "invalid input syntax for type uuid" 500).
export const uuidParam: RequestParamHandler = (_req, res, next, value) => {
  if (typeof value !== 'string' || !UUID_RE.test(value)) {
    res.status(404).json({ message: 'Not found', status: 404 });
    return;
  }
  next();
};
