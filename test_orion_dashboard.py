#!/usr/bin/env python3
"""
Test script to verify ORION Signal Dashboard functionality
"""

import asyncio
import websockets
import json
import aiohttp
from datetime import datetime

async def test_websocket_connection():
    """Test WebSocket connection and signal reception"""
    uri = "ws://localhost:8000/ws/signals"
    
    try:
        async with websockets.connect(uri) as websocket:
            print("🔗 Connected to WebSocket")
            
            # Send subscription message
            subscription = {
                "type": "subscribe",
                "channels": ["signals", "prices"],
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
            await websocket.send(json.dumps(subscription))
            print("📡 Sent subscription request")
            
            # Listen for messages for 30 seconds
            timeout = 30
            start_time = asyncio.get_event_loop().time()
            
            while asyncio.get_event_loop().time() - start_time < timeout:
                try:
                    message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
                    data = json.loads(message)
                    
                    if data["type"] == "connection":
                        print("✅ Connection confirmed")
                    elif data["type"] == "subscription":
                        print(f"✅ Subscribed to channels: {data['payload']['channels']}")
                    elif data["type"] == "signal":
                        print(f"🚨 Signal received: {data['payload']['id']}")
                        print(f"   Direction: {data['payload']['direction']}")
                        print(f"   Symbol: {data['payload']['symbol']}")
                        print(f"   Entry: {data['payload']['entry_price']}")
                        print(f"   R:R: {data['payload']['rr_target']}")
                    elif data["type"] == "price_update":
                        price = data['payload']['price']
                        symbol = data['payload']['symbol']
                        print(f"💰 Price update: {symbol} = ${price}")
                    
                except asyncio.TimeoutError:
                    continue
                    
            print("⏰ Test completed")
            
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")

async def test_api_endpoints():
    """Test REST API endpoints"""
    base_url = "http://localhost:8000"
    
    async with aiohttp.ClientSession() as session:
        # Test health endpoint
        async with session.get(f"{base_url}/api/health") as resp:
            health = await resp.json()
            print(f"🏥 Health check: {health['status']}")
            print(f"   Databento connected: {health['databento_connected']}")
            print(f"   Algorithm status: {health['algorithm_status']}")
        
        # Test analysis endpoint
        async with session.get(f"{base_url}/api/signals/analysis") as resp:
            analysis = await resp.json()
            print(f"🤖 Algorithm analysis: {analysis['analysis']['status']}")
        
        # Test historical data
        async with session.get(f"{base_url}/api/historical/MNQ.v.0?days=1") as resp:
            if resp.status == 200:
                historical = await resp.json()
                print(f"📈 Historical data: {len(historical['data'])} records")
            else:
                print(f"📈 Historical data: Error {resp.status}")

async def main():
    """Run all tests"""
    print("🧪 Starting ORION Signal Dashboard tests...\n")
    
    print("1. Testing API endpoints:")
    await test_api_endpoints()
    
    print("\n2. Testing WebSocket connection:")
    await test_websocket_connection()
    
    print("\n✅ All tests completed!")

if __name__ == "__main__":
    asyncio.run(main())