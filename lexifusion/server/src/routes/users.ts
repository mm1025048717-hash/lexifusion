import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/users/me
 * Returns current user info + stats (discovery count, favorite count).
 */
router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;

    const [user, discoveryCount, favoriteCount] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.userDiscovery.count({ where: { userId } }),
      prisma.userFavorite.count({ where: { userId } }),
    ]);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        deviceId: user.deviceId,
        email: user.email,
        nickname: user.nickname,
        createdAt: user.createdAt.toISOString(),
        lastActiveAt: user.lastActiveAt.toISOString(),
      },
      stats: {
        discoveryCount,
        favoriteCount,
      },
    });
  } catch (err: any) {
    console.error('[users/me]', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

/**
 * PATCH /api/users/me
 * Body: { nickname?: string }
 * Update current user's profile.
 */
router.patch('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { nickname } = req.body;

    const data: any = {};
    if (nickname !== undefined) data.nickname = nickname;

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    res.json({
      user: {
        id: user.id,
        deviceId: user.deviceId,
        email: user.email,
        nickname: user.nickname,
      },
    });
  } catch (err: any) {
    console.error('[users/me/update]', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export { router as usersRouter };
