"""
WebSocket Manager for ORION Signal Dashboard
Handles real-time connections and message broadcasting
"""

import json
import logging
from typing import List, Dict, Any, Set
from datetime import datetime
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketManager:
    """Manages WebSocket connections for real-time signal distribution"""
    
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
        self.subscriptions: Dict[WebSocket, List[str]] = {}
        
    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.add(websocket)
        logger.info(f"🔗 New WebSocket connection. Total: {len(self.active_connections)}")
        
        # Send welcome message
        welcome_message = {
            "type": "connection",
            "payload": {
                "status": "connected",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "server": "ORION Signal Dashboard API",
                "version": "1.0.0"
            }
        }
        await self._send_to_websocket(websocket, welcome_message)
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if websocket in self.subscriptions:
            del self.subscriptions[websocket]
        logger.info(f"❌ WebSocket disconnected. Total: {len(self.active_connections)}")
    
    async def disconnect_all(self):
        """Disconnect all WebSocket connections"""
        for websocket in self.active_connections.copy():
            try:
                await websocket.close()
            except Exception as e:
                logger.error(f"Error closing websocket: {e}")
        self.active_connections.clear()
        self.subscriptions.clear()
        logger.info("🔌 All WebSocket connections closed")
    
    async def handle_message(self, websocket: WebSocket, message: str):
        """Handle incoming message from WebSocket client"""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "subscribe":
                await self._handle_subscription(websocket, data)
            elif message_type == "ping":
                await self._handle_ping(websocket, data)
            else:
                logger.warning(f"Unknown message type: {message_type}")
                
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON received: {message}")
        except Exception as e:
            logger.error(f"Error handling message: {e}")
    
    async def _handle_subscription(self, websocket: WebSocket, data: Dict[str, Any]):
        """Handle subscription request"""
        channels = data.get("channels", [])
        self.subscriptions[websocket] = channels
        
        logger.info(f"📡 Client subscribed to channels: {channels}")
        
        # Send subscription confirmation
        response = {
            "type": "subscription",
            "payload": {
                "status": "subscribed",
                "channels": channels,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
        await self._send_to_websocket(websocket, response)
    
    async def _handle_ping(self, websocket: WebSocket, data: Dict[str, Any]):
        """Handle ping message with pong response"""
        pong_response = {
            "type": "pong",
            "payload": {
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "client_timestamp": data.get("timestamp")
            }
        }
        await self._send_to_websocket(websocket, pong_response)
    
    async def broadcast_signal(self, signal: Dict[str, Any]):
        """Broadcast trading signal to subscribed clients"""
        await self._broadcast_to_channel("signals", signal)
        logger.info(f"📡 Broadcasted signal: {signal['payload']['id']}")
    
    async def broadcast_message(self, message: Dict[str, Any]):
        """Broadcast general message to all connected clients"""
        await self._broadcast_to_all(message)
    
    async def broadcast_price_update(self, price_data: Dict[str, Any]):
        """Broadcast price update to subscribed clients"""
        await self._broadcast_to_channel("prices", price_data)
    
    async def _broadcast_to_channel(self, channel: str, message: Dict[str, Any]):
        """Broadcast message to clients subscribed to specific channel"""
        if not self.active_connections:
            return
        
        disconnected = set()
        
        for websocket in self.active_connections:
            # Check if client is subscribed to this channel
            client_channels = self.subscriptions.get(websocket, [])
            if channel not in client_channels:
                continue
            
            try:
                await self._send_to_websocket(websocket, message)
            except Exception as e:
                logger.error(f"Error sending to websocket: {e}")
                disconnected.add(websocket)
        
        # Clean up disconnected websockets
        for websocket in disconnected:
            self.disconnect(websocket)
    
    async def _broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast message to all connected clients"""
        if not self.active_connections:
            return
        
        disconnected = set()
        
        for websocket in self.active_connections:
            try:
                await self._send_to_websocket(websocket, message)
            except Exception as e:
                logger.error(f"Error sending to websocket: {e}")
                disconnected.add(websocket)
        
        # Clean up disconnected websockets
        for websocket in disconnected:
            self.disconnect(websocket)
    
    async def _send_to_websocket(self, websocket: WebSocket, message: Dict[str, Any]):
        """Send message to a specific WebSocket"""
        message_str = json.dumps(message)
        await websocket.send_text(message_str)
    
    def connection_count(self) -> int:
        """Get number of active connections"""
        return len(self.active_connections)
    
    def get_connection_stats(self) -> Dict[str, Any]:
        """Get WebSocket connection statistics"""
        channel_stats = {}
        
        for websocket, channels in self.subscriptions.items():
            for channel in channels:
                if channel not in channel_stats:
                    channel_stats[channel] = 0
                channel_stats[channel] += 1
        
        return {
            "total_connections": len(self.active_connections),
            "subscribed_connections": len(self.subscriptions),
            "channel_subscriptions": channel_stats,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    
    async def send_system_message(self, message_type: str, content: Dict[str, Any]):
        """Send system message to all connected clients"""
        system_message = {
            "type": message_type,
            "payload": {
                **content,
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "source": "system"
            }
        }
        await self._broadcast_to_all(system_message)
    
    async def send_status_update(self, status: str, details: str = ""):
        """Send status update to all clients"""
        await self.send_system_message("status", {
            "status": status,
            "details": details
        })
    
    async def send_algorithm_status(self, algorithm_data: Dict[str, Any]):
        """Send algorithm status update"""
        await self.send_system_message("algorithm_status", algorithm_data)