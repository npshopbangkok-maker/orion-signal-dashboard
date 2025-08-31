// Debug LINE API Call
const testLineAPI = async () => {
  const channelAccessToken = 'yIGpXkU8UqmYRl0ZbI83mdOtj4kfoJjcsD6hYzH4gMX6QYHr4z/O1Zfu5Q7aRW0tKhb9mC/Tme5VhXyfKnlTbDx5Roy1RJ5BlpyPl5XVnDe2pyo3hWtxEIkb8LI1+/bMWIt+COpmsmh0vfyQTdNZzgdB04t89/1O/w1cDnyilFU=';
  const userId = 'U2008022597';
  
  console.log('🧪 Testing LINE API Call...');
  console.log('Channel Token:', channelAccessToken);
  console.log('User ID:', userId);
  
  const testMessage = {
    type: 'text',
    text: '🧪 Test message from ORION Dashboard\nเวลา: ' + new Date().toLocaleString('th-TH')
  };
  
  try {
    // Try broadcast first (sends to all friends)
    const broadcastResponse = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [testMessage]
      }),
    });
    
    console.log('Broadcast Response Status:', broadcastResponse.status);
    
    if (broadcastResponse.ok) {
      console.log('✅ Broadcast successful!');
      const responseData = await broadcastResponse.text();
      console.log('Broadcast Response:', responseData);
    } else {
      console.log('❌ Broadcast failed');
      const errorText = await broadcastResponse.text();
      console.log('Broadcast Error:', errorText);
    }
    
    // Also try the original push method
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${channelAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: userId,
        messages: [testMessage]
      }),
    });
    
    console.log('Response Status:', response.status);
    console.log('Response Headers:', [...response.headers.entries()]);
    
    if (response.ok) {
      console.log('✅ API call successful!');
      const responseData = await response.text();
      console.log('Response:', responseData);
    } else {
      console.log('❌ API call failed');
      const errorText = await response.text();
      console.log('Error:', errorText);
      
      // Parse error details
      try {
        const errorJson = JSON.parse(errorText);
        console.log('Error Details:', errorJson);
      } catch (e) {
        console.log('Raw Error Text:', errorText);
      }
    }
    
  } catch (error) {
    console.error('💥 Network Error:', error);
  }
};

// Run the test
testLineAPI();

console.log(`
🔍 Debug Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📱 Channel Access Token: 01655d0a64ac969990a2476b223d0a4
👤 User ID: U2008022597
🌐 API Endpoint: https://api.line.me/v2/bot/message/push
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔧 Common Issues:
1. Invalid Channel Access Token
2. User hasn't added bot as friend
3. User ID incorrect
4. Channel not properly configured
5. Rate limiting

📋 Next Steps:
1. Check console for API response
2. Verify bot is added as friend
3. Confirm User ID is correct
4. Check LINE Developers Console
`);
