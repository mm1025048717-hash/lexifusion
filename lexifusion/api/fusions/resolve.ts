/**
 * Vercel Serverless Function: 融合解析（通过词 ID）
 * POST /api/fusions/resolve
 * Body: { wordAId: string, wordBId: string }
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveFusionMulti } from '../_lib/fusion';

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
    const { wordAId, wordBId } = req.body;

    if (!wordAId || !wordBId) {
      return res.status(400).json({ error: 'wordAId and wordBId are required' });
    }

    const fusions = await resolveFusionMulti(wordAId, wordBId);
    return res.status(200).json({ fusion: fusions[0], fusions });
  } catch (err: any) {
    console.error('[api/fusions/resolve] Error:', err.message);
    return res.status(500).json({ error: 'Failed to resolve fusion', message: err.message });
  }
}
