import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    if (req.method === 'GET') {
      // Get timers for user
      const timers = await kv.get(`timers_${email}`);
      console.log('[API] GET timers for', email, ':', timers);
      return res.status(200).json({ timers: timers || [] });
    } else if (req.method === 'POST') {
      // Save timers for user
      const { timers } = req.body;
      console.log('[API] POST timers for', email, ':', timers);
      await kv.set(`timers_${email}`, timers);
      return res.status(200).json({ success: true });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('[API] KV Error:', error);
    return res.status(500).json({ error: 'Database error', details: error.message });
  }
}
