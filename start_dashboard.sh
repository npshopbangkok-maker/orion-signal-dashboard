#!/bin/bash

# ORION Signal Dashboard Startup Script
# Starts the complete FastAPI backend serving React frontend

echo "🚀 Starting ORION Signal Dashboard..."
echo "======================================"

# Check if Python dependencies are installed
echo "🔍 Checking Python dependencies..."
if ! python3 -c "import fastapi, uvicorn, websockets" 2>/dev/null; then
    echo "📦 Installing Python dependencies..."
    python3 -m pip install -r requirements.txt
fi

# Check if React frontend is built
echo "🔍 Checking React frontend build..."
if [ ! -d "dist" ] || [ ! -f "dist/index.html" ]; then
    echo "🏗️ Building React frontend..."
    if command -v npm &> /dev/null; then
        npm install
        npm run build
    else
        echo "❌ npm not found. Please install Node.js and run 'npm run build'"
        exit 1
    fi
fi

# Check for environment configuration
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env from .env.example..."
    cp .env.example .env
    echo "📝 Edit .env to add your Databento API key if needed"
fi

echo ""
echo "✅ All checks passed!"
echo ""
echo "🌐 Starting FastAPI server..."
echo "   Frontend: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   WebSocket: ws://localhost:8000/ws/signals"
echo ""
echo "📊 Features:"
echo "   • React frontend served from /dist"
echo "   • Real-time MNQ.v.0 signals (ORIONAI_MAX algorithm)"
echo "   • EMA cross + ATR strategy"
echo "   • WebSocket live price feeds"
echo "   • Demo mode (if no Databento API key)"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo "======================================"

# Start the FastAPI server
python3 main.py