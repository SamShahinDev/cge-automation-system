# Troubleshooting Guide

Complete troubleshooting reference for the CGE Discord Bot. This guide covers common errors, Discord API issues, permission problems, and platform-specific issues.

## 📋 Table of Contents

- [Quick Diagnostics](#quick-diagnostics)
- [Startup Errors](#startup-errors)
- [Connection Issues](#connection-issues)
- [Permission Errors](#permission-errors)
- [Command Issues](#command-issues)
- [Channel Setup Problems](#channel-setup-problems)
- [Discord API Errors](#discord-api-errors)
- [Platform-Specific Issues](#platform-specific-issues)
- [Performance Issues](#performance-issues)
- [Getting More Help](#getting-more-help)

---

## 🔍 Quick Diagnostics

Before diving into specific issues, run these diagnostic tools:

### 1. Check Bot Status
```
/bot-status
```
Shows bot health, uptime, latency, and memory usage. Look for red indicators.

### 2. Run Setup Tests
```
/test-setup
```
Runs 20+ automated tests to identify configuration issues.

### 3. Check Console Logs
Look at your terminal where the bot is running. Error messages provide specific details about what went wrong.

---

## 🚀 Startup Errors

### Error: `DISCORD_TOKEN is not defined in .env file`

**Cause:** Bot token is missing from configuration.

**Solutions:**
1. Check if `.env` file exists in the project root
2. Open `.env` and verify it contains:
   ```env
   DISCORD_TOKEN=your_actual_token_here
   GUILD_ID=your_actual_server_id_here
   ```
3. Make sure there are NO quotes around the values
4. Ensure no spaces before/after the `=` sign
5. Save the file and restart the bot

**Quick fix:**
```bash
npm run setup
```
This will guide you through configuration.

---

### Error: `GUILD_ID is not defined in .env file`

**Cause:** Server ID is missing from configuration.

**Solutions:**
1. Enable Developer Mode in Discord:
   - Settings → Advanced → Developer Mode
2. Right-click your server icon
3. Click "Copy Server ID"
4. Add to `.env` file:
   ```env
   GUILD_ID=1424065094223921244
   ```
5. Save and restart the bot

---

### Error: `Node.js version 16.9.0 or higher required`

**Cause:** Your Node.js installation is too old.

**Solutions:**
1. Check your current version:
   ```bash
   node -v
   ```
2. Download latest LTS from: https://nodejs.org/
3. Install and restart your terminal
4. Verify new version:
   ```bash
   node -v
   ```
5. Retry starting the bot

**Alternative:** Use nvm (Node Version Manager):
```bash
# Mac/Linux
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Windows
# Download from: https://github.com/coreybutler/nvm-windows
```

---

### Error: `Cannot find module 'discord.js'`

**Cause:** Dependencies not installed.

**Solutions:**
1. Install dependencies:
   ```bash
   npm install
   ```
2. If that fails, delete and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. Verify discord.js installed:
   ```bash
   npm list discord.js
   ```

---

### Error: `npm: command not found`

**Cause:** npm is not installed or not in PATH.

**Solutions:**
1. npm comes with Node.js - reinstall Node.js
2. Verify installation:
   ```bash
   npm -v
   ```
3. If installed but not found, add to PATH:
   - **Mac/Linux:** Add to `~/.bashrc` or `~/.zshrc`:
     ```bash
     export PATH="/usr/local/bin:$PATH"
     ```
   - **Windows:** System Properties → Environment Variables → Path

---

## 🔌 Connection Issues

### Error: `Failed to login: Improper token has been passed`

**Cause:** Bot token is invalid or incorrectly formatted.

**Common reasons:**
- Token has extra spaces
- Token is incomplete (not fully copied)
- Token has been regenerated in Developer Portal
- Wrong token type (using client secret instead)

**Solutions:**

1. **Regenerate token:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application
   - Go to "Bot" section
   - Click "Reset Token"
   - Click "Yes, do it!"
   - Copy the new token **immediately**

2. **Update .env file:**
   ```env
   DISCORD_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```
   - No quotes
   - No spaces
   - Full token from start to end

3. **Verify token format:**
   - Should be 3 parts separated by dots (`.`)
   - Starts with a long number (bot ID encoded)
   - Very long (usually 70+ characters)

4. **Restart the bot**

---

### Error: `WebSocket connection failed`

**Cause:** Network connectivity issues or Discord API outage.

**Solutions:**

1. **Check Discord status:**
   - Visit https://discordstatus.com
   - Look for API or Gateway issues

2. **Check your internet:**
   ```bash
   ping discord.com
   ```

3. **Check firewall:**
   - Ensure Discord API (*.discord.com) is not blocked
   - Allow outbound HTTPS (port 443)

4. **Retry with backoff:**
   - The bot has auto-retry logic
   - Wait 30-60 seconds and it should reconnect

5. **Check proxy settings:**
   - If behind corporate proxy, may need configuration
   - Discord.js doesn't support proxies easily

---

### Error: `Connection timeout`

**Cause:** Slow network or rate limiting.

**Solutions:**
1. Check network speed
2. Wait a few minutes (may be rate limited)
3. Restart bot with:
   ```bash
   npm start
   ```
4. Check Discord API status: https://discordstatus.com

---

## 🔐 Permission Errors

### Error: `Missing Permissions` or `DiscordAPIError[50013]`

**Cause:** Bot lacks required permissions in the server.

**Solutions:**

1. **Grant Administrator permission (recommended):**
   - Server Settings → Roles
   - Find your bot's role
   - Enable "Administrator"
   - Save changes

2. **Or grant specific permissions:**
   Required permissions:
   - ✅ View Channels
   - ✅ Send Messages
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Read Message History
   - ✅ Add Reactions
   - ✅ Use Slash Commands
   - ✅ Manage Channels
   - ✅ Manage Messages

3. **Check role hierarchy:**
   - Bot's role must be ABOVE roles it needs to manage
   - Drag bot role higher in Server Settings → Roles

4. **Verify permissions:**
   ```
   /test-setup
   ```
   This will show exactly which permissions are missing.

---

### Error: `Missing Access`

**Cause:** Bot can't see the channel or server.

**Solutions:**
1. **Check bot is in server:**
   - Look for bot in member list
   - If missing, re-invite using OAuth URL

2. **Re-invite bot:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application → OAuth2 → URL Generator
   - Select: `bot` and `applications.commands`
   - Select: `Administrator` permission
   - Copy and open URL
   - Select your server

3. **Check channel permissions:**
   - Right-click channel → Edit Channel → Permissions
   - Ensure bot's role can "View Channel"

---

### Error: `Cannot execute action on a system message`

**Cause:** Trying to interact with Discord system messages.

**Solution:**
- This is normal and can be ignored
- Bot will skip system messages automatically

---

## 💬 Command Issues

### Commands Don't Appear When Typing `/`

**Cause:** Commands not registered or bot missing permissions.

**Solutions:**

1. **Wait for registration:**
   - Commands register when bot starts
   - Wait 30-60 seconds after "Bot is online!"
   - Look for: `✅ Successfully reloaded 3 application (/) commands`

2. **Check permissions:**
   - Bot needs "Use Application Commands" permission
   - Grant in Server Settings → Roles

3. **Verify bot is online:**
   - Green dot next to bot in member list
   - Check console shows "Bot is online!"

4. **Restart bot:**
   ```bash
   # Press Ctrl+C, then:
   npm start
   ```

5. **Check GUILD_ID:**
   - Commands are guild-specific
   - Verify GUILD_ID in `.env` matches your server
   - Get correct ID: Right-click server → Copy Server ID

6. **Clear Discord cache (last resort):**
   - Close Discord completely
   - **Windows:** Press `Win+R`, type `%appdata%\Discord\Cache`, delete contents
   - **Mac:** `~/Library/Application Support/Discord/Cache`
   - Restart Discord

---

### Error: `Unknown interaction` when using command

**Cause:** Command registration mismatch or bot restarted during interaction.

**Solutions:**
1. **Don't use old command instances:**
   - Refresh Discord (Ctrl+R / Cmd+R)
   - Type command again

2. **Restart bot:**
   ```bash
   npm start
   ```

3. **Verify command is registered:**
   ```
   /bot-status
   ```
   Should show "Registered Commands: 3"

---

### Error: `This interaction failed`

**Cause:** Command took too long to respond (>3 seconds).

**Common reasons:**
- Network lag
- Bot processing delay
- Discord API slowness

**Solutions:**
1. **Try again** - May be temporary
2. **Check bot logs** - Look for specific errors
3. **Check latency:**
   ```
   /bot-status
   ```
   High API latency (>500ms) = slow responses

4. **Verify bot is responding:**
   - Check console for "Executing command: [name]"
   - If missing, bot didn't receive the interaction

---

## 🗂️ Channel Setup Problems

### Some Channels Not Created

**Cause:** Rate limiting, permissions, or errors during setup.

**Solutions:**

1. **Check which channels are missing:**
   ```
   /test-setup
   ```
   Shows missing channels list

2. **Run setup again:**
   ```
   /setup-channels
   ```
   It will create missing channels

3. **Check rate limits:**
   - Discord limits channel creation speed
   - Bot includes delays, but may hit limits
   - Wait 5 minutes and try again

4. **Verify permissions:**
   ```
   /test-setup
   ```
   Check "Manage Channels" permission

5. **Check console logs:**
   - Look for specific error messages
   - May show which channel failed and why

---

### Channels Created in Wrong Order

**Cause:** Discord API doesn't guarantee order.

**Solution:**
- Order may vary slightly
- Channels are grouped by category correctly
- If bothers you, manually drag to reorder in Discord

---

### Cannot Delete Existing Channels

**Cause:** Permission issues or protected channels.

**Solutions:**

1. **Check permissions:**
   - Bot needs "Manage Channels"
   - Or "Administrator"

2. **Protected channels:**
   - Some channels may be protected (community servers)
   - Manually delete protected channels first
   - Then run `/setup-channels`

3. **Bot is below channel owner:**
   - Channel created by higher role
   - Solution: Give bot Administrator or highest role

---

### Setup Gets Stuck

**Cause:** API timeout or network issues.

**Solutions:**
1. **Wait 2-3 minutes** - May be slow API
2. **Check console** - Look for errors
3. **Restart bot:**
   ```bash
   # Press Ctrl+C
   npm start
   ```
4. **Run setup again:**
   ```
   /setup-channels
   ```

---

## 🌐 Discord API Errors

### Error: `DiscordAPIError[50001]: Missing Access`

**Meaning:** Bot can't access the resource.

**Solutions:**
- Bot not in server → Re-invite
- Channel permissions → Check channel-specific permissions
- Role hierarchy → Move bot role higher

---

### Error: `DiscordAPIError[50013]: Missing Permissions`

**Meaning:** Bot lacks specific permission.

**Solutions:**
- Grant Administrator permission (easiest)
- Or grant specific permission mentioned in error
- Run `/test-setup` to verify

---

### Error: `DiscordAPIError[10062]: Unknown interaction`

**Meaning:** Interaction expired or already responded to.

**Solutions:**
- Use fresh command (type it again)
- Don't click old buttons
- Ignore if command worked despite error

---

### Error: `DiscordAPIError[10008]: Unknown Message`

**Meaning:** Trying to edit/delete a message that doesn't exist.

**Solutions:**
- Usually harmless
- Message may have been deleted already
- Check console logs for context

---

### Error: `DiscordAPIError[50027]: Invalid Webhook Token`

**Meaning:** Interaction token expired (>15 minutes).

**Solutions:**
- Don't leave interactions open >15 minutes
- Run command again
- This is a Discord limitation

---

### Error: `DiscordAPIError[429]: Too Many Requests` (Rate Limited)

**Meaning:** Making too many API requests too quickly.

**Solutions:**
1. **Wait** - Bot will auto-retry with backoff
2. **Slow down** - Don't spam commands
3. **Check for loops** - Look at console for repeated actions
4. **Normal during setup** - Creating many channels may hit limits

**How bot handles it:**
- Built-in 250ms delay between channel operations
- Will retry after rate limit expires
- Check console for "Rate limited" messages

---

## 💻 Platform-Specific Issues

### Mac Issues

#### `Permission denied: ./quick-start.sh`

**Solution:**
```bash
chmod +x quick-start.sh
chmod +x *.sh
```

#### `command not found: node`

**Solutions:**
1. Install Node.js from https://nodejs.org
2. Or use Homebrew:
   ```bash
   brew install node
   ```
3. Restart terminal

---

### Linux Issues

#### Permission errors

**Solutions:**
```bash
# Make scripts executable
chmod +x quick-start.sh

# Install Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Node.js (Fedora/RHEL)
sudo dnf install nodejs
```

#### `EACCES: permission denied`

**Solutions:**
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

---

### Windows Issues

#### `'node' is not recognized as an internal or external command`

**Solutions:**
1. Install Node.js from https://nodejs.org
2. Restart terminal/PowerShell
3. Verify:
   ```cmd
   node -v
   npm -v
   ```

#### `Execution of scripts is disabled on this system`

**Solutions:**
1. Open PowerShell as Administrator
2. Run:
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```
3. Close and reopen PowerShell
4. Run `quick-start.bat`

#### Line ending issues (CRLF vs LF)

**Solutions:**
```bash
# If using Git Bash
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"

# Or configure Git
git config --global core.autocrlf true
```

#### `EPERM: operation not permitted`

**Solutions:**
- Close Discord (may be locking files)
- Run terminal as Administrator
- Disable antivirus temporarily
- Check file is not read-only

---

## ⚡ Performance Issues

### High Memory Usage

**Symptoms:**
```
/bot-status
```
Shows >90% memory usage or >500 MB.

**Solutions:**
1. **Normal for Discord bots** - 100-200 MB is typical
2. **Restart bot:**
   ```bash
   npm start
   ```
3. **Memory leak check:**
   - Monitor over time
   - If keeps increasing, report as bug
4. **Increase Node.js memory limit:**
   ```bash
   export NODE_OPTIONS="--max-old-space-size=512"
   npm start
   ```

---

### High Latency

**Symptoms:**
```
/bot-status
```
Shows API Latency >500ms (Red indicator).

**Causes:**
- Your internet connection
- Discord API region
- Server load
- Discord outage

**Solutions:**
1. **Check Discord status:** https://discordstatus.com
2. **Test your connection:**
   ```bash
   ping discord.com
   ```
3. **Restart router/modem**
4. **Wait** - May be temporary Discord issue
5. **Consider hosting closer to Discord servers:**
   - US East (Virginia)
   - EU West (Frankfurt)

---

### Bot Crashes Frequently

**Symptoms:** Bot restarts every few minutes.

**Check console for:**
- `Out of memory` → Memory issue (see above)
- `ECONNRESET` → Network instability
- `DiscordAPIError` → API issues
- Specific errors → Check relevant section

**Solutions:**
1. **Check logs for pattern**
2. **Run diagnostics:**
   ```
   /test-setup
   ```
3. **Update dependencies:**
   ```bash
   npm update
   ```
4. **Use process manager (PM2):**
   ```bash
   npm install -g pm2
   pm2 start launcher.js --name cge-bot
   pm2 logs cge-bot
   ```

---

## 🆘 Getting More Help

### Step 1: Gather Information

Before asking for help, collect:

1. **Error message** (exact text from console)
2. **Bot status:**
   ```
   /bot-status
   ```
   Screenshot the output

3. **Test results:**
   ```
   /test-setup
   ```
   Screenshot any failures

4. **System info:**
   ```bash
   node -v
   npm -v
   ```

5. **Console logs:**
   - Copy last 50-100 lines
   - Include timestamps

### Step 2: Check Documentation

- [README.md](README.md) - Setup and usage
- [CREDENTIALS.md](CREDENTIALS.md) - Credential issues
- This file - Error solutions

### Step 3: Search for Similar Issues

Common patterns:
- "Discord bot [error code]"
- "discord.js [error message]"
- Check Discord.js docs: https://discord.js.org/

### Step 4: Systematic Debugging

1. **Isolate the problem:**
   - Does it happen every time?
   - Does it happen with specific commands?
   - Did it work before?

2. **Test with minimal setup:**
   - Fresh restart
   - One command at a time
   - Check after each step

3. **Verify basics:**
   - Bot is online
   - Permissions are correct
   - Credentials are valid
   - Node.js version is correct

### Step 5: Check Known Issues

**Bot won't start:**
1. Credentials missing → See [Startup Errors](#startup-errors)
2. Dependencies missing → Run `npm install`
3. Wrong Node.js version → Update Node.js

**Commands don't work:**
1. Not registered → Wait 30s after "Bot is online!"
2. Missing permissions → Run `/test-setup`
3. Wrong server → Check GUILD_ID

**Channels not created:**
1. Missing permissions → Grant "Manage Channels"
2. Rate limited → Wait 5 minutes
3. Partial creation → Run `/setup-channels` again

---

## 🔧 Advanced Troubleshooting

### Enable Debug Logging

Add to `.env`:
```env
DEBUG=true
```

Restart bot to see detailed logs.

### Test Without Launcher

Run bot directly:
```bash
npx ts-node src/index.ts
```

See errors without launcher wrapper.

### Verify Discord.js Installation

```bash
npm list discord.js
npm list typescript
npm list ts-node
```

All should show version numbers, not errors.

### Reset Everything

If all else fails:
```bash
# Backup your .env file first!
rm -rf node_modules dist package-lock.json
npm install
npm start
```

---

## 📞 Still Need Help?

If you've tried everything and still have issues:

1. **Check Discord.js support:**
   - https://discord.gg/djs
   - Very active community

2. **Check Node.js issues:**
   - https://nodejs.org/en/docs/

3. **File a bug report:**
   - Include all info from "Step 1: Gather Information"
   - Steps to reproduce
   - Expected vs actual behavior

---

**Last Updated:** 2024
**Bot Version:** 1.0.0
