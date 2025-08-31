// Local test server for receiving Orion signals
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Signals endpoint
app.post('/api/signals', (req, res) => {
  const signal = req.body;
  
  console.log('\n🚨 RECEIVED ORION SIGNAL:');
  console.log('═══════════════════════════════════');
  console.log('📊 Signal Type:', signal.signal_type || 'unknown');
  console.log('🆔 ID:', signal.id || 'no-id');
  console.log('💱 Symbol:', signal.symbol || 'unknown');
  console.log('📈 Direction:', signal.direction || 'unknown');
  console.log('💰 Price:', signal.price || signal.entry_price || 'N/A');
  console.log('🛑 Stop Loss:', signal.stop_loss || 'N/A');
  console.log('🎯 Take Profits:', signal.take_profits || 'N/A');
  console.log('📋 Reason:', signal.reason || 'N/A');
  console.log('⚡ Confidence:', signal.confidence || 'N/A');
  console.log('🎲 R:R Target:', signal.rr_target || 'N/A');
  console.log('🕒 Killzone:', signal.killzone || 'N/A');
  console.log('📊 Status:', signal.status || 'N/A');
  console.log('🧪 Dry Run:', signal.dry_run || false);
  console.log('⏰ Received:', new Date().toISOString());
  console.log('═══════════════════════════════════\n');
  
  // Validate required fields
  if (!signal.id || !signal.symbol || !signal.direction) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['id', 'symbol', 'direction'],
      received: Object.keys(signal)
    });
  }
  
  // Send success response
  res.status(200).json({
    success: true,
    message: 'Signal received and logged',
    signal_id: signal.id,
    signal_type: signal.signal_type,
    dry_run: signal.dry_run || false,
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 Local Orion Signal Test Server');
  console.log('═══════════════════════════════════');
  console.log(`📡 Listening on: http://localhost:${PORT}`);
  console.log(`🎯 Signals endpoint: http://localhost:${PORT}/api/signals`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════');
  console.log('Ready to receive signals from Orion backend! 📊\n');
});
