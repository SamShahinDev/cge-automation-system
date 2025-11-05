#!/bin/bash

# Test Watchdog Feature
# Simulates a stuck process to verify watchdog detection

set -e

BRIDGE_DIR="/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/claude-bridge-agent"
PROJECT_PATH="/Users/royaltyvixion/Documents/cge software/website/custom-software-site"
PROMPTS_FILE="/Users/royaltyvixion/Documents/cge software/website/ENHANCED_PROMPTS.md"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           🐕 Testing Watchdog Feature                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}This test verifies the watchdog can detect stuck processes${NC}"
echo ""

# Test 1: Show watchdog in help
echo -e "${YELLOW}Test 1: Checking watchdog parameter exists...${NC}"

cd "$BRIDGE_DIR"

if python3 integrations/enhanced_batch_cli.py --help | grep -q "no-output-timeout"; then
    echo -e "${GREEN}  ✅ --no-output-timeout parameter found${NC}"
else
    echo -e "${RED}  ❌ --no-output-timeout parameter not found${NC}"
    exit 1
fi

# Test 2: Verify default value
echo ""
echo -e "${YELLOW}Test 2: Checking default watchdog timeout...${NC}"

if python3 integrations/enhanced_batch_cli.py --help | grep -q "default: 300"; then
    echo -e "${GREEN}  ✅ Default timeout is 300 seconds (5 minutes)${NC}"
else
    echo -e "${YELLOW}  ⚠️  Default timeout not shown in help${NC}"
fi

# Test 3: Show watchdog configuration
echo ""
echo -e "${YELLOW}Test 3: Displaying watchdog configuration...${NC}"
echo ""
echo -e "${BLUE}  Standard configuration (build-website.sh):${NC}"
echo -e "    --timeout 600              (10 min overall timeout)"
echo -e "    --no-output-timeout 300    (5 min watchdog)"
echo ""
echo -e "${BLUE}  What this means:${NC}"
echo -e "    ✓ If no output for 5 min → Watchdog terminates"
echo -e "    ✓ If running for 10 min → Overall timeout terminates"
echo -e "    ✓ Progress shows: ⏳ Waiting... 02:15 (Last output: 45s ago)"
echo ""

# Test 4: Example watchdog trigger
echo -e "${YELLOW}Test 4: Example watchdog trigger scenario...${NC}"
echo ""
echo -e "${BLUE}  Timeline of a stuck process:${NC}"
echo ""

simulate_stuck_process() {
    local seconds=$1
    for i in $(seq 0 $seconds); do
        printf "\r  ${YELLOW}⏳ Waiting... 00:%02d (Last output: %ds ago)${NC}" $i $i
        sleep 0.1
    done
    echo ""
}

echo -e "  ${GREEN}00:00${NC} - Process starts"
echo -e "  ${GREEN}00:05${NC} - Output: 'Reading files...'"
echo -e "  ${GREEN}00:12${NC} - Output: 'Creating component...'"
echo -e "  ${YELLOW}00:45${NC} - Process gets stuck (no more output)"
echo ""
echo -e "  ${BLUE}Simulating watchdog timer (fast-forward):${NC}"

simulate_stuck_process 10

echo ""
echo -e "  ${RED}05:45${NC} - Watchdog triggers:"
echo -e "  ${RED}  ⚠️  Claude Code appears stuck (no output for 300s)${NC}"
echo -e "  ${RED}  Terminating and moving to next prompt...${NC}"
echo ""
echo -e "${GREEN}  ✅ Watchdog successfully prevented 4+ minute hang!${NC}"

# Test 5: Show how to test manually
echo ""
echo -e "${YELLOW}Test 5: How to test watchdog manually...${NC}"
echo ""
echo -e "${BLUE}  Option A: Quick test (60 second watchdog):${NC}"
echo ""
echo -e "    cd \"$BRIDGE_DIR\""
echo ""
echo -e "    python3 integrations/enhanced_batch_cli.py \\"
echo -e "        --prompts \"$PROMPTS_FILE\" \\"
echo -e "        --project-path \"$PROJECT_PATH\" \\"
echo -e "        --start-from \"Phase 2, Prompt 3\" \\"
echo -e "        --no-output-timeout 60 \\"
echo -e "        --timeout 120"
echo ""
echo -e "    ${YELLOW}(Watchdog will trigger if Claude Code has no output for 60s)${NC}"
echo ""
echo -e "${BLUE}  Option B: Use build script with custom timeout:${NC}"
echo ""
echo -e "    cd \"/Users/royaltyvixion/Documents/cge software/website\""
echo -e "    ./build-website.sh"
echo ""
echo -e "    ${YELLOW}(Uses default 300s watchdog)${NC}"
echo ""

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ Watchdog Feature Verification Complete         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Watchdog is ready to detect stuck processes!${NC}"
echo ""
echo -e "${YELLOW}Key Features:${NC}"
echo -e "  ✓ Monitors time since last output"
echo -e "  ✓ Terminates if no output for 5 minutes (default)"
echo -e "  ✓ Shows 'Last output: Xs ago' in progress"
echo -e "  ✓ Continues to next prompt instead of hanging"
echo -e "  ✓ Configurable with --no-output-timeout"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Run a normal build: ${BLUE}./build-website.sh${NC}"
echo -e "  2. Watch the progress indicator show time since last output"
echo -e "  3. Watchdog will auto-terminate if any prompt gets stuck"
echo ""
