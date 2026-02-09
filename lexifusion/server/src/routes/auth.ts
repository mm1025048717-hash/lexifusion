import { Router, Request, Response } from 'express';
import { registerOrLogin, bindEmail } from '../services/auth.service';
import { requireAuth } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { deviceId: string }
 * Returns JWT token + user info. Creates user if not exists.
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body;
    if (!deviceId || typeof deviceId !== 'string') {
      res.status(400).json({ error: 'deviceId is required' });
      return;
    }

    const result = await registerOrLogin(deviceId.trim());
    res.json(result);
  } catch (err: any) {
    console.error('[auth/register]', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/bind-email
 * Body: { email: string }
 * Requires auth. Binds email to current user.
 */
router.post('/bind-email', requireAuth, async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({ error: 'email is required' });
      return;
    }

    const user = await bindEmail(req.user!.userId, email.trim().toLowerCase());
    res.json({ success: true, user: { id: user.id, email: user.email, nickname: user.nickname } });
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Email already in use' });
      return;
    }
    console.error('[auth/bind-email]', err);
    res.status(500).json({ error: 'Failed to bind email' });
  }
});

export { router as authRouter };
