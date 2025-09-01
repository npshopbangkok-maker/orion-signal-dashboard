// Local test server for receiving Orion signals
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = createServer(app);
const PORT = 3333;

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
  const authHeader = req.headers.authorization;
  
  console.log('\n🚨 RECEIVED ORION SIGNAL:');
  console.log('═══════════════════════════════════');
  
  // Check auth if token is provided
  if (authHeader) {
    console.log('🔐 Authorization:', authHeader.substring(0, 20) + '...');
    if (!authHeader.startsWith('Bearer ')) {
      console.log('❌ Invalid auth format - expected Bearer token');
      return res.status(401).json({ error: 'Invalid authorization format' });
    }
  } else {
    console.log('🔓 No authorization header (OK for testing)');
  }
  
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

// Prices endpoint
app.post('/api/prices', (req, res) => {
  const priceData = req.body;
  
  console.log('\n📊 RECEIVED PRICE UPDATE:');
  console.log('═══════════════════════════════════');
  console.log('💱 Symbol:', priceData.symbol);
  console.log('💰 Price:', priceData.price);
  console.log('📈 Change:', priceData.change || 0);
  console.log('📊 Volume:', priceData.volume || 0);
  console.log('⏰ Timestamp:', priceData.timestamp);
  console.log('═══════════════════════════════════\n');
  
  // Send success response
  res.status(200).json({
    success: true,
    message: 'Price update received',
    symbol: priceData.symbol,
    timestamp: new Date().toISOString()
  });
});

// Start server
server.listen(PORT, () => {
  console.log('\n🚀 Local Orion Signal Test Server');
  console.log('═══════════════════════════════════');
  console.log(`📡 HTTP listening on: http://localhost:${PORT}`);
  console.log(`🎯 Signals endpoint: http://localhost:${PORT}/api/signals`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws/signals`);
  console.log('═══════════════════════════════════');
  console.log('Ready to receive signals from Orion backend! 📊\n');
});

// WebSocket Server
const wss = new WebSocketServer({ 
  server,
  path: '/ws/signals'
});

wss.on('connection', (ws, req) => {
  console.log('\n🔌 WebSocket client connected');
  console.log('Remote address:', req.socket.remoteAddress);
  console.log('Total connections:', wss.clients.size);
  
  ws.on('message', (data) => {
    try {
      const signal = JSON.parse(data);
      
      console.log('\n🚨 RECEIVED ORION SIGNAL (WebSocket):');
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
      console.log('� Killzone:', signal.killzone || 'N/A');
      console.log('�📊 Status:', signal.status || 'N/A');
      console.log('🧪 Dry Run:', signal.dry_run || false);
      console.log('⏰ Received:', new Date().toISOString());
      console.log('═══════════════════════════════════\n');
      
      // Send acknowledgment
      ws.send(JSON.stringify({
        success: true,
        message: 'Signal received via WebSocket',
        signal_id: signal.id,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('❌ WebSocket message parse error:', error.message);
      ws.send(JSON.stringify({
        success: false,
        error: 'Invalid JSON format',
        timestamp: new Date().toISOString()
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('🔌 WebSocket client disconnected');
    console.log('Remaining connections:', wss.clients.size);
  });
  
  ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error.message);
  });
});
