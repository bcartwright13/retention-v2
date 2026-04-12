import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { findOrCreateByGoogle } from '../db/users';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export function googleLogin(_req: Request, res: Response): void {
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: config.googleRedirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}

export async function googleCallback(req: Request, res: Response): Promise<void> {
  try {
    const { code } = req.query;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ message: 'Missing authorization code', status: 400 });
      return;
    }

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        redirect_uri: config.googleRedirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
    if (!tokenResponse.ok || !tokenData.access_token) {
      res.status(401).json({ message: 'Failed to exchange authorization code', status: 401 });
      return;
    }

    // Fetch user info
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const userInfo = await userInfoResponse.json() as {
      sub: string;
      email: string;
      name: string;
    };

    if (!userInfoResponse.ok || !userInfo.sub) {
      res.status(401).json({ message: 'Failed to fetch user info', status: 401 });
      return;
    }

    // Upsert user
    const user = await findOrCreateByGoogle(userInfo.sub, userInfo.email, userInfo.name);

    // Sign JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    // Set cookie and redirect
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'lax',
      maxAge: SEVEN_DAYS_MS,
      path: '/',
    });

    res.redirect(config.clientUrl);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.status(500).json({ message: 'Internal server error', status: 500 });
  }
}

export function getMe(req: Request, res: Response): void {
  res.json(req.user);
}

export function logout(_req: Request, res: Response): void {
  res.clearCookie('token', { path: '/' });
  res.status(204).end();
}
