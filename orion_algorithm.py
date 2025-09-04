"""
ORIONAI_MAX Algorithm Implementation
EMA Cross + ATR based trading strategy for MNQ futures
"""

import logging
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
import asyncio

logger = logging.getLogger(__name__)

@dataclass
class TradingSignal:
    """Trading signal data structure"""
    id: str
    status: str  # "pending", "confirmed", "invalidated"
    direction: str  # "long", "short"
    symbol: str
    entry_time: datetime
    entry_price: float
    stop_loss: float
    take_profits: List[float]
    tp_modes: List[str]
    reason: str
    confidence: float
    rr_target: float
    killzone: str

class TechnicalIndicators:
    """Technical analysis indicators for ORIONAI_MAX"""
    
    @staticmethod
    def ema(prices: List[float], period: int) -> float:
        """Calculate Exponential Moving Average"""
        if len(prices) < period:
            return sum(prices) / len(prices) if prices else 0.0
        
        multiplier = 2 / (period + 1)
        ema_values = [sum(prices[:period]) / period]  # SMA for first value
        
        for i in range(period, len(prices)):
            ema_value = (prices[i] * multiplier) + (ema_values[-1] * (1 - multiplier))
            ema_values.append(ema_value)
        
        return ema_values[-1]
    
    @staticmethod
    def atr(highs: List[float], lows: List[float], closes: List[float], period: int = 14) -> float:
        """Calculate Average True Range"""
        if len(closes) < 2 or len(highs) < period or len(lows) < period:
            return 0.0
        
        true_ranges = []
        for i in range(1, min(len(highs), len(lows), len(closes))):
            tr1 = highs[i] - lows[i]
            tr2 = abs(highs[i] - closes[i-1])
            tr3 = abs(lows[i] - closes[i-1])
            true_ranges.append(max(tr1, tr2, tr3))
        
        if len(true_ranges) < period:
            return sum(true_ranges) / len(true_ranges) if true_ranges else 0.0
        
        # Calculate ATR as EMA of True Range
        return TechnicalIndicators.ema(true_ranges[-period:], period)

class OrionAIMaxAlgorithm:
    """ORIONAI_MAX trading algorithm with EMA cross and ATR"""
    
    def __init__(self):
        # Algorithm parameters
        self.fast_ema_period = 9
        self.slow_ema_period = 21
        self.atr_period = 14
        self.atr_multiplier = 2.0
        
        # Price history for calculations
        self.price_history = []
        self.high_history = []
        self.low_history = []
        self.close_history = []
        
        # Signal tracking
        self.active_signals = {}
        self.last_signal_time = None
        self.signal_cooldown = timedelta(minutes=15)  # Minimum time between signals
        
        # Market session detection
        self.killzones = {
            'asia': (0, 8),      # 00:00 - 08:00 UTC
            'london': (8, 16),   # 08:00 - 16:00 UTC  
            'ny_am': (13, 17),   # 13:00 - 17:00 UTC (NY morning)
            'lunch': (17, 19),   # 17:00 - 19:00 UTC (NY lunch)
            'pm': (19, 24)       # 19:00 - 24:00 UTC (NY afternoon)
        }
        
        logger.info("🤖 ORIONAI_MAX Algorithm initialized")
        logger.info(f"📊 Parameters: Fast EMA={self.fast_ema_period}, Slow EMA={self.slow_ema_period}, ATR={self.atr_period}")
    
    async def process_tick(self, market_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Process incoming market tick and generate signals"""
        price = market_data.get("price", 0.0)
        if price <= 0:
            return []
        
        # Update price history
        self._update_price_history(market_data)
        
        # Check for EMA cross signals
        signals = []
        signal = await self._check_ema_cross_signal()
        
        if signal:
            signals.append(signal)
        
        # Update existing signal statuses
        await self._update_signal_statuses()
        
        return signals
    
    def _update_price_history(self, market_data: Dict[str, Any]):
        """Update price history for technical analysis"""
        price = market_data.get("price", 0.0)
        
        # For live data, we simulate OHLC from tick data
        if not hasattr(self, '_current_minute'):
            self._current_minute = datetime.utcnow().replace(second=0, microsecond=0)
            self._minute_high = price
            self._minute_low = price
            self._minute_open = price
        
        current_minute = datetime.utcnow().replace(second=0, microsecond=0)
        
        if current_minute != self._current_minute:
            # Close previous minute candle
            self.close_history.append(self.price_history[-1] if self.price_history else price)
            self.high_history.append(self._minute_high)
            self.low_history.append(self._minute_low)
            
            # Start new minute candle
            self._current_minute = current_minute
            self._minute_high = price
            self._minute_low = price
            self._minute_open = price
        else:
            # Update current minute extremes
            self._minute_high = max(self._minute_high, price)
            self._minute_low = min(self._minute_low, price)
        
        # Update price history
        self.price_history.append(price)
        
        # Keep history manageable (last 1000 ticks)
        max_history = 1000
        if len(self.price_history) > max_history:
            self.price_history = self.price_history[-max_history:]
        if len(self.close_history) > max_history:
            self.close_history = self.close_history[-max_history:]
            self.high_history = self.high_history[-max_history:]
            self.low_history = self.low_history[-max_history:]
    
    async def _check_ema_cross_signal(self) -> Optional[Dict[str, Any]]:
        """Check for EMA crossover signals"""
        if len(self.close_history) < max(self.fast_ema_period, self.slow_ema_period) + 2:
            return None
        
        # Calculate current and previous EMAs
        current_fast_ema = TechnicalIndicators.ema(self.close_history, self.fast_ema_period)
        current_slow_ema = TechnicalIndicators.ema(self.close_history, self.slow_ema_period)
        
        previous_fast_ema = TechnicalIndicators.ema(self.close_history[:-1], self.fast_ema_period)
        previous_slow_ema = TechnicalIndicators.ema(self.close_history[:-1], self.slow_ema_period)
        
        # Check for crossover
        bullish_cross = (previous_fast_ema <= previous_slow_ema and 
                        current_fast_ema > current_slow_ema)
        bearish_cross = (previous_fast_ema >= previous_slow_ema and 
                        current_fast_ema < current_slow_ema)
        
        if not (bullish_cross or bearish_cross):
            return None
        
        # Check signal cooldown
        now = datetime.utcnow()
        if (self.last_signal_time and 
            now - self.last_signal_time < self.signal_cooldown):
            return None
        
        # Calculate ATR for stop loss and take profit levels
        atr = TechnicalIndicators.atr(
            self.high_history, 
            self.low_history, 
            self.close_history, 
            self.atr_period
        )
        
        if atr <= 0:
            return None
        
        # Generate signal
        current_price = self.price_history[-1]
        direction = "long" if bullish_cross else "short"
        
        # Calculate levels based on ATR
        if direction == "long":
            entry_price = current_price
            stop_loss = entry_price - (atr * self.atr_multiplier)
            take_profits = [
                entry_price + (atr * 1.5),  # TP1: 1.5 ATR
                entry_price + (atr * 2.5),  # TP2: 2.5 ATR  
                entry_price + (atr * 4.0)   # TP3: 4.0 ATR
            ]
        else:
            entry_price = current_price
            stop_loss = entry_price + (atr * self.atr_multiplier)
            take_profits = [
                entry_price - (atr * 1.5),  # TP1: 1.5 ATR
                entry_price - (atr * 2.5),  # TP2: 2.5 ATR
                entry_price - (atr * 4.0)   # TP3: 4.0 ATR
            ]
        
        # Calculate risk-reward ratio
        risk = abs(entry_price - stop_loss)
        reward = abs(take_profits[0] - entry_price)
        rr_ratio = reward / risk if risk > 0 else 0
        
        # Only generate signal if R:R is favorable
        if rr_ratio < 1.5:
            return None
        
        # Generate confidence score based on EMA separation and ATR
        ema_separation = abs(current_fast_ema - current_slow_ema)
        confidence = min(0.95, 0.6 + (ema_separation / current_price) * 100 + (atr / current_price) * 50)
        
        # Create signal
        signal_id = str(uuid.uuid4())
        killzone = self._get_current_killzone()
        
        signal = TradingSignal(
            id=signal_id,
            status="pending",
            direction=direction,
            symbol="MNQ",
            entry_time=now,
            entry_price=round(entry_price, 2),
            stop_loss=round(stop_loss, 2),
            take_profits=[round(tp, 2) for tp in take_profits],
            tp_modes=["TP1 40%", "TP2 35%", "Runner 25%"],
            reason=f"EMA{self.fast_ema_period}x{self.slow_ema_period} cross + ATR({atr:.1f})",
            confidence=round(confidence, 2),
            rr_target=round(rr_ratio, 1),
            killzone=killzone
        )
        
        # Track signal for status updates
        self.active_signals[signal_id] = signal
        self.last_signal_time = now
        
        # Schedule signal confirmation/invalidation
        asyncio.create_task(self._schedule_signal_update(signal_id))
        
        logger.info(f"🚨 Generated {direction.upper()} signal: {signal_id} | R:R {rr_ratio:.1f} | {killzone}")
        
        return self._signal_to_dict(signal)
    
    def _get_current_killzone(self) -> str:
        """Determine current market killzone"""
        current_hour = datetime.utcnow().hour
        
        for zone, (start, end) in self.killzones.items():
            if start <= current_hour < end:
                return zone
        
        return "asia"  # Default fallback
    
    async def _schedule_signal_update(self, signal_id: str):
        """Schedule signal status update after delay"""
        import random
        
        # Wait 30-120 seconds before updating signal status
        delay = random.randint(30, 120)
        await asyncio.sleep(delay)
        
        if signal_id in self.active_signals:
            signal = self.active_signals[signal_id]
            
            # 70% chance to confirm, 30% to invalidate
            if random.random() < 0.7:
                signal.status = "confirmed"
                logger.info(f"✅ Signal {signal_id} CONFIRMED")
            else:
                signal.status = "invalidated"  
                logger.info(f"❌ Signal {signal_id} INVALIDATED")
    
    async def _update_signal_statuses(self):
        """Update statuses of active signals"""
        # This method can be used for real-time signal management
        # For now, status updates are handled by _schedule_signal_update
        pass
    
    def _signal_to_dict(self, signal: TradingSignal) -> Dict[str, Any]:
        """Convert TradingSignal to dictionary format for WebSocket"""
        return {
            "type": "signal",
            "payload": {
                "id": signal.id,
                "status": signal.status,
                "direction": signal.direction,
                "symbol": signal.symbol,
                "entry_time": signal.entry_time.isoformat() + "Z",
                "entry_price": signal.entry_price,
                "stop_loss": signal.stop_loss,
                "take_profits": signal.take_profits,
                "tp_modes": signal.tp_modes,
                "reason": signal.reason,
                "confidence": signal.confidence,
                "rr_target": signal.rr_target,
                "killzone": signal.killzone
            }
        }
    
    async def get_current_analysis(self) -> Dict[str, Any]:
        """Get current algorithm analysis and metrics"""
        if len(self.close_history) < max(self.fast_ema_period, self.slow_ema_period):
            return {
                "status": "insufficient_data",
                "message": "Collecting market data for analysis..."
            }
        
        current_fast_ema = TechnicalIndicators.ema(self.close_history, self.fast_ema_period)
        current_slow_ema = TechnicalIndicators.ema(self.close_history, self.slow_ema_period)
        current_atr = TechnicalIndicators.atr(
            self.high_history, 
            self.low_history, 
            self.close_history, 
            self.atr_period
        )
        
        current_price = self.price_history[-1] if self.price_history else 0
        
        return {
            "status": "active",
            "current_price": round(current_price, 2),
            "fast_ema": round(current_fast_ema, 2),
            "slow_ema": round(current_slow_ema, 2),
            "atr": round(current_atr, 2),
            "trend": "bullish" if current_fast_ema > current_slow_ema else "bearish",
            "active_signals": len(self.active_signals),
            "killzone": self._get_current_killzone(),
            "last_signal": self.last_signal_time.isoformat() + "Z" if self.last_signal_time else None
        }