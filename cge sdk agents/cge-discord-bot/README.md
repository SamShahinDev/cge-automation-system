# CGE Discord Bot

> 🤖 A production-ready Discord bot for the CGE Development Automation system that manages channel structure and coordinates development agents.

[![Node.js](https://img.shields.io/badge/Node.js-16.9.0+-green.svg)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-14.14.1-blue.svg)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)

## 📋 Table of Contents

- [Features](#features)
- [Quick Start](#quick-start)
- [Initial Setup](#initial-setup)
- [Running the Bot](#running-the-bot)
- [Available Commands](#available-commands)
- [Channel Structure](#channel-structure)
- [Troubleshooting](#troubleshooting)
- [Keeping Bot Running 24/7](#keeping-bot-running-247)
- [Advanced Configuration](#advanced-configuration)
- [Development](#development)

---

## ✨ Features

- ✅ **One-Command Setup** - Get started in seconds with automated installation
- ✅ **Automated Channel Management** - Creates complete server structure with one command
- ✅ **Health Monitoring** - Built-in health checks and auto-restart on crashes
- ✅ **Smart Error Recovery** - Automatic recovery from transient failures
- ✅ **Administrator Controls** - Requires admin permissions for destructive operations
- ✅ **Confirmation System** - Prevents accidental deletions with confirmation prompts
- ✅ **Progress Tracking** - Real-time feedback during channel creation
- ✅ **Diagnostic Tools** - Built-in commands to verify setup and monitor health
- ✅ **Production Ready** - Robust process management with graceful shutdown

---

## 🚀 Quick Start

### Absolute Beginner? Start Here!

The fastest way to get your bot running:

#### Step 1: Get Your Credentials Ready

You need two things:
1. **Discord Bot Token** - [Get it here](https://discord.com/developers/applications)
2. **Discord Server ID** - Right-click your server → Copy Server ID

📖 **Need detailed help?** See [CREDENTIALS.md](CREDENTIALS.md)

#### Step 2: Run the Quick Start Script

**Mac/Linux:**
```bash
./quick-start.sh
```

**Windows:**
```cmd
quick-start.bat
```

That's it! The script will:
- ✅ Check your Node.js installation (installs dependencies if needed)
- ✅ Create configuration file
- ✅ Guide you through adding credentials
- ✅ Start the bot with monitoring

#### Step 3: Set Up Your Server

Once the bot is running, go to Discord and run:
```
/setup-channels
```

Confirm the setup, and your server will be fully configured in seconds!

---

## 🔧 Initial Setup

### Prerequisites

- **Node.js 16.9.0 or higher** - [Download here](https://nodejs.org/)
- **A Discord account** with a server where you have Administrator permissions
- **5 minutes** of your time

### Getting Your Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" (or select an existing one)
3. Give your bot a name (e.g., "CGE Development Bot")
4. Go to the "Bot" section in the left sidebar
5. Click "Add Bot" if you haven't already
6. Under "TOKEN", click "Reset Token" and copy it
7. **Important**: Enable these Privileged Gateway Intents:
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **MESSAGE CONTENT INTENT**
8. Click "Save Changes"

### Inviting the Bot to Your Server

1. In the Developer Portal, go to "OAuth2" → "URL Generator"
2. Under "SCOPES", select:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Under "BOT PERMISSIONS", select:
   - ✅ `Administrator` (recommended)
   - Or at minimum: Manage Channels, Send Messages, Manage Messages, View Channels
4. Copy the generated URL at the bottom
5. Open the URL in your browser
6. Select your server and click "Authorize"

### Getting Your Server ID

1. Open Discord
2. Click the ⚙️ icon (User Settings) at the bottom left
3. Go to "Advanced" under "App Settings"
4. Enable "Developer Mode"
5. Close settings
6. Right-click your server icon in the server list
7. Click "Copy Server ID"

### Configuration

After running the quick-start script, edit the `.env` file:

```env
# Discord Bot Configuration
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_server_id_here
```

Replace the values with your actual credentials and save the file.

📖 **More details:** [CREDENTIALS.md](CREDENTIALS.md)

---

## 🎮 Running the Bot

### Method 1: Quick Start Script (Recommended)

**Mac/Linux:**
```bash
./quick-start.sh
```

**Windows:**
```cmd
quick-start.bat
```

**What it does:**
- Validates Node.js version
- Installs dependencies if missing
- Checks credentials
- Starts bot with monitoring

### Method 2: NPM Commands

**Start with monitoring:**
```bash
npm start
```

**Initial setup wizard:**
```bash
npm run setup
```

**Development mode:**
```bash
npm run dev
```

### What You'll See

When the bot starts successfully, you'll see:

```
🚀 Starting CGE Discord Bot...
✅ Bot is online!
📝 Logged in as: CGE Bot#1234
🆔 Bot ID: 1424065484071895170
🌐 Serving 1 guild(s)
🎮 Bot is ready to receive commands!
```

### Stopping the Bot

Press `Ctrl+C` to stop the bot gracefully. The bot will:
1. Send an offline status message to Discord
2. Disconnect from Discord API
3. Clean up resources
4. Exit cleanly

---

## 📜 Available Commands

The bot includes three powerful slash commands:

### `/setup-channels` - Create Server Structure

Sets up the complete CGE Development Automation channel structure.

**Usage:**
```
/setup-channels
```

**What it does:**
1. Shows you a preview of current vs. new structure
2. Asks for confirmation (with Cancel option)
3. Deletes existing channels (except where you run the command)
4. Creates 4 categories
5. Creates 13 channels with descriptions
6. Shows progress in real-time
7. Provides completion summary

**Requirements:**
- Administrator permissions
- Confirmation required before execution

**Example Output:**
```
⚠️ Channel Setup Confirmation
This will DELETE ALL EXISTING CHANNELS except this one and create a new structure.

Current Server:
• Categories: 2
• Text Channels: 5
• Total Channels: 5

New Structure:
• Categories: 4
• Text Channels: 13
• Total Channels: 13

[✅ Confirm Setup] [❌ Cancel]
```

### `/test-setup` - Verify Configuration

Runs comprehensive tests to verify everything is working correctly.

**Usage:**
```
/test-setup
```

**Tests Performed:**
- 🔗 Bot connection and permissions (6 tests)
- 📁 Channel structure validation (10+ tests)
- 💬 Message permissions (3 tests)
- ⚙️ Bot capabilities (4 tests)

**Example Output:**
```
🧪 Bot Setup Test Results

🔗 Bot Connection
✅ Guild Access: PASS
✅ Administrator Permission: PASS

📁 Channel Structure
✅ Category Count: PASS (4/4)
✅ Channel Count: PASS (13/13)

📊 Summary
Total Tests: 20
✅ Passed: 20
❌ Failed: 0

✅ All tests passed! Your bot is fully configured.
```

### `/bot-status` - System Information

Displays real-time bot status, performance metrics, and system information.

**Usage:**
```
/bot-status
```

**Information Shown:**
- 🤖 Bot name, ID, and uptime
- ⚡ API latency and memory usage
- 📊 Server and user statistics
- ⚙️ Registered commands
- 💻 Node.js and Discord.js versions
- 🏥 Health status and warnings

**Example Output:**
```
🤖 Bot Status Dashboard

⚡ Performance Metrics
API Latency: 45ms (Excellent)
Memory Usage: 78.45 MB / 150.32 MB
Memory Usage %: 52.2%

🤖 Bot Information
Uptime: 2h 34m 12s
Status: 🟢 Online

🏥 Health Status
🟢 All Systems Operational
```

---

## 🗂️ Channel Structure

The bot creates a comprehensive server structure optimized for development automation:

### 🎯 COMMAND CENTER (2 channels)
- `command-center` - Main command interface for all automation operations
- `approvals` - All agents post here for approval before executing tasks

### 🤖 AGENT WORKSPACE (7 channels)
- `orchestrator-status` - Coordination updates and agent orchestration status
- `blueprint-work` - Technical specification development workspace
- `phase-planning` - Phase decomposition and timeline planning
- `prompt-generation` - Prompt creation and template generation
- `enhancement-work` - Prompt enhancement and optimization
- `build-monitor` - Build execution tracking and real-time monitoring
- `review-results` - Quality checks, test results, and issue identification

### 📊 MONITORING (3 channels)
- `error-log` - Error tracking and exception logging
- `agent-status` - Health checks and agent availability monitoring
- `activity-log` - Complete audit trail of all system activities

### 📚 ARCHIVES (2 channels)
- `completed-projects` - Archive of finished projects and deliverables
- `documentation` - System documentation, guides, and references

**Total:** 4 categories, 14 channels

---

## 🔧 Troubleshooting

### Common Issues and Quick Fixes

#### Bot Doesn't Start

**Error:** `❌ DISCORD_TOKEN is not defined in .env file`

**Solution:**
1. Make sure `.env` file exists
2. Check that you've added your bot token
3. Token should not have quotes around it
4. Run `npm run setup` for guided configuration

---

**Error:** `❌ Node.js version 16.9.0 or higher required`

**Solution:**
1. Update Node.js: https://nodejs.org/
2. Verify version: `node -v`
3. Restart your terminal after installing

---

#### Bot Doesn't Respond to Commands

**Symptoms:** Type `/setup-channels` but nothing appears

**Solutions:**
1. **Wait 30 seconds** - Commands take time to register after bot starts
2. **Check bot is online** - Look for green dot next to bot in member list
3. **Verify bot has permissions** - Bot needs "Use Application Commands" permission
4. **Restart bot** - Run `Ctrl+C` then start again
5. **Check GUILD_ID** - Make sure it matches your server ID

---

#### Permission Errors

**Error:** Bot says it can't create/delete channels

**Solution:**
1. Go to Server Settings → Roles
2. Find your bot's role
3. Enable "Administrator" permission
4. Or enable: Manage Channels, Manage Messages, Send Messages
5. Run `/test-setup` to verify permissions

---

#### "Failed to login" Error

**Error:** `❌ Failed to login: Improper token has been passed`

**Solutions:**
1. **Token is incorrect** - Regenerate in Discord Developer Portal
2. **Extra spaces** - Check `.env` file has no spaces around token
3. **Token expired** - Generate a new one
4. **Wrong token** - Make sure you copied the bot token (not client secret)

---

#### Missing Channels After Setup

**Symptoms:** Some channels weren't created

**Solutions:**
1. **Run `/test-setup`** - See which channels are missing
2. **Check API rate limits** - Discord limits how fast you can create channels
3. **Verify permissions** - Bot needs "Manage Channels"
4. **Re-run `/setup-channels`** - It will create missing channels

---

### Platform-Specific Issues

#### Mac/Linux

**Issue:** `Permission denied: ./quick-start.sh`

**Solution:**
```bash
chmod +x quick-start.sh
./quick-start.sh
```

---

#### Windows

**Issue:** Script execution is disabled

**Solution:**
Run PowerShell as Administrator:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then run the batch file:
```cmd
quick-start.bat
```

---

### Getting More Help

1. **Check logs** - Console output shows detailed error messages
2. **Run diagnostics** - Use `/test-setup` to identify issues
3. **Check status** - Use `/bot-status` to see if bot is healthy
4. **Review documentation:**
   - [CREDENTIALS.md](CREDENTIALS.md) - Credential setup help
   - [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Detailed error solutions

---

## 🌐 Keeping Bot Running 24/7

### Option 1: PM2 (Recommended for Servers)

PM2 is a production process manager for Node.js applications.

**Install PM2:**
```bash
npm install -g pm2
```

**Start bot with PM2:**
```bash
pm2 start launcher.js --name "cge-discord-bot"
```

**Useful PM2 commands:**
```bash
pm2 list              # Show all processes
pm2 logs cge-discord-bot   # View logs
pm2 restart cge-discord-bot  # Restart bot
pm2 stop cge-discord-bot     # Stop bot
pm2 startup           # Enable PM2 on system startup
pm2 save              # Save current process list
```

**Auto-restart on reboot:**
```bash
pm2 startup
pm2 save
```

### Option 2: Docker

**Create Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

**Build and run:**
```bash
docker build -t cge-discord-bot .
docker run -d --name cge-bot --restart unless-stopped cge-discord-bot
```

### Option 3: Cloud Hosting

#### Heroku
1. Create a Heroku account
2. Install Heroku CLI
3. Create `Procfile`:
   ```
   worker: npm start
   ```
4. Deploy:
   ```bash
   heroku create
   git push heroku main
   heroku ps:scale worker=1
   ```

#### Railway
1. Go to [Railway.app](https://railway.app)
2. Create new project from GitHub
3. Add environment variables (DISCORD_TOKEN, GUILD_ID)
4. Deploy automatically

#### DigitalOcean
1. Create a Droplet (Ubuntu recommended)
2. SSH into server
3. Clone repository
4. Install Node.js and PM2
5. Run bot with PM2

### Option 4: Windows Service (Windows Only)

**Using NSSM (Non-Sucking Service Manager):**

1. Download NSSM: https://nssm.cc/download
2. Install as service:
   ```cmd
   nssm install CGEDiscordBot "C:\Program Files\nodejs\node.exe" "C:\path\to\launcher.js"
   ```
3. Start service:
   ```cmd
   nssm start CGEDiscordBot
   ```

### Option 5: systemd (Linux)

**Create service file:**
```bash
sudo nano /etc/systemd/system/cge-discord-bot.service
```

**Add configuration:**
```ini
[Unit]
Description=CGE Discord Bot
After=network.target

[Service]
Type=simple
User=yourusername
WorkingDirectory=/path/to/cge-discord-bot
ExecStart=/usr/bin/node launcher.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable cge-discord-bot
sudo systemctl start cge-discord-bot
```

**Check status:**
```bash
sudo systemctl status cge-discord-bot
```

---

## ⚙️ Advanced Configuration

### Environment Variables

You can add these to your `.env` file:

```env
# Required
DISCORD_TOKEN=your_bot_token_here
GUILD_ID=your_server_id_here

# Optional (future use)
NODE_ENV=production
LOG_LEVEL=info
```

### Custom Channel Structure

Edit `src/config/channels.ts` to customize channels:

```typescript
export const CHANNEL_STRUCTURE: CategoryConfig[] = [
  {
    name: '🎯 YOUR CATEGORY',
    channels: [
      {
        name: 'your-channel',
        type: ChannelType.GuildText,
        description: 'Your channel description'
      }
    ]
  }
];
```

After modifying, rebuild:
```bash
npm run build
npm start
```

### Project Structure

```
cge-discord-bot/
├── src/                    # TypeScript source files
│   ├── index.ts           # Main bot file
│   ├── config/
│   │   └── channels.ts    # Channel configuration
│   ├── commands/          # Slash commands
│   │   ├── setup.ts       # /setup-channels command
│   │   ├── test.ts        # /test-setup command
│   │   └── status.ts      # /bot-status command
│   └── utils/
│       └── channelManager.ts  # Channel utilities
├── dist/                  # Compiled JavaScript (auto-generated)
├── node_modules/          # Dependencies (auto-installed)
├── .env                   # Your credentials (DO NOT COMMIT)
├── .env.example           # Template for credentials
├── .gitignore             # Git ignore rules
├── package.json           # Project dependencies
├── tsconfig.json          # TypeScript configuration
├── launcher.js            # Process manager with health checks
├── setup.js               # Interactive setup wizard
├── quick-start.sh         # One-command setup (Mac/Linux)
├── quick-start.bat        # One-command setup (Windows)
├── README.md              # This file
├── CREDENTIALS.md         # Detailed credential guide
└── TROUBLESHOOTING.md     # Detailed troubleshooting
```

---

## 👨‍💻 Development

### Adding New Commands

1. **Create command file:**
   ```typescript
   // src/commands/mycommand.ts
   import { SlashCommandBuilder, CommandInteraction } from 'discord.js';

   export const data = new SlashCommandBuilder()
     .setName('mycommand')
     .setDescription('My custom command');

   export async function execute(interaction: CommandInteraction) {
     await interaction.reply('Hello from my command!');
   }
   ```

2. **Register in index.ts:**
   ```typescript
   import * as myCommand from './commands/mycommand';
   client.commands.set(myCommand.data.name, myCommand);
   ```

3. **Add to command registration:**
   ```typescript
   const commands = [
     setupCommand.data.toJSON(),
     testCommand.data.toJSON(),
     statusCommand.data.toJSON(),
     myCommand.data.toJSON()  // Add here
   ];
   ```

4. **Rebuild and restart:**
   ```bash
   npm run build
   npm start
   ```

### Testing

Run setup verification:
```bash
npm start
# In Discord: /test-setup
```

Check bot health:
```bash
# In Discord: /bot-status
```

### Building

Compile TypeScript to JavaScript:
```bash
npm run build
```

Output goes to `dist/` directory.

---

## 📄 License

ISC

---

## 🤝 Support

- **📖 Documentation:** [CREDENTIALS.md](CREDENTIALS.md), [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **🐛 Issues:** Check console logs for detailed error messages
- **💬 Commands:** Use `/test-setup` and `/bot-status` for diagnostics

---

## 🙏 Acknowledgments

Built with:
- [discord.js](https://discord.js.org/) - Discord API library
- [TypeScript](https://www.typescriptlang.org/) - Type-safe JavaScript
- [Node.js](https://nodejs.org/) - JavaScript runtime

---

**CGE Development Automation** - Automated channel management for development workflows
