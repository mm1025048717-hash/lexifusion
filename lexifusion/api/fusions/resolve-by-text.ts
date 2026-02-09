/**
 * Vercel Serverless Function: 融合解析（通过文本，用于连锁融合）
 * POST /api/fusions/resolve-by-text
 * Body: { wordA: { word, meaning, category }, wordB: { word, meaning, category } }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveFusionByText } from '../_lib/fusion';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { wordA, wordB } = req.body;

    if (!wordA?.word || !wordB?.word) {
      return res.status(400).json({
        error: 'wordA and wordB with word/meaning/category are required',
      });
    }

    const fusions = await resolveFusionByText(
      { word: wordA.word, meaning: wordA.meaning || '', category: wordA.category || 'other' },
      { word: wordB.word, meaning: wordB.meaning || '', category: wordB.category || 'other' }
    );

    return res.status(200).json({ fusion: fusions[0], fusions });
  } catch (err: any) {
    console.error('[api/fusions/resolve-by-text] Error:', err.message);
    return res.status(500).json({ error: 'Failed to resolve text fusion', message: err.message });
  }
}
