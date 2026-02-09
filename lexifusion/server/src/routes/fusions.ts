import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  resolveFusion,
  resolveFusionMulti,
  resolveFusionByText,
  recordDiscovery,
  getUserDiscoveries,
  toggleFavorite,
  getUserFavorites,
} from '../services/fusion.service';

const router = Router();

/**
 * POST /api/fusions/resolve
 * Body: { wordAId: string, wordBId: string }
 * Returns the fusion result (exact or creative).
 */
router.post('/resolve', async (req: Request, res: Response) => {
  try {
    const { wordAId, wordBId } = req.body;
    if (!wordAId || !wordBId) {
      res.status(400).json({ error: 'wordAId and wordBId are required' });
      return;
    }

    // Return both single (backward compat) and multi results
    const fusions = await resolveFusionMulti(wordAId, wordBId);
    res.json({ fusion: fusions[0], fusions });
  } catch (err: any) {
    console.error('[fusions/resolve]', err);
    res.status(500).json({ error: 'Failed to resolve fusion' });
  }
});

/**
 * POST /api/fusions/resolve-by-text
 * Body: { wordA: { word, meaning, category }, wordB: { word, meaning, category } }
 * For chain fusion — accepts raw word text instead of DB IDs.
 */
router.post('/resolve-by-text', async (req: Request, res: Response) => {
  try {
    const { wordA, wordB } = req.body;
    if (!wordA?.word || !wordB?.word) {
      res.status(400).json({ error: 'wordA and wordB with word/meaning/category are required' });
      return;
    }

    const fusions = await resolveFusionByText(
      { word: wordA.word, meaning: wordA.meaning || '', category: wordA.category || 'other' },
      { word: wordB.word, meaning: wordB.meaning || '', category: wordB.category || 'other' }
    );
    res.json({ fusion: fusions[0], fusions });
  } catch (err: any) {
    console.error('[fusions/resolve-by-text]', err);
    res.status(500).json({ error: 'Failed to resolve text fusion' });
  }
});

/**
 * POST /api/discoveries
 * Body: { wordAId: string, wordBId: string, fusion: FusionResultDTO }
 * Records a user's discovery. Requires auth.
 */
router.post('/discoveries', requireAuth, async (req: Request, res: Response) => {
  try {
    const { wordAId, wordBId, fusion } = req.body;
    if (!wordAId || !wordBId || !fusion) {
      res.status(400).json({ error: 'wordAId, wordBId, and fusion are required' });
      return;
    }

    const discovery = await recordDiscovery(req.user!.userId, wordAId, wordBId, fusion);
    res.json({ discovery });
  } catch (err: any) {
    console.error('[fusions/discoveries]', err);
    res.status(500).json({ error: 'Failed to record discovery' });
  }
});

/**
 * GET /api/discoveries
 * Returns all discoveries for the authenticated user.
 */
router.get('/discoveries', requireAuth, async (req: Request, res: Response) => {
  try {
    const discoveries = await getUserDiscoveries(req.user!.userId);
    res.json({ discoveries });
  } catch (err: any) {
    console.error('[fusions/discoveries/list]', err);
    res.status(500).json({ error: 'Failed to fetch discoveries' });
  }
});

/**
 * POST /api/fusions/favorites/:discoveryId
 * Toggle favorite on a discovery.
 */
router.post('/favorites/:discoveryId', requireAuth, async (req: Request, res: Response) => {
  try {
    const isFavorite = await toggleFavorite(req.user!.userId, req.params.discoveryId as string);
    res.json({ isFavorite });
  } catch (err: any) {
    console.error('[fusions/favorites/toggle]', err);
    res.status(500).json({ error: 'Failed to toggle favorite' });
  }
});

/**
 * DELETE /api/fusions/favorites/:discoveryId
 * Remove favorite.
 */
router.delete('/favorites/:discoveryId', requireAuth, async (req: Request, res: Response) => {
  try {
    await toggleFavorite(req.user!.userId, req.params.discoveryId as string);
    res.json({ isFavorite: false });
  } catch (err: any) {
    console.error('[fusions/favorites/delete]', err);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

/**
 * GET /api/fusions/favorites
 * Returns all favorites for the authenticated user.
 */
router.get('/favorites', requireAuth, async (req: Request, res: Response) => {
  try {
    const favorites = await getUserFavorites(req.user!.userId);
    res.json({ favorites });
  } catch (err: any) {
    console.error('[fusions/favorites/list]', err);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

export { router as fusionsRouter };
