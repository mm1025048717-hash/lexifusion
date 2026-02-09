/**
 * Vercel Serverless Function: 随机词对
 * GET /api/words/random-pair
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRandomPair } from '../_data/words';

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
    const pair = getRandomPair();
    return res.status(200).json({ wordA: pair.wordA, wordB: pair.wordB });
  } catch (err: any) {
    console.error('[api/words/random-pair] Error:', err.message);
    return res.status(500).json({ error: 'Failed to get random pair' });
  }
}
