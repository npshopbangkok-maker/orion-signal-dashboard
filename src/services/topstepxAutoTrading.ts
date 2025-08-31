import { Signal } from '../types/signal';

interface AutoTradingConfig {
  enabled: boolean;
  riskPercentage: number;
  maxPositions: number;
  symbolMapping: Record<string, string>; // Map signal symbols to TopstepX symbols
  hotkeys: {
    newOrder: string;
    buyMarket: string;
    sellMarket: string;
    closePosition: string;
  };
}

class TopstepXAutoTrader {
  private config: AutoTradingConfig;
  private activePositions = new Set<string>();

  constructor() {
    this.config = {
      enabled: false,
      riskPercentage: 1, // 1% risk per trade
      maxPositions: 3,
      symbolMapping: {
        'EURUSD': 'EURUSD',
        'GBPUSD': 'GBPUSD',
        'USDJPY': 'USDJPY',
        'XAUUSD': 'GOLD',
        'US30': 'YM', // Dow Jones Mini
        'NAS100': 'NQ', // Nasdaq Mini
        'SPX500': 'ES', // S&P 500 Mini
      },
      hotkeys: {
        newOrder: 'F9',
        buyMarket: 'Ctrl+B',
        sellMarket: 'Ctrl+S',
        closePosition: 'F10'
      }
    };
  }

  // ฟังก์ชันสำหรับเปิดเทรดอัตโนมัติ (Manual Instructions)
  async executeSignalWithAutomation(signal: Signal): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('Auto trading disabled');
      return false;
    }

    try {
      // เรียก Python automation script
      const success = await this.runPythonAutomation(signal);
      
      if (success) {
        this.activePositions.add(signal.id);
        console.log(`Python automation executed for ${signal.symbol}`);
        return true;
      } else {
        // Fallback ไปใช้ manual instructions
        return this.executeSignal(signal);
      }
    } catch (error) {
      console.error('Python automation failed, falling back to manual:', error);
      return this.executeSignal(signal);
    }
  }

  private async runPythonAutomation(signal: Signal): Promise<boolean> {
    // Note: This requires Python script to be available on the system
    console.log(`Would execute Python automation for ${signal.symbol}`);
    console.log('Python automation not implemented in web version');
    return false;
  }

  // ฟังก์ชันสำหรับเปิดเทรดอัตโนมัติ (เดิม)
  async executeSignal(signal: Signal): Promise<boolean> {
    if (!this.config.enabled) {
      console.log('Auto trading disabled');
      return false;
    }

    if (this.activePositions.size >= this.config.maxPositions) {
      console.log('Max positions reached');
      return false;
    }

    if (signal.status !== 'confirmed') {
      console.log('Signal not confirmed, skipping');
      return false;
    }

    try {
      // Map symbol
      const topstepxSymbol = this.config.symbolMapping[signal.symbol];
      if (!topstepxSymbol) {
        console.log(`Symbol ${signal.symbol} not mapped for TopstepX`);
        return false;
      }

      // Calculate position size based on risk
      const positionSize = this.calculatePositionSize(signal);
      
      // Generate trading instructions
      const tradeInstructions = this.generateTradeInstructions(signal, topstepxSymbol, positionSize);
      
      // Show instructions to user (for manual execution for now)
      this.showTradeInstructions(tradeInstructions);
      
      // Add to active positions
      this.activePositions.add(signal.id);
      
      return true;
    } catch (error) {
      console.error('Error executing signal:', error);
      return false;
    }
  }

  private calculatePositionSize(signal: Signal): number {
    // Calculate position size based on account balance and risk percentage
    // This would need real account balance from TopstepX
    const accountBalance = 25000; // Default funded account balance
    const riskAmount = accountBalance * (this.config.riskPercentage / 100);
    
    if (!signal.stop_loss || !signal.entry_price) {
      return 0.01; // Default mini lot
    }

    const pipRisk = Math.abs(signal.entry_price - signal.stop_loss);
    const positionSize = riskAmount / (pipRisk * 100); // Simplified calculation
    
    return Math.max(0.01, Math.min(positionSize, 1.0)); // Between 0.01 and 1.0 lots
  }

  private generateTradeInstructions(signal: Signal, symbol: string, size: number) {
    const instructions = {
      symbol,
      direction: signal.direction,
      entryPrice: signal.entry_price,
      stopLoss: signal.stop_loss,
      takeProfits: signal.take_profits || [],
      size,
      hotkeys: this.getHotkeysForTrade(signal.direction),
      steps: this.generateStepByStepInstructions(signal, symbol, size)
    };

    return instructions;
  }

  private getHotkeysForTrade(direction: 'long' | 'short') {
    const tradeDirection = direction === 'long' ? 'buy' : 'sell';
    return {
      openPosition: tradeDirection === 'buy' ? this.config.hotkeys.buyMarket : this.config.hotkeys.sellMarket,
      newOrder: this.config.hotkeys.newOrder,
      closePosition: this.config.hotkeys.closePosition
    };
  }

  private generateStepByStepInstructions(signal: Signal, symbol: string, size: number) {
    const steps = [
      `1. Focus TopstepX platform`,
      `2. Press ${this.config.hotkeys.newOrder} for new order`,
      `3. Select symbol: ${symbol}`,
      `4. Set direction: ${signal.direction.toUpperCase()}`,
      `5. Set size: ${size} lots`,
      `6. Set entry: ${signal.entry_price}`,
      `7. Set stop loss: ${signal.stop_loss}`,
    ];

    if (signal.take_profits && signal.take_profits.length > 0) {
      signal.take_profits.forEach((tp, index) => {
        steps.push(`${steps.length + 1}. Set TP${index + 1}: ${tp}`);
      });
    }

    steps.push(`${steps.length + 1}. Confirm trade`);
    
    return steps;
  }

  private showTradeInstructions(instructions: any) {
    // This will be displayed in the UI
    console.log('=== TRADE INSTRUCTIONS ===');
    console.log(`Symbol: ${instructions.symbol}`);
    console.log(`Direction: ${instructions.direction}`);
    console.log(`Size: ${instructions.size} lots`);
    console.log('Steps:');
    instructions.steps.forEach((step: string) => console.log(step));
    
    // Emit event for UI to show instructions
    window.dispatchEvent(new CustomEvent('showTradeInstructions', { 
      detail: instructions 
    }));
  }

  // ฟังก์ชันสำหรับปิดเทรดเมื่อ signal invalidated
  async closePosition(signalId: string): Promise<boolean> {
    if (!this.activePositions.has(signalId)) {
      return false;
    }

    // Show close instructions
    const closeInstructions = [
      `1. Focus TopstepX platform`,
      `2. Select position for signal ${signalId}`,
      `3. Press ${this.config.hotkeys.closePosition} to close`,
      `4. Confirm close`
    ];

    console.log('=== CLOSE POSITION ===');
    closeInstructions.forEach(step => console.log(step));

    window.dispatchEvent(new CustomEvent('showCloseInstructions', { 
      detail: { signalId, steps: closeInstructions }
    }));

    this.activePositions.delete(signalId);
    return true;
  }

  // Configuration methods
  updateConfig(newConfig: Partial<AutoTradingConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): AutoTradingConfig {
    return { ...this.config };
  }

  enable() {
    this.config.enabled = true;
  }

  disable() {
    this.config.enabled = false;
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }
}

export const topstepxAutoTrader = new TopstepXAutoTrader();
export default TopstepXAutoTrader;
