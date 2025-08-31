# LINE Notify Setup Guide

## 🔔 การตั้งค่า LINE Notification สำหรับ ORION Dashboard

### 📱 **Step 1: รับ LINE Notify Token**

1. เปิด https://notify-bot.line.me/
2. กด **"Log in"** ด้วยบัญชี LINE
3. กด **"Generate token"**
4. ใส่ชื่อ service: **"ORION Trading Signals"**
5. เลือกกลุ่มที่จะส่งแจ้งเตือน (หรือ 1-on-1 chat)
6. กด **"Generate token"**
7. **Copy token** และเก็บไว้ (จะแสดงครั้งเดียว!)

### ⚙️ **Step 2: ตั้งค่าใน Dashboard**

เพิ่ม LINE token ลงใน `.env`:
```bash
VITE_LINE_TOKEN=YOUR_LINE_NOTIFY_TOKEN_HERE
```

### 📲 **Step 3: ทดสอบการแจ้งเตือน**

เมื่อมี signal ใหม่ จะได้รับ LINE message ลักษณะนี้:

```
🎯 ORION SIGNAL CONFIRMED

📊 EURUSD LONG
💰 Entry: 1.0850
🛑 SL: 1.0820 (R:R 2.5)
🎯 TP Levels:
   TP1 30%: 1.0880
   TP2 40%: 1.0920
   Runner 30%: 1.0960

💡 Setup: MSS+FVG setup (85%)
⏰ 1/9/2024 18:30:15
```

### 🎨 **การปรับแต่ง Notification**

แก้ไขได้ในไฟล์ `src/services/lineNotify.ts`:

- **เปลี่ยน emoji**: แก้ใน `formatSignalMessage()`
- **เพิ่มข้อมูล**: เพิ่ม field ใหม่ในข้อความ
- **เปลี่ยนรูปแบบ**: ปรับ format ของข้อความ

### ✅ **Features ที่รองรับ**

- 🎯 **Signal Notifications**: แจ้งเตือนเมื่อมี signal ใหม่
- 📊 **Price Alerts**: แจ้งเตือนการเปลี่ยนแปลงราคา
- 🔌 **Connection Status**: แจ้งสถานะการเชื่อมต่อ
- 🚀 **Auto Retry**: ลองส่งใหม่หากส่งไม่สำเร็จ

### 🔧 **Troubleshooting**

**ไม่ได้รับ notification:**
1. ตรวจสอบ token ใน `.env`
2. ดู console สำหรับ error messages
3. ตรวจสอบว่า LINE Notify service ยัง active อยู่

**Token หมดอายุ:**
1. Generate token ใหม่
2. อัพเดท `.env` file
3. Restart development server

### 📱 **Multiple Notifications**

สามารถตั้งค่าได้หลายช่องทาง:
- ✅ LINE Notify
- ✅ Telegram Bot
- ✅ เสียงแจ้งเตือนในเบราว์เซอร์

**ไม่พลาด signal ไปอีกแล้ว! 🎉**
