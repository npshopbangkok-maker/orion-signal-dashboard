# ORION Signal Backend Schema

## Updated Signal Schema

The backend should send signals in the following format:

```json
{
  "id": "mnq-2025-08-31T16:57:38Z",
  "symbol": "MNQ",
  "side": "LONG",
  "status": "CONFIRMED",
  "entry_price": 18895.25,
  "stop_loss": 18870.00,
  "take_profits": [18920.00, 18950.00, 18980.00],
  "tp_modes": ["TP1 50%", "TP2 30%", "Runner 20%"],
  "rr_target": 3.26,
  "confidence": 91,
  "killzone": "PM",
  "time": "2025-08-31T16:57:38-04:00",
  "reason": "MSS+FVG setup"
}
```

## Field Descriptions

- `id`: Unique identifier for the signal
- `symbol`: Trading symbol (MNQ, NQ, MES, etc.)
- `side`: "LONG" or "SHORT"
- `status`: "PENDING", "CONFIRMED", or "INVALIDATED"
- `entry_price`: Entry price level (optional, null if not available)
- `stop_loss`: Stop loss price level (optional, null if not available)
- `take_profits`: Array of take profit price levels (optional, null if not available)
- `tp_modes`: Array of TP labels/allocations (optional, should match take_profits length)
- `rr_target`: Overall risk/reward target (optional)
- `confidence`: Confidence percentage (0-100)
- `killzone`: Trading session (ASIA, LONDON, NY_AM, LUNCH, PM)
- `time`: ISO timestamp of signal generation
- `reason`: Description of setup/reasoning

## WebSocket Message Format

```json
{
  "type": "signal",
  "payload": {
    // Signal object as defined above
  }
}
```

## Example Implementation (Python)

```python
from dataclasses import dataclass
from typing import Optional, List
import json

@dataclass
class OrionSignal:
    id: str
    symbol: str
    side: str  # "LONG" or "SHORT"
    status: str  # "PENDING", "CONFIRMED", "INVALIDATED"
    entry_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profits: Optional[List[float]] = None
    tp_modes: Optional[List[str]] = None
    rr_target: Optional[float] = None
    confidence: Optional[int] = None
    killzone: Optional[str] = None
    time: Optional[str] = None
    reason: Optional[str] = None
    
    def to_websocket_message(self) -> str:
        return json.dumps({
            "type": "signal",
            "payload": {
                "id": self.id,
                "symbol": self.symbol,
                "side": self.side,
                "status": self.status,
                "entry_price": self.entry_price,
                "stop_loss": self.stop_loss,
                "take_profits": self.take_profits,
                "tp_modes": self.tp_modes,
                "rr_target": self.rr_target,
                "confidence": self.confidence,
                "killzone": self.killzone,
                "time": self.time,
                "reason": self.reason
            }
        })

# Example usage
signal = OrionSignal(
    id="mnq-2025-08-31T16:57:38Z",
    symbol="MNQ",
    side="LONG",
    status="CONFIRMED",
    entry_price=18895.25,
    stop_loss=18870.00,
    take_profits=[18920.00, 18950.00, 18980.00],
    tp_modes=["TP1 50%", "TP2 30%", "Runner 20%"],
    confidence=91,
    killzone="PM",
    reason="MSS+FVG setup"
)

websocket_message = signal.to_websocket_message()
```

## Migration Notes

- Existing signals with only `price` field will still work (backward compatibility)
- New fields are optional - UI will hide sections if data is not available
- R:R calculations will only show if both entry_price and stop_loss are provided
- TP sections will only show if take_profits array has elements
