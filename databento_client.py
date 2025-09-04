"""
Databento Client for ORION Signal Dashboard
Handles historical and live data for MNQ.v.0 from GLBX.MDP3 dataset
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import json

try:
    import databento as db
    from databento import MboMsg, OhlcvMsg, TradeMsg
    DATABENTO_AVAILABLE = True
except ImportError:
    DATABENTO_AVAILABLE = False
    MboMsg = TradeMsg = OhlcvMsg = None

logger = logging.getLogger(__name__)

class DabentoClient:
    """Databento client for MNQ.v.0 historical and live data"""
    
    def __init__(self):
        self.api_key = os.getenv("DATABENTO_API_KEY")
        self.client = None
        self.live_client = None
        self.is_initialized = False
        self.last_price = 0.0
        self.price_history = []
        
        # Demo mode fallback if Databento not available
        self.demo_mode = not DATABENTO_AVAILABLE or not self.api_key
        
        if self.demo_mode:
            logger.warning("⚠️ Databento not available or API key missing - using demo mode")
        
    async def initialize(self):
        """Initialize Databento connections"""
        if self.demo_mode:
            logger.info("📊 Initializing demo mode for MNQ data...")
            self.last_price = 18850.0  # Starting price for MNQ
            self.is_initialized = True
            return
            
        try:
            # Initialize historical data client
            self.client = db.Historical(key=self.api_key)
            
            # Initialize live data client  
            self.live_client = db.Live(key=self.api_key)
            
            logger.info("✅ Databento client initialized successfully")
            self.is_initialized = True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Databento: {e}")
            logger.info("📊 Falling back to demo mode...")
            self.demo_mode = True
            self.last_price = 18850.0
            self.is_initialized = True
    
    def is_connected(self) -> bool:
        """Check if client is connected"""
        return self.is_initialized
    
    async def get_historical_data(
        self, 
        symbol: str, 
        start_time: datetime, 
        end_time: datetime,
        schema: str = "ohlcv-1m"
    ) -> List[Dict[str, Any]]:
        """Get historical OHLCV data for the symbol"""
        
        if self.demo_mode:
            return await self._generate_demo_historical_data(symbol, start_time, end_time)
        
        try:
            # Request historical data from Databento
            data = self.client.timeseries.get_range(
                dataset="GLBX.MDP3",
                symbols=symbol,
                schema=schema,
                start=start_time,
                end=end_time,
                limit=10000
            )
            
            # Convert to list of dictionaries
            historical_data = []
            for record in data:
                if isinstance(record, OhlcvMsg):
                    historical_data.append({
                        "timestamp": record.ts_event,
                        "open": record.open / 1e9,  # Convert from fixed-point
                        "high": record.high / 1e9,
                        "low": record.low / 1e9,
                        "close": record.close / 1e9,
                        "volume": record.volume
                    })
            
            logger.info(f"📈 Retrieved {len(historical_data)} historical records for {symbol}")
            return historical_data
            
        except Exception as e:
            logger.error(f"❌ Error fetching historical data: {e}")
            # Fallback to demo data
            return await self._generate_demo_historical_data(symbol, start_time, end_time)
    
    async def get_live_data(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get live market data for the symbol"""
        
        if self.demo_mode:
            return await self._generate_demo_live_data(symbol)
        
        try:
            # In a real implementation, this would be a continuous stream
            # For now, we'll simulate with recent data
            end_time = datetime.utcnow()
            start_time = end_time - timedelta(minutes=1)
            
            data = self.client.timeseries.get_range(
                dataset="GLBX.MDP3",
                symbols=symbol,
                schema="mbo",
                start=start_time,
                end=end_time,
                limit=1
            )
            
            for record in data:
                if isinstance(record, (MboMsg, TradeMsg)):
                    price = record.price / 1e9 if hasattr(record, 'price') else 0
                    change = price - self.last_price if self.last_price > 0 else 0
                    change_percent = (change / self.last_price * 100) if self.last_price > 0 else 0
                    
                    self.last_price = price
                    
                    return {
                        "symbol": symbol,
                        "price": price,
                        "timestamp": record.ts_event,
                        "change": change,
                        "change_percent": change_percent,
                        "volume": getattr(record, 'size', 0),
                        "side": getattr(record, 'side', 'unknown')
                    }
                    
        except Exception as e:
            logger.error(f"❌ Error fetching live data: {e}")
            return await self._generate_demo_live_data(symbol)
        
        return None
    
    async def _generate_demo_historical_data(
        self, 
        symbol: str, 
        start_time: datetime, 
        end_time: datetime
    ) -> List[Dict[str, Any]]:
        """Generate realistic demo historical data"""
        import random
        
        historical_data = []
        current_time = start_time
        current_price = 18850.0  # Starting price for MNQ
        
        while current_time < end_time:
            # Generate realistic price movement
            price_change = random.uniform(-50.0, 50.0)
            current_price += price_change
            
            # Keep price in reasonable range
            current_price = max(18000.0, min(19500.0, current_price))
            
            # Generate OHLCV data
            open_price = current_price
            high_price = current_price + random.uniform(0, 25.0)
            low_price = current_price - random.uniform(0, 25.0)
            close_price = current_price + random.uniform(-10.0, 10.0)
            volume = random.randint(100, 5000)
            
            historical_data.append({
                "timestamp": int(current_time.timestamp() * 1e9),
                "open": round(open_price, 2),
                "high": round(high_price, 2),
                "low": round(low_price, 2),
                "close": round(close_price, 2),
                "volume": volume
            })
            
            current_price = close_price
            current_time += timedelta(minutes=1)
        
        logger.info(f"📊 Generated {len(historical_data)} demo historical records for {symbol}")
        return historical_data
    
    async def _generate_demo_live_data(self, symbol: str) -> Dict[str, Any]:
        """Generate realistic demo live data"""
        import random
        
        # Simulate price movement
        price_change = random.uniform(-2.0, 2.0)
        self.last_price += price_change
        
        # Keep price in reasonable range
        self.last_price = max(18000.0, min(19500.0, self.last_price))
        
        # Calculate change metrics
        if len(self.price_history) > 0:
            previous_price = self.price_history[-1]
            change = self.last_price - previous_price
            change_percent = (change / previous_price * 100) if previous_price > 0 else 0
        else:
            change = 0
            change_percent = 0
        
        # Keep price history for calculations
        self.price_history.append(self.last_price)
        if len(self.price_history) > 100:  # Keep last 100 prices
            self.price_history.pop(0)
        
        return {
            "symbol": symbol,
            "price": round(self.last_price, 2),
            "timestamp": int(datetime.utcnow().timestamp() * 1e9),
            "change": round(change, 2),
            "change_percent": round(change_percent, 3),
            "volume": random.randint(10, 500),
            "side": random.choice(['buy', 'sell'])
        }
    
    async def close(self):
        """Close Databento connections"""
        try:
            if self.live_client:
                await self.live_client.close()
            logger.info("✅ Databento connections closed")
        except Exception as e:
            logger.error(f"❌ Error closing Databento connections: {e}")