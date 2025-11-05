#!/bin/bash

# Test Script - Verify Bridge Agent Setup
# This script tests the configuration without executing any prompts

set -e

# Configuration
BRIDGE_DIR="/Users/royaltyvixion/Documents/cge software/cge sdk agents/automation-agents/claude-bridge-agent"
PROMPTS_FILE="/Users/royaltyvixion/Documents/cge software/website/ENHANCED_PROMPTS.md"
PROJECT_PATH="/Users/royaltyvixion/Documents/cge software/website/custom-software-site"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║          🧪 CGE Website Builder - Setup Test              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Check paths
echo -e "${YELLOW}Test 1: Checking file paths...${NC}"

if [ -d "$BRIDGE_DIR" ]; then
    echo -e "${GREEN}  ✅ Bridge agent directory found${NC}"
else
    echo -e "${RED}  ❌ Bridge agent directory not found${NC}"
    exit 1
fi

if [ -f "$PROMPTS_FILE" ]; then
    echo -e "${GREEN}  ✅ ENHANCED_PROMPTS.md found${NC}"
else
    echo -e "${RED}  ❌ ENHANCED_PROMPTS.md not found${NC}"
    exit 1
fi

if [ -d "$PROJECT_PATH" ]; then
    echo -e "${GREEN}  ✅ Project directory found${NC}"
else
    echo -e "${RED}  ❌ Project directory not found${NC}"
    exit 1
fi

# Test 2: Check config.yaml
echo ""
echo -e "${YELLOW}Test 2: Checking config.yaml...${NC}"

if [ -f "$BRIDGE_DIR/config.yaml" ]; then
    echo -e "${GREEN}  ✅ config.yaml found${NC}"

    # Check if cge-website project is configured
    if grep -q "cge-website:" "$BRIDGE_DIR/config.yaml"; then
        echo -e "${GREEN}  ✅ cge-website project configured${NC}"
    else
        echo -e "${RED}  ❌ cge-website project not found in config.yaml${NC}"
        exit 1
    fi
else
    echo -e "${RED}  ❌ config.yaml not found${NC}"
    exit 1
fi

# Test 3: Check batch processor
echo ""
echo -e "${YELLOW}Test 3: Checking batch processor...${NC}"

if [ -f "$BRIDGE_DIR/integrations/enhanced_batch_cli.py" ]; then
    echo -e "${GREEN}  ✅ enhanced_batch_cli.py found${NC}"

    if [ -x "$BRIDGE_DIR/integrations/enhanced_batch_cli.py" ]; then
        echo -e "${GREEN}  ✅ enhanced_batch_cli.py is executable${NC}"
    else
        echo -e "${YELLOW}  ⚠️  enhanced_batch_cli.py not executable (should be ok)${NC}"
    fi
else
    echo -e "${RED}  ❌ enhanced_batch_cli.py not found${NC}"
    exit 1
fi

# Test 4: Check Python
echo ""
echo -e "${YELLOW}Test 4: Checking Python environment...${NC}"

if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}  ✅ Python found: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}  ❌ Python3 not found${NC}"
    exit 1
fi

# Test 5: Check Claude Code
echo ""
echo -e "${YELLOW}Test 5: Checking Claude Code...${NC}"

if command -v claude &> /dev/null; then
    echo -e "${GREEN}  ✅ Claude Code found${NC}"
else
    echo -e "${RED}  ❌ Claude Code not found${NC}"
    echo -e "${YELLOW}     Please install Claude Code to continue${NC}"
    exit 1
fi

# Test 6: Parse ENHANCED_PROMPTS.md
echo ""
echo -e "${YELLOW}Test 6: Parsing ENHANCED_PROMPTS.md...${NC}"

cd "$BRIDGE_DIR"

# Create a simple test script to parse prompts
cat > /tmp/test_parse.py << 'EOF'
import re
import sys

prompts_file = sys.argv[1]

with open(prompts_file, 'r') as f:
    content = f.read()

pattern = r'^##\s+Enhanced Prompt\s+(\d+):\s+(.+)$'
matches = list(re.finditer(pattern, content, re.MULTILINE))

print(f"Found {len(matches)} prompts:")
for match in matches[:5]:  # Show first 5
    num = match.group(1)
    title = match.group(2).strip()
    print(f"  - Prompt {num}: {title}")

if len(matches) > 5:
    print(f"  ... and {len(matches) - 5} more")
EOF

python3 /tmp/test_parse.py "$PROMPTS_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Successfully parsed ENHANCED_PROMPTS.md${NC}"
else
    echo -e "${RED}  ❌ Failed to parse ENHANCED_PROMPTS.md${NC}"
    exit 1
fi

rm /tmp/test_parse.py

# Test 7: Extract next prompt
echo ""
echo -e "${YELLOW}Test 7: Extracting Phase 2, Prompt 3...${NC}"

# Extract the specific prompt
PROMPT_PREVIEW=$(grep -A 5 "## Enhanced Prompt 3:" "$PROMPTS_FILE" | head -6)

if [ ! -z "$PROMPT_PREVIEW" ]; then
    echo -e "${GREEN}  ✅ Found Phase 2, Prompt 3:${NC}"
    echo ""
    echo "$PROMPT_PREVIEW" | sed 's/^/     /'
    echo ""
else
    echo -e "${RED}  ❌ Could not find Phase 2, Prompt 3${NC}"
    exit 1
fi

# Test 8: Check build script
echo ""
echo -e "${YELLOW}Test 8: Checking build script...${NC}"

BUILD_SCRIPT="/Users/royaltyvixion/Documents/cge software/website/build-website.sh"

if [ -f "$BUILD_SCRIPT" ]; then
    echo -e "${GREEN}  ✅ build-website.sh found${NC}"

    if [ -x "$BUILD_SCRIPT" ]; then
        echo -e "${GREEN}  ✅ build-website.sh is executable${NC}"
    else
        echo -e "${RED}  ❌ build-website.sh not executable${NC}"
        exit 1
    fi
else
    echo -e "${RED}  ❌ build-website.sh not found${NC}"
    exit 1
fi

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║               ✅ All Tests Passed!                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Your setup is ready to build the CGE website!${NC}"
echo ""
echo -e "${YELLOW}To start building, run:${NC}"
echo -e "  ${BLUE}cd /Users/royaltyvixion/Documents/cge\\ software/website${NC}"
echo -e "  ${BLUE}./build-website.sh${NC}"
echo ""
