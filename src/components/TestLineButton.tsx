import React from 'react';
import { sendLineNotification } from '../utils/signalUtils';

interface TestLineButtonProps {
  channelAccessToken?: string;
  userId?: string;
}

const TestLineButton: React.FC<TestLineButtonProps> = ({ 
  channelAccessToken, 
  userId 
}) => {
  const sendTestSignal = async () => {
    if (!channelAccessToken) {
      alert('❌ กรุณาตั้งค่า LINE Channel Access Token ใน .env ก่อน');
      return;
    }

    // สร้าง demo signal
    const testSignal = {
      id: `test_${Date.now()}`,
      status: 'confirmed' as const,
      direction: 'long' as const,
      symbol: 'EURUSD',
      entry_time: new Date().toISOString(),
      entry_price: 1.0850,
      stop_loss: 1.0820,
      take_profits: [1.0880, 1.0920, 1.0960],
      tp_modes: ['TP1 30%', 'TP2 40%', 'Runner 30%'],
      reason: '🧪 ทดสอบการส่งสัญญาณจาก ORION Dashboard',
      confidence: 0.85,
      rr_target: 2.5,
      killzone: 'london' as const,
      price: 1.0850 // legacy field
    };

    try {
      console.log('📤 ส่งสัญญาณทดสอบไป LINE...');
      await sendLineNotification(testSignal, channelAccessToken, userId);
      
      alert('✅ ส่งสัญญาณทดสอบสำเร็จ! เช็ค LINE app ดูครับ 📱');
    } catch (error) {
      console.error('❌ เกิดข้อผิดพลาด:', error);
      alert('❌ ส่งสัญญาณไม่สำเร็จ ดู console สำหรับรายละเอียด');
    }
  };

  return (
    <button
      onClick={sendTestSignal}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
    >
      <span>📱</span>
      <span>ทดสอบ LINE Notification</span>
    </button>
  );
};

export default TestLineButton;
