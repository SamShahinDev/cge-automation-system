#!/bin/bash

# Claude Bridge Agent Startup Script
# This script starts the bridge agent with all dependencies

set -e

echo "🚀 Starting Claude Bridge Agent..."

# Check if Redis is installed
if ! command -v redis-server &> /dev/null; then
    echo "❌ Redis is not installed. Please install Redis first."
    echo "   macOS: brew install redis"
    echo "   Ubuntu: sudo apt-get install redis-server"
    exit 1
fi

# Check if Claude Code is installed
if ! command -v claude-code &> /dev/null; then
    echo "❌ Claude Code is not installed. Please install it first."
    echo "   Visit: https://docs.anthropic.com/claude/docs/claude-code"
    exit 1
fi

# Check if config.yaml exists
if [ ! -f "config.yaml" ]; then
    echo "❌ config.yaml not found. Please create it first."
    exit 1
fi

# Check if .env exists for API key
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   Please edit .env and add your ANTHROPIC_API_KEY"
        exit 1
    else
        echo "❌ .env.example not found. Please create .env with ANTHROPIC_API_KEY"
        exit 1
    fi
fi

# Create data directories
mkdir -p data/learning data/sessions

# Start Redis if not running
if ! pgrep -x "redis-server" > /dev/null; then
    echo "📦 Starting Redis..."
    redis-server --daemonize yes --port 6379
    sleep 2
else
    echo "✅ Redis already running"
fi

# Check Redis connection
if redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis connected"
else
    echo "❌ Redis connection failed"
    exit 1
fi

# Install Python dependencies if needed
if [ -f "requirements.txt" ]; then
    echo "📦 Checking Python dependencies..."
    pip install -q -r requirements.txt
fi

# Start the bridge
echo "🌉 Starting Bridge Agent on http://localhost:5500"
echo "   Press Ctrl+C to stop"
echo ""

# Load environment variables
set -a
source .env
set +a

# Start with uvicorn
uvicorn main:app --host 0.0.0.0 --port 5500 --reload

# Cleanup on exit
trap "echo '🛑 Stopping services...'; redis-cli shutdown; exit" INT TERM
