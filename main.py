"""
ORION Signal Dashboard - FastAPI Backend
Serves React frontend and provides real-time trading signals for MNQ.v.0
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from databento_client import DabentoClient
from orion_algorithm import OrionAIMaxAlgorithm
from websocket_handler import WebSocketManager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="ORION Signal Dashboard API",
    description="FastAPI backend for ORION trading signals dashboard",
    version="1.0.0"
)

# Configure CORS for WebSocket and API access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
databento_client = DabentoClient()
orion_algorithm = OrionAIMaxAlgorithm()
websocket_manager = WebSocketManager()

# Background task for processing live data
background_tasks = set()

@app.on_event("startup")
async def startup_event():
    """Initialize connections and start background tasks"""
    logger.info("🚀 Starting ORION Signal Dashboard API...")
    
    # Initialize Databento connection
    await databento_client.initialize()
    
    # Start live data streaming task
    task = asyncio.create_task(live_data_stream())
    background_tasks.add(task)
    task.add_done_callback(background_tasks.discard)
    
    logger.info("✅ ORION API startup complete")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down ORION API...")
    await databento_client.close()
    await websocket_manager.disconnect_all()

# WebSocket endpoint for real-time signals
@app.websocket("/ws/signals")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time trading signals"""
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            await websocket_manager.handle_message(websocket, data)
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# API endpoint for historical data
@app.get("/api/historical/{symbol}")
async def get_historical_data(symbol: str, days: int = 7):
    """Get historical trading data for analysis"""
    try:
        end_time = datetime.utcnow()
        start_time = end_time - timedelta(days=days)
        
        historical_data = await databento_client.get_historical_data(
            symbol=symbol,
            start_time=start_time,
            end_time=end_time
        )
        
        return {
            "symbol": symbol,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "data": historical_data
        }
    except Exception as e:
        logger.error(f"Error fetching historical data: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# API endpoint for signal analysis
@app.get("/api/signals/analysis")
async def get_signal_analysis():
    """Get current signal analysis and algorithm status"""
    try:
        analysis = await orion_algorithm.get_current_analysis()
        return {
            "timestamp": datetime.utcnow().isoformat(),
            "algorithm": "ORIONAI_MAX",
            "status": "active",
            "analysis": analysis
        }
    except Exception as e:
        logger.error(f"Error getting signal analysis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Health check endpoint
@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "databento_connected": databento_client.is_connected(),
        "active_connections": websocket_manager.connection_count(),
        "algorithm_status": "active"
    }

async def live_data_stream():
    """Background task for processing live market data and generating signals"""
    logger.info("🔄 Starting live data stream for MNQ.v.0...")
    
    while True:
        try:
            # Get live market data from Databento
            live_data = await databento_client.get_live_data("MNQ.v.0")
            
            if live_data:
                # Process data through ORIONAI_MAX algorithm
                signals = await orion_algorithm.process_tick(live_data)
                
                # Send any new signals to connected clients
                for signal in signals:
                    await websocket_manager.broadcast_signal(signal)
                
                # Send price updates
                price_update = {
                    "type": "price_update",
                    "payload": {
                        "symbol": "MNQ",
                        "price": live_data.get("price", 0),
                        "timestamp": datetime.utcnow().isoformat(),
                        "change": live_data.get("change", 0),
                        "change_percent": live_data.get("change_percent", 0),
                        "volume": live_data.get("volume", 0)
                    }
                }
                await websocket_manager.broadcast_message(price_update)
            
            # Wait before next iteration
            await asyncio.sleep(1)  # 1 second intervals for live data
            
        except Exception as e:
            logger.error(f"Error in live data stream: {e}")
            await asyncio.sleep(5)  # Wait 5 seconds before retrying

# Serve React static files
dist_path = Path(__file__).parent / "dist"
if dist_path.exists():
    # Mount static assets
    app.mount("/assets", StaticFiles(directory=str(dist_path / "assets")), name="assets")
    
    # Serve index.html for all other routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve React SPA for all frontend routes"""
        # Return index.html for all routes that don't start with /api or /ws
        if not full_path.startswith(("api/", "ws/", "assets/")):
            return FileResponse(str(dist_path / "index.html"))
        raise HTTPException(status_code=404, detail="Not found")

else:
    logger.warning("⚠️ React dist folder not found. Please run 'npm run build' first.")

if __name__ == "__main__":
    # Development server
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000,
        reload=True,
        log_level="info"
    )