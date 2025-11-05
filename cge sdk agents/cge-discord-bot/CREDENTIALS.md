# Discord Bot Credentials Guide

This guide will help you obtain the necessary credentials to run the CGE Discord Bot.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Getting Your Bot Token](#getting-your-bot-token)
3. [Getting Your Server ID](#getting-your-server-id)
4. [Security Best Practices](#security-best-practices)
5. [Troubleshooting](#troubleshooting)

---

## Quick Start

You need two pieces of information:

1. **DISCORD_TOKEN** - Your bot's authentication token
2. **GUILD_ID** - Your Discord server's unique ID

Both go in the `.env` file in this directory.

---

## Getting Your Bot Token

### Step 1: Access Discord Developer Portal

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Log in with your Discord account

### Step 2: Create or Select Application

**Creating a New Application:**
- Click the "New Application" button (top right)
- Enter a name for your bot (e.g., "CGE Development Bot")
- Click "Create"

**Using an Existing Application:**
- Click on the application from the list

### Step 3: Navigate to Bot Section

1. In the left sidebar, click "Bot"
2. If you haven't created a bot yet:
   - Click "Add Bot"
   - Click "Yes, do it!" to confirm

### Step 4: Get Your Token

⚠️ **IMPORTANT**: This token is like a password - anyone with it can control your bot!

1. Under the "TOKEN" section, click "Reset Token"
2. Click "Yes, do it!" to confirm
3. **Copy the token immediately** - you won't be able to see it again!
4. Paste it in your `.env` file as `DISCORD_TOKEN`

**Example `.env` entry:**
```env
DISCORD_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 5: Enable Required Intents

Discord bots need explicit permissions to access certain features:

1. Scroll down to "Privileged Gateway Intents"
2. Enable these intents:
   - ✅ **SERVER MEMBERS INTENT**
   - ✅ **MESSAGE CONTENT INTENT**
3. Click "Save Changes" at the bottom

**Why these are needed:**
- **Server Members**: To see and manage server members
- **Message Content**: To read message content for commands

### Step 6: Invite Bot to Your Server

1. In the left sidebar, click "OAuth2" → "URL Generator"
2. Under "SCOPES", select:
   - ✅ `bot`
   - ✅ `applications.commands`
3. Under "BOT PERMISSIONS", select:
   - ✅ `Administrator` (recommended for full functionality)
   - Or select specific permissions:
     - Manage Channels
     - View Channels
     - Send Messages
     - Embed Links
     - Read Message History
4. Copy the generated URL at the bottom
5. Open the URL in your browser
6. Select your server from the dropdown
7. Click "Authorize"
8. Complete the CAPTCHA if prompted

---

## Getting Your Server ID

### Step 1: Enable Developer Mode in Discord

1. Open Discord
2. Click the ⚙️ (User Settings) icon at the bottom left
3. Go to "Advanced" (under "App Settings")
4. Toggle ON "Developer Mode"
5. Close settings

### Step 2: Copy Server ID

1. Right-click your server icon (in the server list on the left)
2. Click "Copy Server ID" at the bottom
3. Paste it in your `.env` file as `GUILD_ID`

**Example `.env` entry:**
```env
GUILD_ID=1424065094223921244
```

**Note:** The server ID is a long number (17-19 digits).

---

## Security Best Practices

### 🔒 Protecting Your Bot Token

**DO:**
- ✅ Keep your token in the `.env` file only
- ✅ Add `.env` to `.gitignore` (already done in this project)
- ✅ Use environment variables for sensitive data
- ✅ Regenerate your token if you suspect it's compromised

**DON'T:**
- ❌ Share your token with anyone
- ❌ Commit your token to git/GitHub
- ❌ Post your token in Discord, forums, or screenshots
- ❌ Hardcode your token in source files

### 🚨 What to Do If Your Token Is Compromised

If your token is exposed or leaked:

1. **Immediately regenerate it:**
   - Go to [Discord Developer Portal](https://discord.com/developers/applications)
   - Select your application
   - Go to "Bot" section
   - Click "Regenerate" under Token
   - Update your `.env` file with the new token

2. **Check for unauthorized activity:**
   - Review your bot's recent actions
   - Check Discord audit logs in your server
   - Remove the bot from any unauthorized servers

3. **Review your security:**
   - Ensure `.env` is in `.gitignore`
   - Check if you committed sensitive data to git
   - Update any shared screenshots or logs

### 📝 Environment File Security

The `.env` file is **automatically excluded** from git:
- It's listed in `.gitignore`
- Use `.env.example` as a template for other developers
- Never commit `.env` to version control

---

## Troubleshooting

### "Invalid Token" Error

**Possible causes:**
- Token was copied incorrectly (extra spaces, missing characters)
- Token was regenerated in Discord Developer Portal
- Token is from a different bot

**Solutions:**
1. Regenerate token in Discord Developer Portal
2. Copy the new token carefully (no extra spaces)
3. Update `.env` file
4. Restart the bot

### "Missing Access" or "403 Forbidden" Errors

**Possible causes:**
- Bot doesn't have required permissions
- Bot is not in the server
- Required intents are not enabled

**Solutions:**
1. Check bot has Administrator permission or specific required permissions
2. Verify bot is invited to the correct server
3. Enable required Gateway Intents in Developer Portal:
   - SERVER MEMBERS INTENT
   - MESSAGE CONTENT INTENT

### "Unknown Guild" Error

**Possible causes:**
- Guild ID is incorrect
- Bot is not a member of that server

**Solutions:**
1. Verify you copied the correct server ID
2. Ensure Developer Mode is enabled in Discord
3. Re-invite the bot to your server
4. Check that GUILD_ID in `.env` matches your server

### Bot Doesn't Respond to Commands

**Possible causes:**
- Commands not registered
- Bot offline
- Insufficient permissions

**Solutions:**
1. Restart the bot (commands register on startup)
2. Check console logs for errors
3. Verify bot shows as "online" in Discord
4. Check bot has permission to read and send messages

### "Rate Limited" Errors

**Cause:**
- Too many Discord API requests in a short time

**Solutions:**
- The bot includes rate limit handling
- Wait a few minutes before retrying
- If persistent, check for loops in code

---

## Example Complete `.env` File

```env
# Discord Bot Configuration

# Your Discord bot token from https://discord.com/developers/applications
DISCORD_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXX

# Your Discord server (guild) ID
GUILD_ID=1424065094223921244
```

---

## Need More Help?

### Useful Resources

- **Discord Developer Portal**: https://discord.com/developers/applications
- **Discord.js Guide**: https://discordjs.guide/
- **Discord.js Documentation**: https://discord.js.org/
- **Discord API Documentation**: https://discord.com/developers/docs

### Common Questions

**Q: Can I use the same bot in multiple servers?**
A: Yes, but this bot is configured for a specific guild (GUILD_ID). For multi-server support, you would need to modify the code to remove guild-specific command registration.

**Q: How do I change which server the bot works with?**
A: Update the `GUILD_ID` in your `.env` file to the new server's ID and restart the bot.

**Q: Can I have multiple bots with different tokens?**
A: Yes, each bot needs its own token. Create separate applications in the Discord Developer Portal.

**Q: What happens if I regenerate my token?**
A: The old token becomes invalid immediately. You must update your `.env` file with the new token and restart the bot.

**Q: Do I need to restart the bot after changing `.env`?**
A: Yes, environment variables are loaded when the bot starts. Any changes require a restart.

---

## Security Checklist

Before running your bot, verify:

- [ ] `.env` file exists and contains valid credentials
- [ ] `.env` is listed in `.gitignore`
- [ ] Bot token has not been shared or committed to git
- [ ] Required Gateway Intents are enabled in Developer Portal
- [ ] Bot has been invited to your server with proper permissions
- [ ] Developer Mode is enabled in Discord (for copying IDs)

---

**Last Updated:** 2024
**Project:** CGE Development Automation Discord Bot
