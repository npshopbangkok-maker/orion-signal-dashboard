# ORION Backend Development - Copilot Instructions

## 🎯 Task Overview
สร้าง **WebSocket Server** สำหรับส่ง trading signals และ price updates ไปยัง ORION Signal Dashboard

## 📡 Core Requirements

### 1️⃣ **WebSocket Server Setup**
- Endpoint: `wss://api.orion-ai.com/ws/signals`
- รองรับ multiple concurrent connections
- Auto-reconnection handling
- Message rate: Real-time (1-5 second intervals for prices)

### 2️⃣ **Message Types to Implement**

#### **Trading Signal Message**
```typescript
interface SignalMessage {
  type: "signal";
  payload: {
    id: string;                    // UUID
    status: "pending" | "confirmed" | "invalidated";
    direction: "long" | "short";
    symbol: "EURUSD" | "GBPUSD" | "USDJPY" | "XAUUSD" | "US30" | "NAS100" | "SPX500";
    entry_time: string;            // ISO timestamp
    entry_price: number;
    stop_loss: number;
    take_profits: number[];        // Array of TP levels
    tp_modes: string[];           // ["TP1 30%", "TP2 40%", "Runner 30%"]
    reason: string;               // Trading setup reason
    confidence: number;           // 0-1 score
    rr_target: number;           // Risk:Reward ratio
    killzone: "asia" | "london" | "ny_am" | "lunch" | "pm";
  };
}
```

#### **Price Update Message**
```typescript
interface PriceMessage {
  type: "price_update";
  payload: {
    symbol: string;
    price: number;
    timestamp: string;            // ISO timestamp
    change: number;              // Price change
    change_percent: number;      // Percentage change
    volume?: number;             // Optional volume
  };
}
```

### 3️⃣ **Client Messages to Handle**

#### **Subscription Message**
```typescript
interface SubscriptionMessage {
  type: "subscribe";
  channels: ["signals", "prices"];
  timestamp: string;
}
```

### 4️⃣ **Implementation Flow**

1. **WebSocket Server**:
   - Listen for connections
   - Handle subscription messages
   - Broadcast signals and prices to all connected clients

2. **Signal Generation**:
   - Generate trading signals based on your AI analysis
   - Send as "pending" status initially
   - Update to "confirmed" or "invalidated" within 5 minutes

3. **Price Feed**:
   - Connect to market data provider
   - Send price updates every 1-5 seconds
   - Support symbols: EURUSD, GBPUSD, USDJPY, XAUUSD, US30, NAS100, SPX500

4. **Error Handling**:
   - Handle client disconnections gracefully
   - Implement heartbeat/ping-pong
   - Log connection events

### 5️⃣ **Technical Stack Suggestions**

#### **Node.js + Socket.IO**
```javascript
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('Dashboard connected');
  
  socket.on('subscribe', (data) => {
    socket.join('signals');
    socket.join('prices');
  });
});

// Broadcast signal
io.to('signals').emit('signal', signalData);

// Broadcast price
io.to('prices').emit('price_update', priceData);
```

#### **Python + WebSockets**
```python
import websockets
import json
import asyncio

async def handle_client(websocket, path):
    async for message in websocket:
        data = json.loads(message)
        if data['type'] == 'subscribe':
            # Add to subscribers
            subscribers.add(websocket)

async def broadcast_signal(signal_data):
    message = json.dumps({
        "type": "signal",
        "payload": signal_data
    })
    await asyncio.gather(
        *[ws.send(message) for ws in subscribers],
        return_exceptions=True
    )
```

### 6️⃣ **Data Sources Integration**

1. **Market Data**:
   - Integrate with MT4/MT5 for Forex prices
   - Use TradingView, Alpha Vantage, or Polygon for indices
   - Real-time price feeds with WebSocket or REST API

2. **Signal Generation**:
   - Connect your AI model output
   - Technical analysis indicators
   - Risk management calculations

### 7️⃣ **Testing**

Test with this WebSocket client:
```javascript
const ws = new WebSocket('wss://api.orion-ai.com/ws/signals');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['signals', 'prices'],
    timestamp: new Date().toISOString()
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data.type, data.payload);
};
```

### 8️⃣ **Deployment**

- Deploy on AWS, GCP, or DigitalOcean
- Use PM2 for Node.js process management
- SSL certificate for WSS connection
- Monitor connection count and message rates

## ✅ Success Criteria

1. Dashboard connects successfully to WebSocket
2. Receives real-time trading signals
3. Gets price updates every 1-5 seconds
4. Auto-reconnection works when connection drops
5. Signal status updates work (pending → confirmed/invalidated)

## 📞 Frontend Integration

The ORION Signal Dashboard is already built and ready to receive your WebSocket messages. Just implement the server according to this spec and it will work immediately!

Dashboard GitHub: https://github.com/npshopbangkok-maker/orion-signal-dashboard
Live Demo: https://orion-signal-dashboard.vercel.app

**Goal: Create a robust WebSocket server that feeds real-time trading signals to the dashboard 24/7** 🚀
