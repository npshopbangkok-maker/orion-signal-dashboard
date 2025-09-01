// API endpoint to receive price updates from Orion backend
module.exports = async function handler(req, res) {
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
    const priceData = req.body;
    
    // Validate required fields
    if (!priceData.symbol || !priceData.price) {
      return res.status(400).json({ 
        error: 'Missing required fields: symbol, price' 
      });
    }

    // Log received price update
    console.log('📊 Received Price Update:', {
      symbol: priceData.symbol,
      price: priceData.price,
      change: priceData.change || 0,
      volume: priceData.volume || 0,
      timestamp: priceData.timestamp || new Date().toISOString()
    });

    // TODO: Broadcast price update to connected WebSocket clients
    // TODO: Store price data in database/cache

    return res.status(200).json({
      success: true,
      message: 'Price update received',
      symbol: priceData.symbol,
      price: priceData.price,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error processing price update:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
};
