// LINE Messaging API Service
class LineMessagingService {
  private channelAccessToken: string;
  private apiUrl = 'https://api.line.me/v2/bot/message';

  constructor(channelAccessToken: string) {
    this.channelAccessToken = channelAccessToken;
  }

  async sendSignalNotification(signal: any, userId?: string): Promise<boolean> {
    try {
      const flexMessage = this.createSignalFlexMessage(signal);
      
      const payload = userId 
        ? {
            to: userId,
            messages: [flexMessage]
          }
        : {
            messages: [flexMessage]
          };

      const endpoint = userId ? '/push' : '/broadcast';
      
      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.channelAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        console.log('✅ LINE Messaging API notification sent successfully');
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ LINE Messaging API failed:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ LINE Messaging API error:', error);
      return false;
    }
  }

  private createSignalFlexMessage(signal: any) {
    const statusColor = signal.status === 'confirmed' ? '#00C851' : 
                       signal.status === 'pending' ? '#FFB04D' : '#FF4444';
    
    const directionEmoji = signal.direction === 'long' ? '📈' : '📉';
    const directionColor = signal.direction === 'long' ? '#00C851' : '#FF4444';

    return {
      type: 'flex',
      altText: `🎯 ORION Signal: ${signal.symbol} ${signal.direction.toUpperCase()}`,
      contents: {
        type: 'bubble',
        size: 'kilo',
        header: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '🎯 ORION SIGNAL',
                  weight: 'bold',
                  color: '#FFFFFF',
                  size: 'md'
                },
                {
                  type: 'text',
                  text: signal.status.toUpperCase(),
                  weight: 'bold',
                  color: '#FFFFFF',
                  size: 'sm',
                  align: 'end'
                }
              ]
            }
          ],
          backgroundColor: statusColor,
          paddingAll: 'lg'
        },
        body: {
          type: 'box',
          layout: 'vertical',
          contents: [
            // Symbol and Direction
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: `${directionEmoji} ${signal.symbol}`,
                  weight: 'bold',
                  size: 'xl',
                  color: directionColor
                },
                {
                  type: 'text',
                  text: signal.direction.toUpperCase(),
                  weight: 'bold',
                  size: 'xl',
                  color: directionColor,
                  align: 'end'
                }
              ],
              margin: 'none'
            },
            {
              type: 'separator',
              margin: 'md'
            },
            // Entry Price
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '💰 Entry',
                  size: 'sm',
                  color: '#666666'
                },
                {
                  type: 'text',
                  text: signal.entry_price?.toLocaleString() || 'Market',
                  size: 'sm',
                  color: '#111111',
                  align: 'end',
                  weight: 'bold'
                }
              ],
              margin: 'md'
            },
            // Stop Loss
            {
              type: 'box',
              layout: 'horizontal',
              contents: [
                {
                  type: 'text',
                  text: '🛑 Stop Loss',
                  size: 'sm',
                  color: '#666666'
                },
                {
                  type: 'text',
                  text: signal.stop_loss?.toLocaleString() || '-',
                  size: 'sm',
                  color: '#FF4444',
                  align: 'end',
                  weight: 'bold'
                }
              ],
              margin: 'sm'
            },
            // Take Profits
            ...(signal.take_profits && signal.take_profits.length > 0 ? [
              {
                type: 'separator',
                margin: 'md'
              },
              {
                type: 'text',
                text: '🎯 Take Profits',
                weight: 'bold',
                size: 'sm',
                margin: 'md'
              },
              ...signal.take_profits.slice(0, 3).map((tp: number, index: number) => ({
                type: 'box',
                layout: 'horizontal',
                contents: [
                  {
                    type: 'text',
                    text: signal.tp_modes?.[index] || `TP${index + 1}`,
                    size: 'xs',
                    color: '#666666'
                  },
                  {
                    type: 'text',
                    text: tp.toLocaleString(),
                    size: 'xs',
                    color: '#00C851',
                    align: 'end',
                    weight: 'bold'
                  }
                ],
                margin: 'xs'
              }))
            ] : []),
            {
              type: 'separator',
              margin: 'md'
            },
            // Additional Info
            {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '💡 Setup',
                      size: 'xs',
                      color: '#666666'
                    },
                    {
                      type: 'text',
                      text: signal.reason || 'Technical Analysis',
                      size: 'xs',
                      color: '#111111',
                      align: 'end',
                      wrap: true
                    }
                  ]
                },
                ...(signal.confidence ? [{
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '📊 Confidence',
                      size: 'xs',
                      color: '#666666'
                    },
                    {
                      type: 'text',
                      text: `${Math.round(signal.confidence * 100)}%`,
                      size: 'xs',
                      color: '#111111',
                      align: 'end',
                      weight: 'bold'
                    }
                  ],
                  margin: 'xs'
                }] : []),
                ...(signal.rr_target ? [{
                  type: 'box',
                  layout: 'horizontal',
                  contents: [
                    {
                      type: 'text',
                      text: '⚖️ R:R Ratio',
                      size: 'xs',
                      color: '#666666'
                    },
                    {
                      type: 'text',
                      text: `${signal.rr_target}:1`,
                      size: 'xs',
                      color: '#111111',
                      align: 'end',
                      weight: 'bold'
                    }
                  ],
                  margin: 'xs'
                }] : [])
              ],
              margin: 'md'
            }
          ],
          paddingAll: 'lg'
        },
        footer: {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'button',
              style: 'primary',
              height: 'sm',
              action: {
                type: 'uri',
                label: '📊 Open Dashboard',
                uri: 'https://orion-signal-dashboard.vercel.app'
              },
              color: statusColor
            },
            {
              type: 'text',
              text: `⏰ ${new Date(signal.entry_time).toLocaleString('th-TH')}`,
              size: 'xs',
              color: '#666666',
              align: 'center',
              margin: 'sm'
            }
          ],
          paddingAll: 'sm'
        }
      }
    };
  }

  async sendPriceAlert(symbol: string, price: number, change: number, userId?: string): Promise<boolean> {
    try {
      const emoji = change >= 0 ? '📈' : '📉';
      const color = change >= 0 ? '#00C851' : '#FF4444';
      const changeText = change >= 0 ? `+${change.toFixed(4)}` : `${change.toFixed(4)}`;
      
      const flexMessage = {
        type: 'flex',
        altText: `${emoji} ${symbol} Price Update: ${price}`,
        contents: {
          type: 'bubble',
          size: 'nano',
          body: {
            type: 'box',
            layout: 'vertical',
            contents: [
              {
                type: 'text',
                text: `${emoji} ${symbol}`,
                weight: 'bold',
                size: 'md',
                color: color
              },
              {
                type: 'text',
                text: `${price.toLocaleString()}`,
                weight: 'bold',
                size: 'xl',
                margin: 'md'
              },
              {
                type: 'text',
                text: `${changeText} (${(change * 100).toFixed(2)}%)`,
                size: 'sm',
                color: color,
                margin: 'sm'
              },
              {
                type: 'text',
                text: `⏰ ${new Date().toLocaleString('th-TH')}`,
                size: 'xs',
                color: '#666666',
                margin: 'md'
              }
            ],
            paddingAll: 'lg'
          }
        }
      };

      const payload = userId 
        ? { to: userId, messages: [flexMessage] }
        : { messages: [flexMessage] };

      const endpoint = userId ? '/push' : '/broadcast';

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.channelAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('❌ LINE price alert error:', error);
      return false;
    }
  }

  async sendConnectionStatus(status: string, userId?: string): Promise<boolean> {
    try {
      const emoji = status === 'connected' ? '🟢' : status === 'connecting' ? '🟡' : '🔴';
      
      const textMessage = {
        type: 'text',
        text: `${emoji} ORION Dashboard\n📡 ${status.toUpperCase()}\n⏰ ${new Date().toLocaleString('th-TH')}`
      };

      const payload = userId 
        ? { to: userId, messages: [textMessage] }
        : { messages: [textMessage] };

      const endpoint = userId ? '/push' : '/broadcast';

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.channelAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      return response.ok;
    } catch (error) {
      console.error('❌ LINE connection status error:', error);
      return false;
    }
  }
}

// Wrapper function for easy use
export const sendSignalNotification = async (signal: any, userId?: string): Promise<boolean> => {
  const token = import.meta.env.VITE_LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!token) {
    throw new Error('LINE Channel Access Token not found in environment variables');
  }
  
  const lineService = new LineMessagingService(token);
  return await lineService.sendSignalNotification(signal, userId);
};

export default LineMessagingService;
