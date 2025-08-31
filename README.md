# ORION Signal Dashboard

A premium React + TypeScript trading signal dashboard with real-time WebSocket feeds, built with Vite, TailwindCSS, and Framer Motion.

## Features

- **Real-time Signal Display**: Three-column layout for Pending, Confirmed, and Invalidated signals
- **Multi-TP Support**: Display multiple take profit levels with individual R:R calculations
- **Advanced Trading Levels**: Entry price, stop loss, and multiple take profits with allocation labels
- **WebSocket Integration**: Live connection to signal feeds with automatic reconnection
- **Demo Mode**: Generates realistic signals with multiple TPs when WebSocket URL is not configured
- **Smart Filtering**: Filter by killzone, symbol, or show confirmed signals only
- **Audio Notifications**: Plays sound when confirmed signals arrive
- **Telegram Integration**: Optional webhook notifications for confirmed signals
- **Auto-expiration**: Pending signals expire after 5 minutes if not confirmed
- **Advanced Copy Functions**: Copy formatted trade messages or raw JSON data
- **Premium UI**: Dark theme with smooth animations and clean typography

## Signal Format

Signals are received via WebSocket in the following format:

```json
{
  "type": "signal",
  "payload": {
    "id": "uuid",
    "status": "pending|confirmed|invalidated",
    "direction": "long|short",
    "symbol": "MNQ",
    "entry_time": "2024-01-15T14:30:00Z",
    "entry_price": 18895.25,
    "stop_loss": 18870.00,
    "take_profits": [18920.00, 18950.00, 18980.00],
    "tp_modes": ["TP1 50%", "TP2 30%", "Runner 20%"],
    "price": 18895.25,
    "reason": "MSS+FVG setup",
    "confidence": 0.82,
    "rr_target": 2.0,
    "killzone": "ny_am"
  }
}
```

### New Multi-TP Fields

- `entry_price`: Entry price level (optional, falls back to `price`)
- `stop_loss`: Stop loss price level (optional)
- `take_profits`: Array of take profit price levels (optional)
- `tp_modes`: Array of TP labels/allocations (optional, e.g., ["TP1 50%", "TP2 30%", "Runner 20%"])

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your WebSocket URL and Telegram webhook
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## Environment Variables

- `VITE_SIGNAL_WS_URL`: WebSocket URL for signal feed (optional, enables demo mode if not set)
- `VITE_TELEGRAM_WEBHOOK`: Telegram webhook URL for notifications (optional)

## Demo Mode

If no WebSocket URL is configured, the dashboard automatically enters demo mode:
- Generates random pending signals every 5-15 seconds with realistic multi-TP setups
- Randomly upgrades pending signals to confirmed or invalidated after 15-45 seconds
- Creates 1-4 take profit levels with proper R:R ratios
- Supports all filtering and interaction features

## UI Features

### Signal Cards
Each signal card displays:
- Status badge (Pending/Confirmed/Invalidated)
- Direction badge (Long/Short)
- Symbol and entry price
- Trading levels section with:
  - Entry price
  - Stop loss (in red)
  - Multiple take profits with individual R:R calculations
  - TP allocation labels (e.g., "TP1 50%", "Runner 20%")

### Copy Functions
- **Copy Trade Message**: Formatted message with all levels and R:R info
- **Copy as JSON**: Raw JSON data for development/debugging

### Advanced Features
- Auto-calculated R:R per TP level
- Proper CME futures price formatting (MNQ/NQ: 2 decimals, YM: 0 decimals, etc.)
- Visual indicators for invalidated signals (strikethrough, opacity)
- Responsive grid layout for TP badges

## Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **WebSocket API** for real-time data

## Architecture

- `SignalDashboard.tsx`: Main dashboard component with filters and layout
- `SignalCard.tsx`: Enhanced signal card with multi-TP support
- `useSignalWebSocket.ts`: WebSocket hook with realistic demo mode
- `rr.ts`: R:R calculation utilities
- `format.ts`: Price and time formatting utilities
- `signalUtils.ts`: Audio, Telegram, and messaging utilities

## WebSocket Integration

The dashboard expects WebSocket messages with the `signal` type. Signals can be:
- **New signals**: Added to the appropriate column
- **Updates**: Existing signals updated by ID
- **Status changes**: Pending → Confirmed/Invalidated

## Browser Compatibility

- Modern browsers with WebSocket support
- Web Audio API for notification sounds
- Clipboard API for copy functionality
