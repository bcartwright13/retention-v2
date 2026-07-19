import path from 'path';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import authRouter from './routes/auth';
import cardRouter from './routes/cards';
import { errorHandler } from './middleware/errorHandler';
import { csrfHeaderCheck } from './middleware/csrf';
import { runMigrations } from './db/migrate';

const app = express();

// H3: Required when sitting behind a reverse proxy so express-rate-limit
// (and req.ip generally) sees the real client IP, not the proxy's.
app.set('trust proxy', 1);

// M1: helmet ships a sensible baseline of security headers
// (X-Content-Type-Options, Referrer-Policy, HSTS in prod, etc.).
// We disable its CSP because the existing handler below sets a stricter
// one tuned for this app — running both would let helmet's default win.
app.use(helmet({ contentSecurityPolicy: false }));

app.use(cors({ origin: config.clientUrl, credentials: true }));
// M2: Cap JSON body to 32KB and require valid top-level JSON. Card content
// is bounded at 10KB so 32KB is generous. `strict: true` rejects bare
// strings/numbers at the top level.
app.use(express.json({ limit: '32kb', strict: true }));
app.use(cookieParser());

// H1: CSRF header check on all mutating methods. The OAuth flow is GET-only
// (/api/auth/google redirect + /api/auth/google/callback) so it is unaffected.
app.use(csrfHeaderCheck);

app.use((_req, res, next) => {
  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "connect-src 'self'",
    "img-src 'self' data:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // M1: extend CSP — block plugin content entirely and upgrade any stray
    // http:// subresources to https:// in production.
    "object-src 'none'",
    "upgrade-insecure-requests",
  ].join('; '));
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// H3: Tight limiter on the auth surface to slow brute force / OAuth abuse.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// H3: Per-user limiter on the data API. Falls back to IP when unauthenticated
// (e.g. the response before the 401 fires).
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id ?? req.ip ?? 'anonymous',
});

app.use('/api/auth', authLimiter, authRouter);
app.use('/api/users/:userId/cards', apiLimiter, cardRouter);

// Single-origin deploy: the built client lives alongside the API behind one
// URL (see root CLAUDE.md "Deployment"). This keeps the sameSite:'strict'
// auth cookie and CSP connect-src:'self' working without a proxy/CORS layer.
if (config.isProduction) {
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      next();
      return;
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use(errorHandler);

async function main(): Promise<void> {
  await runMigrations();
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
