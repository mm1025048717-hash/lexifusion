/**
 * Vercel Serverless Function: 简化注册/设备认证
 * POST /api/auth/register
 * Body: { deviceId: string }
 *
 * 无数据库版本：直接生成 base64 token 返回
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
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
    const { deviceId } = req.body || {};

    if (!deviceId) {
      return res.status(400).json({ error: 'deviceId is required' });
    }

    // Generate a simple token (base64 encode deviceId + timestamp)
    const timestamp = Date.now();
    const payload = JSON.stringify({ deviceId, timestamp });
    const token = Buffer.from(payload).toString('base64');

    // Derive a stable user ID from deviceId
    const userId = `user-${Buffer.from(deviceId).toString('base64url').slice(0, 16)}`;

    return res.status(200).json({
      token,
      user: {
        id: userId,
        deviceId,
        nickname: null,
        email: null,
      },
      isNew: true,
    });
  } catch (err: any) {
    console.error('[api/auth/register] Error:', err.message);
    return res.status(500).json({ error: 'Failed to register' });
  }
}
