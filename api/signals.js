// API endpoint to receive signals from Orion backend
export default async function handler(req, res) {
  // Enable CORS for Orion backend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const signal = req.body;
    
    // Validate required fields
    if (!signal.id || !signal.symbol || !signal.direction) {
      return res.status(400).json({ 
        error: 'Missing required fields: id, symbol, direction' 
      });
    }

    // Log received signal
    console.log('🚨 Received Orion Signal:', {
      id: signal.id,
      type: signal.signal_type || 'unknown',
      symbol: signal.symbol,
      direction: signal.direction,
      price: signal.price || signal.entry_price,
      dry_run: signal.dry_run || false,
      timestamp: new Date().toISOString()
    });

    // If not dry run, send LINE notification
    if (!signal.dry_run) {
      try {
        const token = process.env.VITE_LINE_CHANNEL_ACCESS_TOKEN || 'yIGpXkU8UqmYRl0ZbI83mdOtj4kfoJjcsD6hYzH4gMX6QYHr4z/O1Zfu5Q7aRW0tKhb9mC/Tme5VhXyfKnlTbDx5Roy1RJ5BlpyPl5XVnDe2pyo3hWtxEIkb8LI1+/bMWIt+COpmsmh0vfyQTdNZzgdB04t89/1O/w1cDnyilFU=';
        
        const lineMessage = {
          type: 'text',
          text: `🚨 ORION ${signal.signal_type?.toUpperCase() || 'SIGNAL'} 🚨\n\n📊 ${signal.symbol}\n🎯 ${signal.direction?.toUpperCase()}\n\n💰 Entry: ${signal.entry_price || signal.price || 'N/A'}\n🛑 Stop: ${signal.stop_loss || 'N/A'}\n🎲 R:R: ${signal.rr_target || 'N/A'}:1\n\n📋 ${signal.reason || 'Auto Signal'}\n⚡ Confidence: ${signal.confidence || 'N/A'}%\n🕒 ${signal.killzone || 'Unknown'}\n\n⏰ ${new Date().toLocaleString('th-TH')}`
        };

        // Send to LINE
        await fetch('https://api.line.me/v2/bot/message/broadcast', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [lineMessage]
          }),
        });

        console.log('📱 LINE notification sent for signal:', signal.id);
      } catch (lineError) {
        console.error('❌ LINE notification failed:', lineError.message);
        // Continue anyway - don't fail the signal reception
      }
    }

    // Store signal (for now just log, later can store in database)
    console.log('💾 Signal stored successfully');

    // Return success
    return res.status(200).json({ 
      success: true, 
      message: 'Signal received successfully',
      signal_id: signal.id,
      dry_run: signal.dry_run || false,
      line_sent: !signal.dry_run,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('💥 Error processing signal:', error);
    return res.status(500).json({ 
      error: 'Failed to process signal', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
