// LINE Notify Service
class LineNotifyService {
  private token: string;
  private apiUrl = 'https://notify-api.line.me/api/notify';

  constructor(token: string) {
    this.token = token;
  }

  async sendSignalNotification(signal: any): Promise<boolean> {
    try {
      const message = this.formatSignalMessage(signal);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          message: message,
        }),
      });

      if (response.ok) {
        console.log('✅ LINE notification sent successfully');
        return true;
      } else {
        console.error('❌ LINE notification failed:', response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ LINE notification error:', error);
      return false;
    }
  }

  private formatSignalMessage(signal: any): string {
    const rrText = signal.rr_target ? ` (R:R ${signal.rr_target})` : '';
    const confidenceText = signal.confidence ? ` (${Math.round(signal.confidence * 100)}%)` : '';
    
    let message = `
🎯 ORION SIGNAL ${signal.status.toUpperCase()}

📊 ${signal.symbol} ${signal.direction.toUpperCase()}
💰 Entry: ${signal.entry_price}
🛑 SL: ${signal.stop_loss}${rrText}
`;

    if (signal.take_profits && signal.take_profits.length > 0) {
      message += `🎯 TP Levels:\n`;
      signal.take_profits.forEach((tp: number, index: number) => {
        const mode = signal.tp_modes?.[index] || `TP${index + 1}`;
        message += `   ${mode}: ${tp}\n`;
      });
    }

    if (signal.reason) {
      message += `💡 Setup: ${signal.reason}`;
    }

    if (signal.confidence) {
      message += confidenceText;
    }

    message += `\n⏰ ${new Date(signal.entry_time).toLocaleString('th-TH')}`;

    return message.trim();
  }

  async sendPriceAlert(symbol: string, price: number, change: number): Promise<boolean> {
    try {
      const emoji = change >= 0 ? '📈' : '📉';
      const changeText = change >= 0 ? `+${change}` : `${change}`;
      
      const message = `
${emoji} ${symbol} Price Update
💰 ${price}
📊 Change: ${changeText} (${(change * 100).toFixed(2)}%)
⏰ ${new Date().toLocaleString('th-TH')}
`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          message: message.trim(),
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('❌ LINE price alert error:', error);
      return false;
    }
  }

  async sendConnectionStatus(status: string): Promise<boolean> {
    try {
      const emoji = status === 'connected' ? '🟢' : status === 'connecting' ? '🟡' : '🔴';
      const message = `
${emoji} ORION Dashboard Status
📡 ${status.toUpperCase()}
⏰ ${new Date().toLocaleString('th-TH')}
`;

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          message: message.trim(),
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('❌ LINE connection status error:', error);
      return false;
    }
  }
}

export default LineNotifyService;
