#!/bin/bash

# CGE Website Builder using Bridge Agent
# Automates the execution of ENHANCED_PROMPTS.md via Claude Code

set -e  # Exit on error

# Configuration
BRIDGE_DIR="/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/claude-bridge-agent"
PROMPTS_FILE="/Users/royaltyvixion/Documents/cge software/website/ENHANCED_PROMPTS.md"
PROJECT_PATH="/Users/royaltyvixion/Documents/cge software/website/custom-software-site"
START_FROM="${1:-Phase 2, Prompt 3}"  # Default to Phase 2, Prompt 3

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     🚀 CGE Website Builder - Bridge Agent Automation      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📍 Current Start Point: ${START_FROM}${NC}"
echo ""

# Validate paths
if [ ! -d "$BRIDGE_DIR" ]; then
    echo -e "${RED}❌ Error: Bridge agent directory not found${NC}"
    echo "   Expected: $BRIDGE_DIR"
    exit 1
fi

if [ ! -f "$PROMPTS_FILE" ]; then
    echo -e "${RED}❌ Error: ENHANCED_PROMPTS.md not found${NC}"
    echo "   Expected: $PROMPTS_FILE"
    exit 1
fi

if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}❌ Error: Project directory not found${NC}"
    echo "   Expected: $PROJECT_PATH"
    exit 1
fi

echo -e "${GREEN}✅ All paths validated${NC}"
echo ""

# Change to bridge agent directory
cd "$BRIDGE_DIR"

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo -e "${YELLOW}🐍 Activating Python virtual environment...${NC}"
    source venv/bin/activate
else
    echo -e "${YELLOW}⚠️  No virtual environment found at venv/${NC}"
    echo -e "${YELLOW}   Using system Python${NC}"
fi

# Check Python dependencies
echo -e "${YELLOW}🔍 Checking dependencies...${NC}"
if ! python3 -c "import anthropic" 2>/dev/null; then
    echo -e "${RED}❌ Missing dependency: anthropic${NC}"
    echo -e "${YELLOW}   Installing...${NC}"
    pip3 install anthropic
fi

# Check if Redis is running (if needed by bridge agent)
if command -v redis-cli &> /dev/null; then
    if ! redis-cli ping > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Redis not running. Starting Redis...${NC}"
        if command -v redis-server &> /dev/null; then
            redis-server --daemonize yes
            sleep 2
            echo -e "${GREEN}✅ Redis started${NC}"
        else
            echo -e "${YELLOW}⚠️  Redis not installed, skipping...${NC}"
        fi
    else
        echo -e "${GREEN}✅ Redis is running${NC}"
    fi
fi

# Check Claude Code is installed
if ! command -v claude &> /dev/null; then
    echo -e "${RED}❌ Error: Claude Code not found${NC}"
    echo "   Please install Claude Code first"
    exit 1
fi

echo -e "${GREEN}✅ Claude Code found${NC}"
echo ""

# Run the enhanced batch processor
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🚀 Starting Enhanced Batch Processor${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

python3 integrations/enhanced_batch_cli.py \
    --prompts "$PROMPTS_FILE" \
    --project-path "$PROJECT_PATH" \
    --start-from "$START_FROM" \
    --auto-approve \
    --git-commit \
    --delay 30 \
    --timeout 600 \
    --monitor-method files \
    --continue-on-error \
    --no-output-timeout 300

# Check exit status
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║           ✅ Build process completed successfully!         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║              ❌ Build process failed!                      ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    exit 1
fi
