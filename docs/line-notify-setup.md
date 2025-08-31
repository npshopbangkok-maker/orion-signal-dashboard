# LINE Messaging API Setup Guide

## 🤖 การตั้งค่า LINE Messaging API สำหรับ ORION Dashboard

### 📱 **Step 1: สร้าง LINE Official Account**

1. เปิด https://developers.line.biz/
2. กด **"Log in"** ด้วยบัญชี LINE Business
3. กด **"Create a new provider"** หรือเลือก provider ที่มีอยู่
4. กด **"Create a Messaging API channel"**

### ⚙️ **Step 2: ตั้งค่า Channel**

1. **Channel name**: "ORION Trading Signals"
2. **Channel description**: "Real-time trading signal notifications"
3. **Category**: Finance
4. **Subcategory**: Investment/Trading
5. กด **"Create"**

### 🔑 **Step 3: รับ Channel Access Token**

1. ไปที่ **"Messaging API"** tab
2. ใน **"Channel access token"** section
3. กด **"Issue"** เพื่อสร้าง token
4. **Copy token** และเก็บไว้อย่างปลอดภัย

### 👤 **Step 4: รับ User ID (สำหรับส่งข้อความตรง)**

**วิธีที่ 1: ใช้ LINE Official Account Manager**
1. เปิด LINE Official Account Manager
2. ไปที่ **"Chat"** → **"Chat list"**
3. ดู User ID ใน profile ของผู้ใช้

**วิธีที่ 2: ใช้ Webhook (Advanced)**
1. ตั้งค่า Webhook URL ใน channel
2. User ส่งข้อความมาหา bot
3. รับ User ID จาก webhook event

### 🔧 **Step 5: ตั้งค่าใน Dashboard**

เพิ่มการตั้งค่าลงใน `.env`:
```bash
VITE_LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
VITE_LINE_USER_ID=your_line_user_id  # Optional, for direct messages
```

**หมายเหตุ**: หากไม่ใส่ USER_ID จะส่งเป็น broadcast ไปทุกคนที่ follow bot

### 📲 **Step 6: Add Bot เป็นเพื่อน**

1. ใน LINE Developers Console
2. ไปที่ **"Messaging API"** → **"QR code"**
3. Scan QR code ด้วย LINE app
4. Add bot เป็นเพื่อน

### 🎨 **ตัวอย่าง Rich Message ที่จะได้รับ**

ข้อความจะมารูปแบบ **Flex Message** สวยงาม:

```
┌─────────────────────────┐
│ 🎯 ORION SIGNAL    CONFIRMED │
├─────────────────────────┤
│ � EURUSD         LONG │
├─────────────────────────┤
│ 💰 Entry    1.0850      │
│ 🛑 Stop Loss 1.0820     │
├─────────────────────────┤
│ 🎯 Take Profits         │
│   TP1 30%: 1.0880       │
│   TP2 40%: 1.0920       │
│   Runner 30%: 1.0960    │
├─────────────────────────┤
│ 💡 Setup: MSS+FVG       │
│ 📊 Confidence: 85%      │
│ ⚖️ R:R Ratio: 2.5:1     │
├─────────────────────────┤
│  [📊 Open Dashboard]    │
│ ⏰ 1/9/2024 18:30:15    │
└─────────────────────────┘
```

### ✨ **ข้อดีของ Messaging API เทียบกับ LINE Notify**

| Feature | LINE Notify | Messaging API |
|---------|-------------|---------------|
| **Setup** | ง่าย (1 token) | ซับซ้อน (Channel + Token) |
| **Message Format** | Text เท่านั้น | Rich/Flex Message |
| **Interactive** | ไม่ได้ | ปุ่ม, Quick Reply |
| **Branding** | LINE Notify | Official Account |
| **User Management** | ไม่ได้ | ได้ (User ID) |
| **Analytics** | พื้นฐาน | ครบถ้วน |

### 🔧 **Advanced Features**

**1. Quick Reply Buttons**
```javascript
// เพิ่ม Quick Reply สำหรับ Confirm/Ignore Signal
quickReply: {
  items: [
    {
      type: 'action',
      action: {
        type: 'postback',
        label: '✅ Confirm',
        data: `confirm_signal_${signal.id}`
      }
    },
    {
      type: 'action',
      action: {
        type: 'postback',
        label: '❌ Ignore',
        data: `ignore_signal_${signal.id}`
      }
    }
  ]
}
```

**2. Rich Menu**
- ตั้งค่า Rich Menu สำหรับเปิด Dashboard
- Shortcut ไปยังหน้า Settings
- Quick Actions

### 🚨 **ข้อควรระวัง**

1. **Rate Limiting**: มีขีดจำกัดการส่งข้อความ
2. **Message Quota**: มี quota การส่งข้อความฟรี
3. **User Consent**: User ต้อง add bot เป็นเพื่อนก่อน
4. **Webhook**: ต้องตั้งค่า HTTPS endpoint สำหรับรับ events

### ✅ **Testing**

ทดสอบการส่งข้อความ:
```bash
curl -X POST https://api.line.me/v2/bot/message/push \
-H 'Content-Type: application/json' \
-H 'Authorization: Bearer YOUR_CHANNEL_ACCESS_TOKEN' \
-d '{
  "to": "USER_ID",
  "messages": [{
    "type": "text",
    "text": "🎯 ORION Test Message!"
  }]
}'
```

**พร้อมรับ Rich Message สวยงามแล้ว! 🤖✨**
