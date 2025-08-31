import { Signal } from '../types/signal';

interface TrailingStopConfig {
  enabled: boolean;
  trailMethod: 'swing' | 'atr' | 'fixed_pips';
  atrPeriod: number;
  atrMultiplier: number;
  fixedPips: number;
  swingLookback: number;
}

interface TrailingStopUpdate {
  signalId: string;
  currentPrice: number;
  newStopLoss: number;
  reason: string;
  instructions: string[];
}

class TrailingStopManager {
  private config: TrailingStopConfig;
  private activeTrails = new Map<string, { signal: Signal; lastPrice: number; lastSL: number }>();

  constructor() {
    this.config = {
      enabled: false,
      trailMethod: 'swing',
      atrPeriod: 14,
      atrMultiplier: 2.0,
      fixedPips: 20,
      swingLookback: 5
    };
  }

  // เริ่ม trail stop สำหรับ signal
  startTrailing(signal: Signal, currentPrice: number) {
    if (!this.config.enabled || !signal.stop_loss) return;

    this.activeTrails.set(signal.id, {
      signal,
      lastPrice: currentPrice,
      lastSL: signal.stop_loss
    });

    console.log(`Started trailing stop for ${signal.symbol} at ${currentPrice}`);
  }

  // ตรวจสอบและแนะนำการปรับ SL
  checkTrailingUpdates(priceUpdates: Record<string, number>): TrailingStopUpdate[] {
    const updates: TrailingStopUpdate[] = [];

    for (const [signalId, trail] of this.activeTrails) {
      const symbol = trail.signal.symbol;
      const currentPrice = priceUpdates[symbol];
      
      if (!currentPrice) continue;

      const update = this.calculateNewStopLoss(trail, currentPrice);
      if (update) {
        updates.push({
          signalId,
          currentPrice,
          newStopLoss: update.newSL,
          reason: update.reason,
          instructions: this.generateTrailInstructions(trail.signal, update.newSL)
        });

        // Update last known values
        trail.lastPrice = currentPrice;
        trail.lastSL = update.newSL;
      }
    }

    return updates;
  }

  private calculateNewStopLoss(trail: { signal: Signal; lastPrice: number; lastSL: number }, currentPrice: number) {
    const { signal, lastPrice, lastSL } = trail;
    const isLong = signal.direction === 'long';
    
    // ตรวจสอบว่าราคาเคลื่อนที่ในทิศทางที่ถูกต้อง
    const favorableMove = isLong ? currentPrice > lastPrice : currentPrice < lastPrice;
    if (!favorableMove) return null;

    let newSL: number;
    let reason: string;

    switch (this.config.trailMethod) {
      case 'swing':
        newSL = this.calculateSwingBasedSL(signal, currentPrice);
        reason = `Swing-based trailing (${this.config.swingLookback} candle lookback)`;
        break;
        
      case 'atr':
        newSL = this.calculateATRBasedSL(signal, currentPrice);
        reason = `ATR-based trailing (${this.config.atrMultiplier}x ATR${this.config.atrPeriod})`;
        break;
        
      case 'fixed_pips':
        newSL = this.calculateFixedPipsSL(signal, currentPrice);
        reason = `Fixed pips trailing (${this.config.fixedPips} pips)`;
        break;
        
      default:
        return null;
    }

    // ตรวจสอบว่า SL ใหม่ดีกว่าเดิม
    const betterSL = isLong ? newSL > lastSL : newSL < lastSL;
    if (!betterSL) return null;

    return { newSL, reason };
  }

  private calculateSwingBasedSL(signal: Signal, currentPrice: number): number {
    // สำหรับ swing-based SL เราจะใช้การประมาณ
    // ในการใช้งานจริงต้องมีข้อมูล OHLC เพื่อหา swing high/low
    const isLong = signal.direction === 'long';
    const swingOffset = currentPrice * 0.002; // 0.2% offset from current price
    
    return isLong ? currentPrice - swingOffset : currentPrice + swingOffset;
  }

  private calculateATRBasedSL(signal: Signal, currentPrice: number): number {
    // ประมาณ ATR โดยใช้ percentage ของราคา
    const estimatedATR = currentPrice * 0.01; // 1% as rough ATR estimate
    const isLong = signal.direction === 'long';
    
    return isLong 
      ? currentPrice - (estimatedATR * this.config.atrMultiplier)
      : currentPrice + (estimatedATR * this.config.atrMultiplier);
  }

  private calculateFixedPipsSL(signal: Signal, currentPrice: number): number {
    const isLong = signal.direction === 'long';
    const pipValue = this.getPipValue(signal.symbol);
    const slDistance = this.config.fixedPips * pipValue;
    
    return isLong ? currentPrice - slDistance : currentPrice + slDistance;
  }

  private getPipValue(symbol: string): number {
    // Simplified pip values
    const forexPairs = ['EURUSD', 'GBPUSD', 'AUDUSD', 'NZDUSD'];
    const jpyPairs = ['USDJPY', 'EURJPY', 'GBPJPY'];
    
    if (jpyPairs.some(pair => symbol.includes(pair))) return 0.01;
    if (forexPairs.some(pair => symbol.includes(pair))) return 0.0001;
    if (symbol.includes('XAU')) return 0.1; // Gold
    
    return 1; // Default for indices
  }

  private generateTrailInstructions(signal: Signal, newSL: number): string[] {
    return [
      "🔄 TRAIL STOP LOSS ALERT",
      "1. Open TopstepX platform",
      "2. Locate your position for " + signal.symbol,
      "3. Right-click on the Stop Loss line on chart",
      "4. Drag the SL line to: " + newSL.toFixed(signal.symbol.includes('JPY') ? 2 : 4),
      "5. OR modify SL in position panel to: " + newSL.toFixed(signal.symbol.includes('JPY') ? 2 : 4),
      "6. Confirm the modification",
      "",
      "⚠️ This is a manual step - automation cannot drag chart lines!"
    ];
  }

  // Stop trailing for a signal
  stopTrailing(signalId: string) {
    this.activeTrails.delete(signalId);
  }

  // Configuration methods
  updateConfig(newConfig: Partial<TrailingStopConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): TrailingStopConfig {
    return { ...this.config };
  }

  getActiveTrails(): string[] {
    return Array.from(this.activeTrails.keys());
  }
}

export const trailingStopManager = new TrailingStopManager();
export type { TrailingStopConfig, TrailingStopUpdate };
