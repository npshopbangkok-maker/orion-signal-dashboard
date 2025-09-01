export interface TradeRecord {
  id: string;
  signalId: string;
  symbol: string;
  direction: 'long' | 'short';
  entryTime: string;
  entryPrice: number;
  exitTime?: string;
  exitPrice?: number;
  exitType?: 'tp1' | 'tp2' | 'tp3' | 'stop_loss' | 'manual' | 'break_even';
  stopLoss: number;
  takeProfits: number[];
  quantity: number;
  status: 'active' | 'closed' | 'cancelled';
  pnl?: number;
  pnlPercent?: number;
  rrRealized?: number;
  reason: string;
  confidence: number;
  killzone: string;
  notes?: string;
  executedBy: 'manual' | 'auto' | 'signal';
  createdAt: string;
  updatedAt: string;
}

export interface TradeSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  activeTrades: number;
  winRate: number;
  totalPnl: number;
  totalPnlPercent: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  bestTrade: number;
  worstTrade: number;
  avgHoldTime: string;
}
