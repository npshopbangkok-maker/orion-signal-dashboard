import { Signal } from '../types/signal';

// Play notification sound
export const playNotificationSound = () => {
  try {
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (error) {
    console.warn('Could not play notification sound:', error);
    // Fallback to system beep
    console.log('\u0007'); // Bell character
  }
};

// Send Telegram webhook
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
  } catch (error) {
    console.error('Failed to send Telegram notification:', error);
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
