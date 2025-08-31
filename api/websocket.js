// WebSocket endpoint for Orion signals (Vercel doesn't support WebSocket)
// This is a fallback - redirect to HTTP POST
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'GET') {
    // WebSocket upgrade attempt - redirect to HTTP POST
    return res.status(200).json({
      message: 'WebSocket not supported on Vercel',
      alternative: 'Use HTTP POST to /api/signals',
      endpoint: 'https://orion-signal-dashboard.vercel.app/api/signals',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer your-token-here'
      }
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
