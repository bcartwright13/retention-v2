import dotenv from 'dotenv';

dotenv.config();

function required(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const jwtSecret = required('JWT_SECRET');

// C1: Boot-time sanity checks for the HMAC key. A weak/literal value
// (e.g. the command string `openssl rand -base64 64` checked into .env)
// makes JWTs trivially forgeable.
if (jwtSecret.length < 32) {
  throw new Error(
    'JWT_SECRET must be at least 32 characters. Generate one with `openssl rand -base64 64` and paste the OUTPUT into server/.env.'
  );
}
if (/\s/.test(jwtSecret)) {
  throw new Error(
    'JWT_SECRET must not contain whitespace. It looks like the literal command string was used instead of its output. Run `openssl rand -base64 64` and put the OUTPUT into server/.env.'
  );
}

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

// H4: Reject malformed CLIENT_URL at boot so we can't redirect to garbage.
try {
  // eslint-disable-next-line no-new
  new URL(clientUrl);
} catch {
  throw new Error(`CLIENT_URL is not a valid URL: ${clientUrl}`);
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  clientUrl,
  databaseUrl: required('DATABASE_URL'),
  jwtSecret,
  googleClientId: required('GOOGLE_CLIENT_ID'),
  googleClientSecret: required('GOOGLE_CLIENT_SECRET'),
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/auth/google/callback',
  isProduction: process.env.NODE_ENV === 'production',
  jwtIssuer: 'recall',
  jwtAudience: 'recall-web',
};
