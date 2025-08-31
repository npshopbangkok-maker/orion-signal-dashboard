// Test LINE Messaging API
import LineMessagingService from '../src/services/lineNotify.js';

// Demo signal data
const testSignal = {
  id: 'test_signal_001',
  status: 'confirmed',
  direction: 'long',
  symbol: 'EURUSD',
  entry_time: new Date().toISOString(),
  entry_price: 1.0850,
  stop_loss: 1.0820,
  take_profits: [1.0880, 1.0920, 1.0960],
  tp_modes: ['TP1 30%', 'TP2 40%', 'Runner 30%'],
  reason: 'MSS+FVG setup เทสจาก Dashboard',
  confidence: 0.85,
  rr_target: 2.5,
  killzone: 'london'
};

async function testLineNotification() {
  console.log('🧪 Testing LINE Messaging API...');
  
  // ใส่ Channel Access Token ของคุณที่นี่
  const channelAccessToken = 'YOUR_CHANNEL_ACCESS_TOKEN_HERE';
  
  // ใส่ User ID ของคุณที่นี่ (optional)
  const userId = 'YOUR_LINE_USER_ID_HERE';
  
  if (channelAccessToken === 'YOUR_CHANNEL_ACCESS_TOKEN_HERE') {
    console.log('❌ Please set your LINE Channel Access Token first!');
    console.log('📝 Get it from: https://developers.line.biz/');
    return;
  }
  
  try {
    const lineService = new LineMessagingService(channelAccessToken);
    
    console.log('📤 Sending test signal notification...');
    const result = await lineService.sendSignalNotification(testSignal, userId);
    
    if (result) {
      console.log('✅ LINE notification sent successfully!');
      console.log('📱 Check your LINE app for the rich message');
    } else {
      console.log('❌ Failed to send LINE notification');
    }
    
  } catch (error) {
    console.error('💥 Error:', error);
  }
}

// Run the test
testLineNotification();

console.log(`
🎯 Test Signal Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ${testSignal.symbol} ${testSignal.direction.toUpperCase()}
💰 Entry: ${testSignal.entry_price}
🛑 SL: ${testSignal.stop_loss}
🎯 TP1: ${testSignal.take_profits[0]}
🎯 TP2: ${testSignal.take_profits[1]}  
🎯 TP3: ${testSignal.take_profits[2]}
💡 Setup: ${testSignal.reason}
📊 Confidence: ${Math.round(testSignal.confidence * 100)}%
⚖️ R:R: ${testSignal.rr_target}:1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 To test:
1. Get Channel Access Token from LINE Developers Console
2. Replace 'YOUR_CHANNEL_ACCESS_TOKEN_HERE' in this file
3. Replace 'YOUR_LINE_USER_ID_HERE' with your User ID (optional)
4. Run: node test-line-notification.js

📱 You should receive a beautiful rich message in LINE!
`);
