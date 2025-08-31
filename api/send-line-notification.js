// API endpoint for sending LINE notifications
// This runs on Vercel serverless functions

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { signal } = req.body;
    const token = process.env.VITE_LINE_CHANNEL_ACCESS_TOKEN;

    if (!token) {
      return res.status(500).json({ error: 'LINE token not configured' });
    }

    if (!signal) {
      return res.status(400).json({ error: 'Signal data required' });
    }

    // Create flex message
    const flexMessage = {
      type: 'flex',
      altText: `🚨 ${signal.direction?.toUpperCase()} Signal: ${signal.symbol}`,
      contents: {
        type: 'bubble',
        hero: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: '🚨 ORION SIGNAL',
              weight: 'bold',
              size: 'lg',
              color: '#ffffff',
              align: 'center'
            }
          ],
          backgroundColor: signal.direction === 'long' ? '#10b981' : '#ef4444',
          paddingAll: 'md'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: signal.symbol || 'Unknown',
                  weight: 'bold',
                  size: 'xl',
                  color: '#1f2937'
                },
                {
                  type: 'text',
                  text: signal.direction?.toUpperCase() || 'UNKNOWN',
                  weight: 'bold',
                  size: 'lg',
                  color: signal.direction === 'long' ? '#10b981' : '#ef4444',
                  align: 'end'
                }
              ]
            },
            {
              type: 'separator',
              margin: 'md'
            },
            {
              type: 'box',
              layout: 'vertical',
              margin: 'md',
              contents: [
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '📈 Entry',
                      size: 'sm',
                      color: '#6b7280',
                      flex: 2
                    },
                    {
                      type: 'text',
                      text: signal.entry_price?.toFixed(5) || signal.price?.toFixed(5) || 'N/A',
                      size: 'sm',
                      color: '#1f2937',
                      align: 'end',
                      flex: 3
                    }
                  ]
                },
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '🛑 Stop Loss',
                      size: 'sm',
                      color: '#6b7280',
                      flex: 2
                    },
                    {
                      type: 'text',
                      text: signal.stop_loss?.toFixed(5) || 'N/A',
                      size: 'sm',
                      color: '#ef4444',
                      align: 'end',
                      flex: 3
                    }
                  ]
                }
              ]
            }
          ]
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `🎯 R:R Target: ${signal.rr_target || 'N/A'}`,
              size: 'sm',
              color: '#059669',
              align: 'center'
            },
            {
              type: 'text',
              text: `⚡ Confidence: ${signal.confidence || 'N/A'}%`,
              size: 'sm',
              color: '#7c3aed',
              align: 'center'
            }
          ],
          paddingAll: 'sm'
        }
      }
    };

    // Send to LINE API
    const response = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [flexMessage]
      }),
    });

    if (response.ok) {
      console.log('✅ LINE notification sent successfully');
      return res.status(200).json({ success: true, message: 'Notification sent' });
    } else {
      const errorText = await response.text();
      console.error('❌ LINE API error:', errorText);
      return res.status(response.status).json({ error: 'LINE API error', details: errorText });
    }

  } catch (error) {
    console.error('💥 Server error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
