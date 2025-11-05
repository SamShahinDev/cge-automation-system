#!/bin/bash
# Monthly Value Analysis Runner
# Run this script monthly to generate value reports for all clients

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║        Monthly Value-Add Agent                       ║${NC}"
echo -e "${BLUE}║        Crowned Gladiator Enterprises                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}Please edit .env with your credentials and run again.${NC}"
    exit 1
fi

# Load environment
source .env

# Check required variables
if [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${YELLOW}❌ ANTHROPIC_API_KEY not set in .env${NC}"
    exit 1
fi

if [ -z "$CLIENT_SUPABASE_URL" ]; then
    echo -e "${YELLOW}❌ CLIENT_SUPABASE_URL not set in .env${NC}"
    exit 1
fi

# Get client name from argument or environment
CLIENT_NAME=${1:-$CLIENT_NAME}

if [ -z "$CLIENT_NAME" ]; then
    echo -e "${YELLOW}Usage: $0 <client-name>${NC}"
    echo ""
    echo "Available clients:"
    python agent.py 2>/dev/null || echo "  - dirt-free-crm"
    exit 1
fi

echo -e "${GREEN}🚀 Starting monthly analysis for: $CLIENT_NAME${NC}"
echo ""

# Create reports directory
mkdir -p reports logs

# Run analysis
echo -e "${BLUE}Running analysis...${NC}"
python agent.py "$CLIENT_NAME" 2>&1 | tee "logs/analysis-$(date +%Y-%m-%d).log"

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Analysis complete!${NC}"
    echo ""
    echo "📄 Report saved to: reports/"
    echo "📋 Logs saved to: logs/"
    echo ""

    # Find the latest report
    LATEST_REPORT=$(ls -t reports/*.pdf 2>/dev/null | head -1)
    if [ -n "$LATEST_REPORT" ]; then
        echo -e "${GREEN}📊 Latest report: $LATEST_REPORT${NC}"

        # Offer to open report (macOS only)
        if [[ "$OSTYPE" == "darwin"* ]]; then
            read -p "Open report? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                open "$LATEST_REPORT"
            fi
        fi
    fi
else
    echo ""
    echo -e "${YELLOW}❌ Analysis failed. Check logs for details.${NC}"
    exit 1
fi
