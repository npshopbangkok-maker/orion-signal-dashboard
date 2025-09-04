# ORION Signal Dashboard - FastAPI Backend

A complete single-server solution that serves the React frontend and provides real-time trading signals for MNQ.v.0 using the ORIONAI_MAX algorithm (EMA cross + ATR).

## 🚀 Features

- **FastAPI Server**: Serves the built React frontend from `/dist` folder
- **Databento Integration**: Fetches historical and live data for MNQ.v.0 from GLBX.MDP3 dataset
- **ORIONAI_MAX Algorithm**: EMA crossover strategy with ATR-based stop loss and take profit levels
- **Real-time WebSocket**: Streams live trading signals and price updates
- **Demo Mode**: Automatic fallback when Databento API key is not configured
- **RESTful API**: Endpoints for health checks, historical data, and algorithm analysis

## 📊 ORIONAI_MAX Algorithm

The trading algorithm implements:
- **EMA Cross Strategy**: Fast EMA (9) crossing Slow EMA (21)
- **ATR Risk Management**: Stop loss and take profit levels based on Average True Range
- **Multiple Take Profits**: 3 levels with proper risk-reward ratios
- **Killzone Detection**: Asia, London, NY AM, Lunch, PM sessions
- **Signal Confirmation**: Pending → Confirmed/Invalidated status updates

### Signal Format
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
    "tp_modes": ["TP1 40%", "TP2 35%", "Runner 25%"],
    "reason": "EMA9x21 cross + ATR(25.5)",
    "confidence": 0.82,
    "rr_target": 2.0,
    "killzone": "ny_am"
  }
}
```

## 🏗️ Setup & Installation

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Configuration
```bash
cp .env.example .env
# Edit .env to add your Databento API key (optional)
DATABENTO_API_KEY=your_api_key_here
```

### 3. Build React Frontend (if not already built)
```bash
npm install
npm run build
```

### 4. Start the Server
```bash
python main.py
```

The server will start on `http://localhost:8000`

## 📡 API Endpoints

### REST Endpoints
- `GET /api/health` - Health check and system status
- `GET /api/signals/analysis` - Current algorithm analysis
- `GET /api/historical/{symbol}?days=7` - Historical market data
- `GET /` - Serves React frontend (SPA routing)

### WebSocket Endpoint
- `ws://localhost:8000/ws/signals` - Real-time signals and price updates

### WebSocket Usage
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/signals');

ws.onopen = () => {
  // Subscribe to channels
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['signals', 'prices'],
    timestamp: new Date().toISOString()
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data.type, data.payload);
};
```

## 🗃️ File Structure

```
├── main.py                 # FastAPI server with static file serving
├── databento_client.py     # Databento data integration
├── orion_algorithm.py      # ORIONAI_MAX trading algorithm
├── websocket_handler.py    # WebSocket connection management
├── requirements.txt        # Python dependencies
├── test_orion_dashboard.py # Test script for verification
└── dist/                   # React frontend build output
    ├── index.html
    └── assets/
```

## 🔧 Technical Details

### Dependencies
- **FastAPI**: Web framework and API server
- **Uvicorn**: ASGI server with WebSocket support  
- **Databento**: Market data provider (optional)
- **WebSockets**: Real-time communication
- **Pandas/Numpy**: Data processing for technical analysis

### Demo Mode
When Databento API key is not configured, the system automatically enters demo mode:
- Generates realistic MNQ price movements
- Creates 1440 historical data points (1 day of minute bars)
- Simulates live price feeds every second
- Algorithm generates signals based on demo data

### Algorithm Parameters
- **Fast EMA**: 9 periods
- **Slow EMA**: 21 periods  
- **ATR Period**: 14 periods
- **ATR Multiplier**: 2.0 for stop loss
- **Take Profit Levels**: 1.5x, 2.5x, 4.0x ATR
- **Minimum R:R**: 1.5:1 to generate signal
- **Signal Cooldown**: 15 minutes between signals

## 🧪 Testing

Run the test script to verify all functionality:
```bash
python test_orion_dashboard.py
```

The test verifies:
- ✅ API endpoints respond correctly
- ✅ WebSocket connections work
- ✅ Real-time price updates stream
- ✅ Historical data is available
- ✅ Algorithm is processing data

## 🔒 Production Deployment

For production deployment:

1. **Set Databento API Key**: Add real API key to environment
2. **Configure SSL**: Use reverse proxy (nginx) for HTTPS/WSS
3. **Process Manager**: Use PM2 or systemd for process management
4. **Monitoring**: Add logging and monitoring for signals and connections
5. **Scaling**: Consider load balancing for multiple connections

### Example Deployment Commands
```bash
# Production server with SSL termination
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# With PM2 process manager  
pm2 start main.py --interpreter python3 --name orion-dashboard
```

## 📈 Live Trading Integration

The dashboard is designed to integrate with:
- **Databento**: Real market data for MNQ.v.0 from GLBX.MDP3
- **TopstepX**: Auto-trading integration (when enabled)
- **LINE Notify**: Signal notifications to mobile devices
- **WebSocket Clients**: Any trading platform that supports WebSocket

## 🚨 Signal Generation

Signals are generated when:
1. **EMA Crossover** occurs (9 EMA crosses 21 EMA)
2. **ATR Volatility** provides good risk-reward setup
3. **Market Hours** are within defined killzones
4. **Cooldown Period** has elapsed since last signal
5. **Risk-Reward** ratio exceeds 1.5:1

Signals automatically update from `pending` → `confirmed`/`invalidated` after 30-120 seconds based on market confirmation.

---

**🎯 Result**: Complete single-server dashboard serving React frontend with real-time MNQ.v.0 signals from ORIONAI_MAX algorithm!**