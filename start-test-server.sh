#!/bin/bash

# Orion Integration Test Script
echo "🚀 Starting Orion Integration Test Environment"
echo "=============================================="

# Kill any existing server
echo "🔧 Stopping existing servers..."
pkill -f "local-test-server.js" 2>/dev/null || true

# Start local test server
echo "📡 Starting local test server..."
cd /Volumes/Extreme\ SSD/ORION_DB
node local-test-server.js &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 3

# Test local endpoint with auth
echo "🧪 Testing local endpoint with auth..."
curl -X POST "http://localhost:3000/api/signals" \
-H "Content-Type: application/json" \
-H "Authorization: Bearer test-auth-token-123" \
-d '{
  "signal_type": "test",
  "id": "integration-test-'$(date +%s)'",
  "symbol": "EURUSD",
  "direction": "long", 
  "entry_time": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
  "price": 1.0950,
  "entry_price": 1.0950,
  "stop_loss": 1.0900,
  "take_profits": [1.1000],
  "reason": "Integration test script with auth",
  "confidence": 85,
  "rr_target": 2.0,
  "killzone": "Test Session",
  "status": "confirmed",
  "dry_run": true
}' && echo

echo ""
echo "📊 Server running on PID: $SERVER_PID"
echo "🎯 HTTP endpoint: http://localhost:3000/api/signals"
echo "🔌 WebSocket endpoint: ws://localhost:3000/ws/signals"
echo "💚 Health check: http://localhost:3000/health"
echo ""
echo "🔧 To stop server: kill $SERVER_PID"
echo "🔧 Or use: pkill -f local-test-server.js"
echo ""
echo "✅ Ready for Orion backend integration!"
