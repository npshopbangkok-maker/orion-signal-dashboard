# ORION Signal Dashboard - Backend Integration Requirements

## 📡 WebSocket Server Requirements

### 🎯 **WebSocket Endpoint**
```
wss://api.orion-ai.com/ws/signals
```

### 📨 **Message Types ที่ Backend ต้องส่งมา**

#### 1️⃣ **Trading Signal Message**
```json
{
  "type": "signal",
  "payload": {
    "id": "uuid-string",                    // Unique signal ID
    "status": "pending",                    // "pending" | "confirmed" | "invalidated"
    "direction": "long",                    // "long" | "short"
    "symbol": "EURUSD",                     // "EURUSD" | "GBPUSD" | "USDJPY" | "XAUUSD" | "US30" | "NAS100" | "SPX500"
    "entry_time": "2024-09-01T10:30:00.000Z",
    "entry_price": 1.0850,                 // Entry price
    "stop_loss": 1.0820,                   // Stop loss price
    "take_profits": [1.0880, 1.0920, 1.0960], // Array of TP levels
    "tp_modes": ["TP1 30%", "TP2 40%", "Runner 30%"], // TP allocation labels
    "reason": "MSS+FVG setup",             // Trading reason/setup
    "confidence": 0.85,                    // Confidence score (0-1)
    "rr_target": 2.5,                      // Risk:Reward ratio
    "killzone": "london"                   // "asia" | "london" | "ny_am" | "lunch" | "pm"
  }
}
```

#### 2️⃣ **Price Update Message**
```json
{
  "type": "price_update",
  "payload": {
    "symbol": "EURUSD",
    "price": 1.0852,
    "timestamp": "2024-09-01T10:30:15.000Z",
    "change": 0.0002,                      // Price change from previous
    "change_percent": 0.02,                // Percentage change
    "volume": 5420                         // Trading volume (optional)
  }
}
```

#### 3️⃣ **Signal Status Update**
```json
{
  "type": "signal",
  "payload": {
    "id": "existing-signal-id",
    "status": "confirmed",                  // Update status to confirmed/invalidated
    // ... other fields remain the same
  }
}
```

### 📥 **Messages ที่ Dashboard ส่งไป Backend**

#### 🔐 **Subscription Message**
```json
{
  "type": "subscribe",
  "channels": ["signals", "prices"],
  "timestamp": "2024-09-01T10:30:00.000Z"
}
```

#### 🔄 **Heartbeat/Ping (Optional)**
```json
{
  "type": "ping",
  "timestamp": "2024-09-01T10:30:00.000Z"
}
```

### ⚡ **Real-time Requirements**

1. **Signal Generation**:
   - ส่ง signal ใหม่ทันทีที่มี setup
   - Status = "pending" ในตอนแรก
   - อัพเดท status เป็น "confirmed" หรือ "invalidated" ภายใน 5 นาที

2. **Price Updates**:
   - ส่ง price updates ทุก 1-5 วินาที
   - รวม symbols: EURUSD, GBPUSD, USDJPY, XAUUSD, US30, NAS100, SPX500

3. **Connection Management**:
   - รองรับ auto-reconnection
   - ส่ง pong response สำหรับ ping
   - Graceful disconnect handling

### 🎯 **Signal Flow Example**

```javascript
// 1. ส่ง pending signal
websocket.send({
  type: "signal",
  payload: {
    id: "sig_001",
    status: "pending",
    direction: "long",
    symbol: "EURUSD",
    entry_price: 1.0850,
    stop_loss: 1.0820,
    take_profits: [1.0880, 1.0920],
    // ... other fields
  }
});

// 2. หลังจาก 2-3 นาที อัพเดท status
websocket.send({
  type: "signal",
  payload: {
    id: "sig_001",
    status: "confirmed",
    // ... same fields
  }
});

// 3. ส่ง price updates ต่อเนื่อง
websocket.send({
  type: "price_update",
  payload: {
    symbol: "EURUSD",
    price: 1.0852,
    timestamp: "2024-09-01T10:30:15.000Z",
    change: 0.0002,
    change_percent: 0.02
  }
});
```

### 🔧 **Technical Notes**

- **WebSocket Library**: ใช้ ws, Socket.IO, หรือ native WebSocket
- **Authentication**: อาจต้องมี auth token ใน connection header
- **Rate Limiting**: Dashboard รองรับ message rate สูง
- **Error Handling**: Dashboard จะ auto-reconnect หากการเชื่อมต่อขาด
- **Fallback**: หากไม่เชื่อมต่อได้ จะใช้ demo mode

### 📊 **Expected Signal Frequency**

- **Signals**: 5-20 signals ต่อวัน
- **Price Updates**: 1-5 วินาทีต่อครั้ง
- **Status Updates**: ภายใน 5 นาทีหลัง pending signal

### 🎭 **Symbol Mapping**

Frontend รองรับ symbols เหล่านี้:
- **Forex**: EURUSD, GBPUSD, USDJPY, XAUUSD
- **Indices**: US30 (Dow), NAS100 (Nasdaq), SPX500 (S&P500)

Backend สามารถส่ง symbol names ตามนี้ หรือ map จาก broker symbols

---

**Dashboard พร้อมรับข้อมูลจาก WebSocket แล้ว - ต้องการ Backend ทำตาม spec นี้เท่านั้น!** 🚀
