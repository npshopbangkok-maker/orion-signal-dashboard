// Check Environment Variables in Browser
console.log('🔍 Environment Variables Check:');
console.log('──────────────────────────────────');
console.log('VITE_LINE_CHANNEL_ACCESS_TOKEN:', import.meta.env.VITE_LINE_CHANNEL_ACCESS_TOKEN ? '✅ Set' : '❌ Not Set');
console.log('VITE_LINE_USER_ID:', import.meta.env.VITE_LINE_USER_ID || '(empty - using broadcast)');
console.log('──────────────────────────────────');

// Test LINE API call from browser
const testFromBrowser = async () => {
  console.log('🧪 Testing LINE API from browser...');
  
  const token = import.meta.env.VITE_LINE_CHANNEL_ACCESS_TOKEN;
  const userId = import.meta.env.VITE_LINE_USER_ID;
  
  if (!token) {
    console.error('❌ No LINE token found in environment');
    return;
  }
  
  console.log('Token found:', token.substring(0, 20) + '...');
  
  const testMessage = {
    type: 'text',
    text: '🧪 Browser test: ' + new Date().toLocaleString('th-TH')
  };
  
  try {
    // Try broadcast (should work)
    const broadcastResponse = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [testMessage]
      }),
    });
    
    console.log('Broadcast Response Status:', broadcastResponse.status);
    
    if (broadcastResponse.ok) {
      console.log('✅ Browser API call successful!');
    } else {
      const errorText = await broadcastResponse.text();
      console.error('❌ Browser API call failed:', errorText);
    }
    
  } catch (error) {
    console.error('💥 Browser API Error:', error);
  }
};

// Auto-run test
testFromBrowser();
