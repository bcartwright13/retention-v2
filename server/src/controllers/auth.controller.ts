import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';
import { findOrCreateByGoogle } from '../db/users';
import { asyncHandler } from '../middleware/asyncHandler';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const FIVE_MINUTES_MS = 5 * 60 * 1000;

// L6: oauth_state is only relevant to the auth subtree, so scope its path
// rather than emitting it on every request to the app.
const OAUTH_STATE_COOKIE_PATH = '/api/auth';

const googleOAuthClient = new OAuth2Client(config.googleClientId);

export const googleLogin = asyncHandler((_req: Request, res: Response): void => {
  const state = crypto.randomBytes(32).toString('hex');

  res.cookie('oauth_state', state, {
    httpOnly: true,
    secure: config.isProduction,
    // Leave as 'lax' — Google's 302 redirect back to our callback is a
    // top-level cross-site GET and 'strict' would drop the cookie.
    sameSite: 'lax',
    maxAge: FIVE_MINUTES_MS,
    path: OAUTH_STATE_COOKIE_PATH,
  });

  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state,
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

export const googleCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { code, state } = req.query;
  const storedState = req.cookies?.oauth_state;

  res.clearCookie('oauth_state', { path: OAUTH_STATE_COOKIE_PATH });

  if (!state || !storedState || state !== storedState) {
    res.status(403).json({ message: 'Invalid OAuth state', status: 403 });
    return;
  }

  if (!code || typeof code !== 'string') {
    res.status(400).json({ message: 'Missing authorization code', status: 400 });
    return;
  }

  // H2: Google's token endpoint expects application/x-www-form-urlencoded.
  // Sending JSON happens to work today but is unsupported and could be
  // rejected at any time.
  const tokenBody = new URLSearchParams({
    code,
    client_id: config.googleClientId,
    client_secret: config.googleClientSecret,
    redirect_uri: config.googleRedirectUri,
    grant_type: 'authorization_code',
  });

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: tokenBody.toString(),
  });

  const tokenData = (await tokenResponse.json()) as {
    access_token?: string;
    id_token?: string;
    error?: string;
  };
  if (!tokenResponse.ok || !tokenData.access_token || !tokenData.id_token) {
    res.status(401).json({ message: 'Failed to exchange authorization code', status: 401 });
    return;
  }

  // H2: Verify the id_token signature/issuer/audience locally. This is the
  // only piece of the response Google has actually signed; everything from
  // /userinfo is trust-on-first-use otherwise.
  let idTokenPayload;
  try {
    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: tokenData.id_token,
      audience: config.googleClientId,
    });
    idTokenPayload = ticket.getPayload();
  } catch {
    res.status(401).json({ message: 'Invalid Google id_token', status: 401 });
    return;
  }

  if (!idTokenPayload || idTokenPayload.email_verified !== true || !idTokenPayload.sub) {
    res.status(401).json({ message: 'Google account not verified', status: 401 });
    return;
  }

  // Fetch user info (display name etc.)
  const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  const userInfo = (await userInfoResponse.json()) as {
    sub: string;
    email: string;
    name: string;
  };

  if (!userInfoResponse.ok || !userInfo.sub) {
    res.status(401).json({ message: 'Failed to fetch user info', status: 401 });
    return;
  }

  // H2: Defense in depth — the access_token and id_token must describe the
  // same Google account. A mismatch implies a swapped/stolen token.
  if (userInfo.sub !== idTokenPayload.sub) {
    res.status(401).json({ message: 'Token subject mismatch', status: 401 });
    return;
  }

  // Upsert user
  const user = await findOrCreateByGoogle(userInfo.sub, userInfo.email, userInfo.name);

  // C2: Pin algorithm + tag with issuer/audience so the verifier can reject
  // tokens that weren't minted for this app.
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    config.jwtSecret,
    {
      expiresIn: '7d',
      algorithm: 'HS256',
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
    }
  );

  // Set cookie and redirect
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.isProduction,
    // H1: 'strict' — the session cookie is never needed on cross-site
    // navigations, so block it from rideing along on CSRF-style requests.
    sameSite: 'strict',
    maxAge: SEVEN_DAYS_MS,
    path: '/',
  });

  // H4: NEVER redirect to a URL derived from the request (query string,
  // referer, etc.). The destination MUST be the validated config.clientUrl
  // and nothing else — otherwise this becomes an open redirect that helps
  // phishing campaigns.
  res.redirect(config.clientUrl);
});

export const getMe = asyncHandler((req: Request, res: Response): void => {
  res.json(req.user);
});

export const logout = asyncHandler((_req: Request, res: Response): void => {
  res.clearCookie('token', { path: '/' });
  res.status(204).end();
});
