import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/words?q=&category=&limit=
 * Search / list all words.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || '').trim().toLowerCase();
    const category = (req.query.category as string || '').trim();
    const limit = Math.min(parseInt(req.query.limit as string) || 500, 500);

    const where: any = {};
    if (q) {
      where.OR = [
        { word: { contains: q } },
        { meaning: { contains: q } },
      ];
    }
    if (category && category !== 'all') {
      where.category = category;
    }

    const words = await prisma.word.findMany({
      where,
      take: limit,
      orderBy: { word: 'asc' },
      select: {
        id: true,
        word: true,
        meaning: true,
        icon: true,
        category: true,
        phonetic: true,
      },
    });

    res.json({ words, total: words.length });
  } catch (err: any) {
    console.error('[words/search]', err);
    res.status(500).json({ error: 'Failed to search words' });
  }
});

/**
 * GET /api/words/categories
 * Get all distinct categories with counts.
 */
router.get('/categories', async (_req: Request, res: Response) => {
  try {
    const cats = await prisma.word.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    const categories = [
      { id: 'all', name: '全部', count: cats.reduce((s, c) => s + c._count.id, 0) },
      ...cats.map((c) => ({
        id: c.category || 'other',
        name: c.category || 'other',
        count: c._count.id,
      })),
    ];

    res.json({ categories });
  } catch (err: any) {
    console.error('[words/categories]', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

/**
 * GET /api/words/random-pair
 * Pick two random words for "random fusion".
 */
router.get('/random-pair', async (_req: Request, res: Response) => {
  try {
    const count = await prisma.word.count();
    if (count < 2) {
      res.status(400).json({ error: 'Not enough words' });
      return;
    }

    // Pick two random distinct offsets
    const idx1 = Math.floor(Math.random() * count);
    let idx2 = Math.floor(Math.random() * (count - 1));
    if (idx2 >= idx1) idx2++;

    const [wordA, wordB] = await Promise.all([
      prisma.word.findFirst({ skip: idx1, select: { id: true, word: true, meaning: true, icon: true, category: true } }),
      prisma.word.findFirst({ skip: idx2, select: { id: true, word: true, meaning: true, icon: true, category: true } }),
    ]);

    if (!wordA || !wordB) {
      res.status(500).json({ error: 'Failed to pick random words' });
      return;
    }

    res.json({ wordA, wordB });
  } catch (err: any) {
    console.error('[words/random-pair]', err);
    res.status(500).json({ error: 'Failed to get random pair' });
  }
});

export { router as wordsRouter };
