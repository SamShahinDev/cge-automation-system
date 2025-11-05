#!/bin/bash
# Multi-Client Orchestrator Runner

cd "$(dirname "$0")"

echo "🚀 Starting Multi-Client Orchestrator..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env not found. Creating from template..."
    cp .env.example .env
    echo "Please edit .env with your credentials and run again."
    exit 1
fi

# Create necessary directories
mkdir -p logs data

# Start orchestrator
python orchestrator.py start
