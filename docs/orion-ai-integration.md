# 🤖 OrionAI Integration Guide

## การเชื่อมต่อ OrionAI กับ Orion Signal Dashboard

### 🎯 **Quick Setup Command สำหรับ OrionAI**

```prompt
Proceed with 1

แปลง payload เป็นรูปแบบ exact ตามที่กำหนดและส่งไป:
- WS: wss://orion-signal-dashboard.vercel.app/api/websocket  
- HTTP: https://orion-signal-dashboard.vercel.app/api/signals
- Bearer token: orion-dashboard-2024
- แก้ฟังก์ชัน _send_signal_http และ _send_signal_ws 
- เรียก LINE notify หลังส่งสำเร็จ
- รันทดสอบ smoke test
```

**Environment Variables:**
```bash
export USE_PRODUCTION_PUSH=true
export DASHBOARD_PUSH_URL='https://orion-signal-dashboard.vercel.app/api/signals'
export DASHBOARD_PUSH_TOKEN='orion-dashboard-2024'
export DATABENTO_API_KEY='db-Lj6XHWBgrQFBBWqwUW7w9BaMYTUfN'
export DB_SYMBOL='NQ.v.0'
```

**Signal Format:**
```json
{
  "id": "signal-123",
  "symbol": "NQ",
  "direction": "long",
  "entry_price": 20125.50,
  "stop_loss": 20100.00, 
  "take_profits": [20150.00, 20175.00, 20200.00],
  "confidence": 85,
  "reason": "Bullish breakout pattern",
  "killzone": "London Open",
  "timestamp": "2024-09-02T09:15:00Z",
  "signal_type": "entry"
}
```

**Authentication:**
- Bearer Token: "orion-dashboard-2024"
- Header: Authorization: Bearer orion-dashboard-2024

**Features:**
✅ Automatic LINE notifications
✅ Real-time dashboard updates  
✅ Trade history tracking
✅ Multi-TP support
✅ WebSocket real-time feed
```

---

## 📋 **Implementation Steps**

### 1. **HTTP POST Integration (Recommended)**

```javascript
// In OrionAI project - send signal via HTTP
const sendSignalToDashboard = async (signal) => {
  try {
    const response = await fetch('https://orion-signal-dashboard.vercel.app/api/signals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer orion-dashboard-2024'
      },
      body: JSON.stringify(signal)
    });
    
    if (response.ok) {
      console.log('✅ Signal sent to dashboard successfully');
    }
  } catch (error) {
    console.error('❌ Failed to send signal:', error);
  }
};
```

### 2. **WebSocket Integration (Real-time)**

```javascript
// In OrionAI project - WebSocket connection
const ws = new WebSocket('wss://orion-signal-dashboard.vercel.app/api/websocket');

ws.on('open', () => {
  console.log('🔗 Connected to Orion Dashboard');
  
  // Send authentication
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'orion-dashboard-2024'
  }));
});

// Send signal
const sendSignal = (signal) => {
  ws.send(JSON.stringify({
    type: 'signal',
    data: signal
  }));
};
```

### 3. **Price Data Integration**

```javascript
// Send price updates to dashboard
const sendPriceUpdate = (priceData) => {
  fetch('https://orion-signal-dashboard.vercel.app/api/prices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer orion-dashboard-2024'
    },
    body: JSON.stringify({
      symbol: 'NQ',
      price: 20125.50,
      change: 45.25,
      change_percent: 0.23,
      volume: 125420,
      timestamp: new Date().toISOString()
    })
  });
};
```

---

## 🧪 **Testing Connection**

### Local Test Server
```bash
cd /path/to/orion-signal-dashboard
node local-test-server.js
```

### Test Signal
```bash
curl -X POST http://localhost:3000/api/signals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer orion-dashboard-2024" \
  -d '{
    "id": "test-001",
    "symbol": "NQ", 
    "direction": "long",
    "entry_price": 20125.50,
    "stop_loss": 20100.00,
    "take_profits": [20150.00, 20175.00, 20200.00],
    "confidence": 85,
    "reason": "Test signal",
    "killzone": "Test",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'"
  }'
```

---

## 🔧 **Available Endpoints**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/signals` | POST | Receive trading signals |
| `/api/prices` | POST | Update market prices |
| `/api/websocket` | WS | Real-time data stream |
| `/api/test-line` | POST | Test LINE notifications |
| `/health` | GET | Health check |

---

## 🚀 **Ready to Connect!**

Dashboard is live at: **https://orion-signal-dashboard.vercel.app**

สามารถทดสอบส่งสัญญาณได้เลย! ระบบจะ:
- ✅ แสดงสัญญาณบน Dashboard
- ✅ ส่งแจ้งเตือนไป LINE
- ✅ บันทึกใน Trade History
- ✅ อัพเดต Real-time
