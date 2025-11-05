# 🌉 Claude Bridge - Chrome Extension

Send Claude.ai conversations directly to your Bridge Agent with one click.

## Installation

### From Source (Development)

1. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (top right)

2. **Load Extension**:
   - Click "Load unpacked"
   - Select this directory: `claude-bridge-agent/chrome-extension/`

3. **Pin Extension** (optional):
   - Click the puzzle icon in Chrome toolbar
   - Pin "Claude Bridge"

## Usage

### Basic Flow

1. Have a conversation with Claude.ai
2. Click the "🌉 Send to Bridge" button (bottom right)
3. Extension extracts the conversation
4. Sends to your local Bridge Agent
5. Review and execute in Bridge UI

### Settings

Click the extension icon to configure:

- **Bridge API URL**: Default `http://localhost:8080`
- **Default Project**: Select your project
- **Auto-open Bridge**: Open Bridge UI after sending

### Test Connection

Use the "Test Connection" button in settings to verify:
- Bridge Agent is running
- API is accessible
- Connection is working

## Features

✅ **One-Click Send**: Extract and send conversations instantly
✅ **Smart Extraction**: Automatically finds latest user/Claude messages
✅ **Project Selection**: Choose which project to enhance for
✅ **Notifications**: Success/error feedback
✅ **Auto-Open**: Optionally open Bridge UI after sending

## Requirements

- Chrome/Brave browser
- Bridge Agent running locally (`python main.py`)
- Claude.ai Pro account (for conversations)

## Permissions

This extension requires minimal permissions:

- `activeTab`: Read current tab content
- `storage`: Save your settings
- `https://claude.ai/*`: Inject button on Claude.ai

**No data is sent to external servers** - only to your local Bridge Agent.

## Troubleshooting

### "Connection failed"

- Ensure Bridge Agent is running: `python main.py`
- Check API URL in settings matches your Bridge
- Verify port 8080 is not blocked

### "No conversation found"

- Make sure you're on claude.ai with an active chat
- Scroll to ensure messages are loaded
- Try refreshing the page

### Button not appearing

- Refresh Claude.ai page
- Check extension is enabled
- Look in bottom-right corner of page

## Development

### File Structure

```
chrome-extension/
├── manifest.json       # Extension config
├── content.js         # Injects button on Claude.ai
├── content.css        # Button styles
├── popup.html         # Settings UI
├── popup.js           # Settings logic
├── background.js      # Background service worker
└── icons/            # Extension icons
```

### Testing

1. Make changes to files
2. Go to `chrome://extensions/`
3. Click reload icon on Claude Bridge extension
4. Refresh Claude.ai page

### Building for Production

```bash
# Create icons (you'll need to create these)
# Use any size: 16x16, 48x48, 128x128

# Zip for distribution
zip -r claude-bridge-extension.zip chrome-extension/
```

## Privacy

- All processing happens locally
- No telemetry or analytics
- Conversation data stays on your machine
- Open source - audit the code yourself

---

**Made for engineers who want AI-assisted coding with human control** 🚀
