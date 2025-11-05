#!/bin/bash

# Test Completion Monitoring
# Verifies that the batch processor can properly detect Claude Code completion

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
echo -e "${BLUE}║        🧪 Testing Completion Monitoring System            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Check if Claude Code responds
echo -e "${YELLOW}Test 1: Checking Claude Code availability...${NC}"
if command -v claude &> /dev/null; then
    echo -e "${GREEN}  ✅ Claude Code found${NC}"
else
    echo -e "${RED}  ❌ Claude Code not found${NC}"
    exit 1
fi

# Test 2: Run built-in test
echo ""
echo -e "${YELLOW}Test 2: Running built-in completion test...${NC}"
echo -e "${BLUE}  This will create a simple test component and verify monitoring${NC}"
echo ""

cd "$BRIDGE_DIR"

python3 integrations/enhanced_batch_cli.py \
    --project-path "$PROJECT_PATH" \
    --prompts "$PROMPTS_FILE" \
    --test

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}  ✅ Completion monitoring test passed!${NC}"
else
    echo ""
    echo -e "${RED}  ❌ Completion monitoring test failed${NC}"
    exit 1
fi

# Test 3: Parse a single prompt
echo ""
echo -e "${YELLOW}Test 3: Extracting Phase 2, Prompt 3 content...${NC}"

cat > /tmp/test_single_prompt.py << 'EOF'
import re
import sys

prompts_file = sys.argv[1]

with open(prompts_file, 'r') as f:
    content = f.read()

# Find Prompt 3
pattern = r'^##\s+Enhanced Prompt\s+3:\s+(.+)$'
match = re.search(pattern, content, re.MULTILINE)

if match:
    title = match.group(1).strip()

    # Get content
    start_pos = match.end()
    end_marker = content.find('---END PROMPT---', start_pos)

    if end_marker != -1:
        prompt_content = content[start_pos:end_marker].strip()

        # Show preview
        lines = prompt_content.split('\n')
        preview = '\n'.join(lines[:10])

        print(f"Title: {title}")
        print(f"Content length: {len(prompt_content)} characters")
        print(f"Lines: {len(lines)}")
        print(f"\nFirst 10 lines:")
        print(preview)

        sys.exit(0)
    else:
        print("Error: Could not find end marker")
        sys.exit(1)
else:
    print("Error: Could not find Prompt 3")
    sys.exit(1)
EOF

python3 /tmp/test_single_prompt.py "$PROMPTS_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Successfully extracted prompt content${NC}"
else
    echo -e "${RED}  ❌ Failed to extract prompt${NC}"
    rm /tmp/test_single_prompt.py
    exit 1
fi

rm /tmp/test_single_prompt.py

# Summary
echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          ✅ All Monitoring Tests Passed!                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}The batch processor is ready to use with proper completion monitoring!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Review the first prompt in ENHANCED_PROMPTS.md"
echo -e "  2. Run: ${BLUE}./build-website.sh${NC}"
echo -e "  3. Monitor the first prompt to verify timing"
echo -e "  4. Let it continue automatically with remaining prompts"
echo ""
