/**
 * Vercel Serverless Function: 词汇查询
 * GET /api/words?q=&category=&limit=
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { searchWords } from './_data/words';

export default function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const q = (req.query.q as string) || '';
    const category = (req.query.category as string) || '';
    const limit = Math.min(parseInt(req.query.limit as string) || 500, 500);

    const words = searchWords(q || undefined, category || undefined, limit);
    return res.status(200).json({ words });
  } catch (err: any) {
    console.error('[api/words] Error:', err.message);
    return res.status(500).json({ error: 'Failed to search words' });
  }
}
