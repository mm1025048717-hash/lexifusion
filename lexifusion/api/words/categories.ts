/**
 * Vercel Serverless Function: 词汇分类列表
 * GET /api/words/categories
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getCategories } from '../_data/words';

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
    const categories = getCategories();
    return res.status(200).json({ categories });
  } catch (err: any) {
    console.error('[api/words/categories] Error:', err.message);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
}
