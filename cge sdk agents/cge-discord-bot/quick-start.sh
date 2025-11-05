#!/bin/bash

# CGE Discord Bot - Quick Start Script (Mac/Linux)
# This script handles everything needed to get the bot running

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  🚀 CGE Discord Bot - Quick Start${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Check if Node.js is installed
echo -e "${BLUE}[1/6] Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo ""
    echo "Please install Node.js from: https://nodejs.org"
    echo "Required version: 16.9.0 or higher"
    echo ""
    exit 1
fi

# Step 2: Check Node.js version
NODE_VERSION=$(node -v)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
NODE_MINOR=$(echo $NODE_VERSION | cut -d'.' -f2)

if [ "$NODE_MAJOR" -lt 16 ] || ([ "$NODE_MAJOR" -eq 16 ] && [ "$NODE_MINOR" -lt 9 ]); then
    echo -e "${RED}❌ Node.js version 16.9.0 or higher required${NC}"
    echo "   Current version: $NODE_VERSION"
    echo ""
    echo "Please update Node.js from: https://nodejs.org"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Node.js $NODE_VERSION detected${NC}"
echo ""

# Step 3: Check if npm is installed
echo -e "${BLUE}[2/6] Checking npm installation...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    echo ""
    echo "npm should come with Node.js. Please reinstall Node.js."
    echo ""
    exit 1
fi

NPM_VERSION=$(npm -v)
echo -e "${GREEN}✅ npm $NPM_VERSION detected${NC}"
echo ""

# Step 4: Install dependencies
echo -e "${BLUE}[3/6] Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    echo ""
    npm install
    echo ""
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 5: Check for .env file
echo -e "${BLUE}[4/6] Checking configuration...${NC}"
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}📝 Creating .env file from template...${NC}"

    if [ ! -f ".env.example" ]; then
        echo -e "${RED}❌ .env.example file not found!${NC}"
        exit 1
    fi

    cp .env.example .env
    echo -e "${GREEN}✅ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BOLD}⚠️  CREDENTIALS REQUIRED${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "A .env file has been created, but you need to add your credentials:"
    echo ""
    echo -e "  ${BOLD}1. Discord Bot Token${NC}"
    echo "     Get it from: https://discord.com/developers/applications"
    echo ""
    echo -e "  ${BOLD}2. Discord Server ID${NC}"
    echo "     Right-click your server → Copy Server ID"
    echo "     (Enable Developer Mode in Discord settings first)"
    echo ""
    echo -e "${CYAN}Quick Setup:${NC}"
    echo "  1. Open .env in a text editor"
    echo "  2. Replace YOUR_BOT_TOKEN_HERE with your bot token"
    echo "  3. Replace YOUR_SERVER_ID_HERE with your server ID"
    echo "  4. Save the file"
    echo "  5. Run this script again: ./quick-start.sh"
    echo ""
    echo -e "${BLUE}📖 For detailed help, see: CREDENTIALS.md${NC}"
    echo ""
    exit 0
fi

# Step 6: Validate credentials
echo -e "${BLUE}[5/6] Validating credentials...${NC}"

# Check if credentials are still placeholders
if grep -q "your_discord_token_here" .env || grep -q "YOUR_BOT_TOKEN_HERE" .env; then
    echo -e "${RED}❌ Bot token not configured in .env${NC}"
    echo ""
    echo "Please edit .env and replace:"
    echo "  DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE"
    echo ""
    echo "With your actual Discord bot token from:"
    echo "  https://discord.com/developers/applications"
    echo ""
    echo -e "${BLUE}📖 Need help? Check CREDENTIALS.md${NC}"
    echo ""
    exit 1
fi

if grep -q "your_guild_id_here" .env || grep -q "YOUR_SERVER_ID_HERE" .env; then
    echo -e "${RED}❌ Server ID not configured in .env${NC}"
    echo ""
    echo "Please edit .env and replace:"
    echo "  GUILD_ID=YOUR_SERVER_ID_HERE"
    echo ""
    echo "With your Discord server ID:"
    echo "  1. Enable Developer Mode in Discord (Settings → Advanced)"
    echo "  2. Right-click your server icon"
    echo "  3. Click 'Copy Server ID'"
    echo ""
    echo -e "${BLUE}📖 Need help? Check CREDENTIALS.md${NC}"
    echo ""
    exit 1
fi

# Basic format validation
DISCORD_TOKEN=$(grep "^DISCORD_TOKEN=" .env | cut -d'=' -f2-)
GUILD_ID=$(grep "^GUILD_ID=" .env | cut -d'=' -f2-)

if [ -z "$DISCORD_TOKEN" ]; then
    echo -e "${RED}❌ DISCORD_TOKEN is empty in .env${NC}"
    exit 1
fi

if [ -z "$GUILD_ID" ]; then
    echo -e "${RED}❌ GUILD_ID is empty in .env${NC}"
    exit 1
fi

# Validate Guild ID is numeric
if ! [[ "$GUILD_ID" =~ ^[0-9]+$ ]]; then
    echo -e "${RED}❌ GUILD_ID must be a numeric Discord server ID${NC}"
    echo "   Current value: $GUILD_ID"
    echo ""
    exit 1
fi

echo -e "${GREEN}✅ Credentials validated${NC}"
echo ""

# Step 7: Ready to launch
echo -e "${BLUE}[6/6] Preparing to start bot...${NC}"
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo -e "${BOLD}  🚀 Starting CGE Discord Bot${NC}"
echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${YELLOW}Bot Token:${NC} ${DISCORD_TOKEN:0:20}..."
echo -e "${YELLOW}Server ID:${NC} $GUILD_ID"
echo ""
echo -e "${BLUE}Press Ctrl+C to stop the bot${NC}"
echo ""
echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
echo ""

# Launch the bot using the launcher
npm run start
