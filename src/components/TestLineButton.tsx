import { useState } from 'react';

export default function TestLineButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    
    // Debug environment variables
    console.log('🔍 Environment Variables Check:');
    console.log('──────────────────────────────────');
    console.log('VITE_LINE_CHANNEL_ACCESS_TOKEN:', import.meta.env.VITE_LINE_CHANNEL_ACCESS_TOKEN ? '✅ Set' : '❌ Not Set');
    console.log('VITE_LINE_USER_ID:', import.meta.env.VITE_LINE_USER_ID || '(empty - using broadcast)');
    console.log('Token preview:', import.meta.env.VITE_LINE_CHANNEL_ACCESS_TOKEN?.substring(0, 20) + '...');
    console.log('──────────────────────────────────');
    
    try {
      const testSignal = {
        id: `test-${Date.now()}`,
        symbol: 'EURUSD',
        direction: 'long',
        entry_time: new Date().toISOString(),
        price: 1.0950,
        entry_price: 1.0950,
        stop_loss: 1.0900,
        take_profits: [1.1000, 1.1050, 1.1100],
        tp_modes: ['50%', '25%', '25%'],
        reason: 'Test signal from dashboard',
        confidence: 85,
        rr_target: 3,
        killzone: 'London Open',
        status: 'confirmed'
      };
      
      console.log('🧪 Sending LINE notification via API...');
      console.log('📊 Test signal:', testSignal);
      
      // Use our API endpoint instead of direct LINE API call
      const response = await fetch('/api/send-line-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signal: testSignal }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ LINE notification sent successfully!', result);
        alert('✅ ส่งแจ้งเตือนไปที่ LINE แล้ว!');
      } else {
        const error = await response.json();
        console.error('❌ API Error:', error);
        alert('❌ ส่งแจ้งเตือนไม่สำเร็จ: ' + error.message);
      }
    } catch (error) {
      console.error('💥 Error sending test notification:', error);
      alert('❌ ส่งแจ้งเตือนไม่สำเร็จ: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleTest}
      disabled={isLoading}
      className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
    >
      <span>📱</span>
      <span>{isLoading ? 'กำลังส่ง...' : 'ทดสอบ LINE Notification'}</span>
    </button>
  );
}
