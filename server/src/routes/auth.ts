import { Router } from 'express';
import { googleLogin, googleCallback, getMe, logout } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
