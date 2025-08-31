// Price formatting utilities
export function fmtPrice(symbol: string, px: number): string {
  // CME futures formatting based on symbol
  switch (symbol) {
    case 'MNQ':
    case 'NQ':
      return px.toFixed(2); // E-mini NASDAQ
    case 'MES':
    case 'ES':
      return px.toFixed(2); // E-mini S&P 500
    case 'MYM':
    case 'YM':
      return px.toFixed(0); // E-mini Dow (no decimals)
    case 'GC':
      return px.toFixed(1); // Gold (1 decimal)
    case 'CL':
      return px.toFixed(2); // Crude Oil
    default:
      return px.toFixed(2); // Default to 2 decimals
  }
}

// Format percentage
export function fmtPercent(value: number): string {
  return `${Math.round(value)}%`;
}

// Format time
export function fmtTime(isoTime: string): string {
  return new Date(isoTime).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

// Format date
export function fmtDate(isoTime: string): string {
  return new Date(isoTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
