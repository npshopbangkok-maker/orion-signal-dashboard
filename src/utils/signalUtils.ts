import { Signal } from '../types/signal';
import LineNotifyService from '../services/lineNotify';

// Audio notification
export const playNotificationSound = () => {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+LyvmEVAUiQ1/LLeSMFNoPU8tiPNwkZa7zs5KBNFAxTqOLwt2EYA0eO2fLLeSUFM37O8t2RTAwSXrPm66hVFwtGnt7sv2MXAUeK1/LMeSYGOIHD89yOPgkRYL3t559lGAwQr+P1oQAAS0lEQVQoU2+47+ahThoOR5zd7sJ+HwNBjdTz0oE3CRZxwOzjpVIWCUSn4/K8XhsENo3X8tGAOAgZaL3m46dQFgpDn+Hwu2IdA0iN2fLOeCQGOILJ8N2OOwsSYLfk7qBNGwxTpuLwvGAYA0iO2fLMeSUGNH3R8t2QTAwQWrTm66hVGQpGn+Hzu2IcA0iO2fLGeSYGOYHA8tuNPgsQYL3t46FNGwxTpOPwvGEYA0eP2fLJeSUFNYPG8N2OPQkRXrLp66tVGAtDn+Dxt2AZA0eK2e/NeSMGOYHO8tiNNwcZar3w46FQFQhRpOPyuGMeBn/U8tLDdywDMoDF8t+NOAoUW7Pg7qNOGwxKpeXyy2odD0N+2PLTe2IDDj/Fz6PtMgAy8/LO3sIFw'); // Simple beep sound
  audio.play().catch(() => {
    // Fallback for browsers that don't allow autoplay
    console.log('🔊 Signal notification (audio blocked)');
  });
};

// Telegram notification
export const sendTelegramNotification = async (signal: Signal, webhookUrl?: string) => {
  if (!webhookUrl) return;

  const entryPrice = signal.entry_price || signal.price;
  let message = `🚨 *ORION SIGNAL CONFIRMED*
  
Symbol: *${signal.symbol}*
Direction: *${signal.direction.toUpperCase()}*`;

  if (entryPrice) {
    message += `\nEntry Price: *$${entryPrice.toLocaleString()}*`;
  }

  if (signal.stop_loss) {
    message += `\nStop Loss: *$${signal.stop_loss.toLocaleString()}*`;
  }

  if (signal.take_profits?.length) {
    message += `\nTake Profits:`;
    signal.take_profits.forEach((tp, i) => {
      const label = signal.tp_modes?.[i] || `TP${i + 1}`;
      message += `\n  ${label}: *$${tp.toLocaleString()}*`;
    });
  }

  message += `\nConfidence: *${Math.round(signal.confidence * 100)}%*`;
  
  if (signal.rr_target) {
    message += `\nOverall R:R: *${signal.rr_target}:1*`;
  }
  
  message += `\nKillzone: *${signal.killzone.toUpperCase()}*`;
  message += `\nReason: ${signal.reason}`;
  message += `\n\nTime: ${new Date(signal.entry_time).toLocaleString()}`;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: message,
        parse_mode: 'Markdown'
      })
    });

    console.log('✅ Telegram notification sent');
  } catch (error) {
    console.error('❌ Telegram notification failed:', error);
  }
};

// LINE Notify notification
export const sendLineNotification = async (signal: Signal, lineToken: string) => {
  if (!lineToken) {
    console.log('⚠️ LINE token not configured');
    return;
  }

  try {
    const lineService = new LineNotifyService(lineToken);
    await lineService.sendSignalNotification(signal);
  } catch (error) {
    console.error('❌ LINE notification failed:', error);
  }
};

// Format trade message for copying
export const formatTradeMessage = (signal: Signal): string => {
  const entryPrice = signal.entry_price || signal.price;
  const symbol = signal.symbol;
  const direction = signal.direction.toUpperCase();
  
  let message = `${symbol} | ${direction}`;
  
  if (entryPrice) {
    message += `\nEntry ${entryPrice.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  
  if (signal.stop_loss) {
    message += `\nSL ${signal.stop_loss.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }
  
  if (signal.take_profits?.length) {
    const tpText = signal.take_profits.map((tp, i) => {
      const label = signal.tp_modes?.[i] || `TP${i + 1}`;
      return `${label} ${tp.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })}`;
    }).join(', ');
    message += `\nTP ${tpText}`;
  }
  
  message += `\nConfidence ${Math.round(signal.confidence * 100)}%`;
  
  if (signal.killzone) {
    message += `\nKillzone ${signal.killzone.toUpperCase()}`;
  }
  
  return message;
};

// Check if signal should be expired
export const shouldExpireSignal = (signal: Signal, expireMinutes: number = 5): boolean => {
  if (signal.status !== 'pending') return false;
  
  const signalTime = new Date(signal.entry_time).getTime();
  const now = Date.now();
  const timeDiff = now - signalTime;
  const minutesDiff = timeDiff / (1000 * 60);
  
  return minutesDiff > expireMinutes;
};
