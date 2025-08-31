// API endpoint for sending LINE notifications (Vercel serverless)
module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get environment variables from process.env (Vercel will handle this)
    const token = process.env.VITE_LINE_CHANNEL_ACCESS_TOKEN || 'yIGpXkU8UqmYRl0ZbI83mdOtj4kfoJjcsD6hYzH4gMX6QYHr4z/O1Zfu5Q7aRW0tKhb9mC/Tme5VhXyfKnlTbDx5Roy1RJ5BlpyPl5XVnDe2pyo3hWtxEIkb8LI1+/bMWIt+COpmsmh0vfyQTdNZzgdB04t89/1O/w1cDnyilFU=';
    
    if (!token) {
      return res.status(500).json({ error: 'LINE token not found' });
    }

    const { signal } = req.body;
    
    // Create simple broadcast message
    const message = {
      type: 'text',
      text: `🚨 ORION SIGNAL 🚨\n\n📊 ${signal?.symbol || 'TEST'}\n🎯 ${signal?.direction?.toUpperCase() || 'LONG'}\n\n💰 Entry: ${signal?.entry_price || '1.0950'}\n🛑 Stop: ${signal?.stop_loss || '1.0900'}\n\n⚡ Confidence: ${signal?.confidence || '85'}%\n🎲 R:R: ${signal?.rr_target || '3'}:1\n\n⏰ ${new Date().toLocaleString('th-TH')}`
    };

    // Send to LINE API using fetch
    const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [message]
      }),
    });

    if (response.ok) {
      console.log('✅ LINE notification sent from Vercel API');
      return res.status(200).json({ 
        success: true, 
        message: 'LINE notification sent successfully!',
        timestamp: new Date().toISOString()
      });
    } else {
      const errorText = await response.text();
      console.error('❌ LINE API error:', errorText);
      return res.status(response.status).json({ 
        error: 'LINE API failed', 
        details: errorText,
        status: response.status
      });
    }

  } catch (error) {
    console.error('💥 Vercel API error:', error);
    return res.status(500).json({ 
      error: 'Server error', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
