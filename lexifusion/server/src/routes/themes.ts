import { Router, Request, Response } from 'express';
import { getAllThemes, getThemeById, getThemeFusions } from '../services/theme.service';

const router = Router();

/**
 * GET /api/themes
 * Returns all active themes with word count and fusion count.
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const themes = await getAllThemes();
    res.json({ themes });
  } catch (err: any) {
    console.error('[themes/list]', err);
    res.status(500).json({ error: 'Failed to fetch themes' });
  }
});

/**
 * GET /api/themes/:id
 * Returns a single theme with all its words.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const theme = await getThemeById(req.params.id as string);
    if (!theme) {
      res.status(404).json({ error: 'Theme not found' });
      return;
    }
    res.json({ theme });
  } catch (err: any) {
    console.error('[themes/detail]', err);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

/**
 * GET /api/themes/:id/fusions
 * Returns all fusion rules for a theme.
 */
router.get('/:id/fusions', async (req: Request, res: Response) => {
  try {
    const fusions = await getThemeFusions(req.params.id as string);
    res.json({ fusions });
  } catch (err: any) {
    console.error('[themes/fusions]', err);
    res.status(500).json({ error: 'Failed to fetch fusions' });
  }
});

export { router as themesRouter };
