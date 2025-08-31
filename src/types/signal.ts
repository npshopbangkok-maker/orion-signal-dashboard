export interface Signal {
  id: string;
  status: 'pending' | 'confirmed' | 'invalidated';
  direction: 'long' | 'short';
  symbol: string;
  entry_time: string;
  price: number; // legacy field for backward compatibility
  entry_price?: number | null;
  stop_loss?: number | null;
  take_profits?: number[] | null;
  tp_modes?: string[] | null;
  reason: string;
  confidence: number;
  rr_target: number;
  killzone: string;
}

// New type following the exact specification
export type OrionSignal = {
  id: string;
  symbol: string;
  side: 'LONG' | 'SHORT';
  status: 'PENDING' | 'CONFIRMED' | 'INVALIDATED';
  entry_price?: number | null;
  stop_loss?: number | null;
  take_profits?: number[] | null;
  tp_modes?: string[] | null;
  rr_target?: number | null;
  confidence?: number | null;
  killzone?: string | null;
  time?: string | null;
}

export interface PriceData {
  symbol: string;
  price: number;
  timestamp: string;
  change?: number;
  change_percent?: number;
  volume?: number;
  high_24h?: number;
  low_24h?: number;
}

export interface WebSocketMessage {
  type: string;
  payload: Signal | PriceData;
}

export interface PriceUpdateMessage {
  type: 'price_update';
  payload: PriceData;
}

export interface SignalMessage {
  type: 'signal';
  payload: Signal;
}

export type KillzoneFilter = 'all' | 'asia' | 'london' | 'ny_am' | 'lunch' | 'pm';
export type SymbolFilter = 'all' | 'MNQ' | 'NQ' | 'MES';
