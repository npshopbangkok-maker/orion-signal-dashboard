# ORION Signal Dashboard - Production Setup

## 🚀 การเชื่อมต่อ OrionAI 24/7

### 📡 WebSocket Configuration

Dashboard จะพยายามเชื่อมต่อกับ OrionAI WebSocket ที่:
```
wss://api.orion-ai.com/ws/signals
```

### ⚙️ Auto-Reconnection System

ระบบมี **Auto-Reconnection** ที่จะ:
- พยายามเชื่อมต่อใหม่อัตโนมัติเมื่อการเชื่อมต่อขาด
- ใช้ **Exponential Backoff** (1s, 2s, 4s, 8s...)
- พยายามสูงสุด **10 ครั้ง**
- หากเชื่อมต่อไม่ได้จะ fallback ไป **Demo Mode**

### 🔄 24/7 Operation

1. **Keep Browser Tab Active**
   - เปิด dashboard ไว้ใน browser tab
   - อย่าปิด tab หรือ browser
   - ใช้ dedicated browser instance

2. **Server Deployment**
   - Deploy บน VPS/Cloud server
   - ใช้ browser automation (Puppeteer) เพื่อเปิดไว้ตลอด
   - หรือ headless browser setup

3. **Mobile Device**
   - เปิดใน mobile browser และ pin tab
   - เซต "Keep screen on" ใน browser settings

### 📊 Signal Processing

เมื่อได้รับ signal จาก OrionAI:
- แสดงบน dashboard ทันที
- เล่นเสียงแจ้งเตือน
- ส่ง Telegram notification (ถ้าตั้งค่าไว้)
- อัพเดท auto trading controls

### 🛡️ Error Handling

- **Connection Lost**: Auto-reconnect with backoff
- **Invalid Signals**: Skip and log error
- **WebSocket Errors**: Fallback to demo mode
- **Server Downtime**: Show connection status

### 📱 Monitoring

ติดตาม connection status ที่มุมขวาบน:
- 🟢 **Connected**: เชื่อมต่อ OrionAI สำเร็จ
- 🟡 **Connecting**: กำลังเชื่อมต่อ
- 🔴 **Disconnected**: เชื่อมต่อขาด (จะ auto-reconnect)

### 🔧 Environment Variables

สำหรับ Production:
```bash
VITE_SIGNAL_WS_URL=wss://api.orion-ai.com/ws/signals
VITE_AUTO_TRADING_ENABLED=true
VITE_DEMO_MODE=false
```
