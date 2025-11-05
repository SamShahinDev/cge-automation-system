#!/usr/bin/env node

/**
 * Interactive Setup Helper for CGE Discord Bot
 *
 * This script guides users through the configuration process,
 * validates credentials, and starts the bot when ready.
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

/**
 * Print colored message
 */
function print(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print section header
 */
function printHeader(title) {
  console.log('');
  print('═'.repeat(60), 'cyan');
  print(`  ${title}`, 'bright');
  print('═'.repeat(60), 'cyan');
  console.log('');
}

/**
 * Check if .env file exists, create from example if not
 */
function ensureEnvFile() {
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');

  if (!fs.existsSync(envPath)) {
    print('📋 No .env file found. Creating from .env.example...', 'yellow');

    if (!fs.existsSync(envExamplePath)) {
      print('❌ Error: .env.example file not found!', 'red');
      print('   Please ensure .env.example exists in the project directory.', 'red');
      process.exit(1);
    }

    try {
      fs.copyFileSync(envExamplePath, envPath);
      print('✅ Created .env file from template', 'green');
      return false; // Indicates new file, needs configuration
    } catch (error) {
      print(`❌ Error creating .env file: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  return true; // File exists
}

/**
 * Read and parse .env file
 */
function readEnvFile() {
  const envPath = path.join(__dirname, '.env');

  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const env = {};

    content.split('\n').forEach(line => {
      const trimmed = line.trim();

      // Skip comments and empty lines
      if (trimmed.startsWith('#') || !trimmed) {
        return;
      }

      // Parse KEY=VALUE
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        env[key] = value;
      }
    });

    return env;
  } catch (error) {
    print(`❌ Error reading .env file: ${error.message}`, 'red');
    process.exit(1);
  }
}

/**
 * Validate Discord token format
 */
function validateToken(token) {
  if (!token || token === 'your_discord_token_here' || token === 'YOUR_BOT_TOKEN_HERE') {
    return { valid: false, reason: 'Token not set' };
  }

  // Discord tokens typically have dots and are fairly long
  if (token.length < 50) {
    return { valid: false, reason: 'Token appears too short' };
  }

  // Check for common placeholder patterns
  if (token.includes('your_') || token.includes('YOUR_') || token.includes('xxx')) {
    return { valid: false, reason: 'Token appears to be a placeholder' };
  }

  return { valid: true };
}

/**
 * Validate Discord guild ID format
 */
function validateGuildId(guildId) {
  if (!guildId || guildId === 'your_guild_id_here' || guildId === 'YOUR_SERVER_ID_HERE') {
    return { valid: false, reason: 'Guild ID not set' };
  }

  // Discord IDs are numeric strings (snowflakes)
  if (!/^\d+$/.test(guildId)) {
    return { valid: false, reason: 'Guild ID should only contain numbers' };
  }

  // Discord IDs are typically 17-19 digits
  if (guildId.length < 17 || guildId.length > 20) {
    return { valid: false, reason: 'Guild ID length is unusual (should be 17-19 digits)' };
  }

  return { valid: true };
}

/**
 * Print setup instructions
 */
function printSetupInstructions() {
  printHeader('⚠️  SETUP REQUIRED');

  print('Your Discord bot credentials are not configured yet.', 'yellow');
  print('Please follow these steps:', 'yellow');
  console.log('');

  print('1️⃣  Open the .env file in a text editor', 'cyan');
  print('   Located at: ' + path.join(__dirname, '.env'), 'cyan');
  console.log('');

  print('2️⃣  Replace the placeholder values:', 'cyan');
  print('   • DISCORD_TOKEN → Your bot token from Discord Developer Portal', 'cyan');
  print('   • GUILD_ID → Your Discord server ID', 'cyan');
  console.log('');

  print('3️⃣  Save the file and run this command again:', 'cyan');
  print('   npm run setup', 'green');
  console.log('');

  print('═'.repeat(60), 'yellow');
  print('📚 Need help finding these credentials?', 'bright');
  print('═'.repeat(60), 'yellow');
  console.log('');

  print('Bot Token:', 'bright');
  print('  1. Go to https://discord.com/developers/applications', 'cyan');
  print('  2. Select your application (or create a new one)', 'cyan');
  print('  3. Go to the "Bot" section', 'cyan');
  print('  4. Click "Reset Token" and copy the new token', 'cyan');
  print('  5. Enable required intents:', 'cyan');
  print('     - SERVER MEMBERS INTENT', 'yellow');
  print('     - MESSAGE CONTENT INTENT', 'yellow');
  console.log('');

  print('Server ID (Guild ID):', 'bright');
  print('  1. Enable Developer Mode in Discord:', 'cyan');
  print('     User Settings → Advanced → Developer Mode', 'cyan');
  print('  2. Right-click your server icon', 'cyan');
  print('  3. Click "Copy Server ID"', 'cyan');
  console.log('');

  print('📖 For detailed instructions, see: CREDENTIALS.md', 'blue');
  console.log('');

  print('⚠️  SECURITY WARNING', 'red');
  print('Never share your bot token with anyone!', 'red');
  print('Never commit the .env file to version control!', 'red');
  console.log('');
}

/**
 * Validate credentials
 */
function validateCredentials(env) {
  const errors = [];
  const warnings = [];

  // Validate token
  const tokenValidation = validateToken(env.DISCORD_TOKEN);
  if (!tokenValidation.valid) {
    errors.push(`DISCORD_TOKEN: ${tokenValidation.reason}`);
  }

  // Validate guild ID
  const guildValidation = validateGuildId(env.GUILD_ID);
  if (!guildValidation.valid) {
    errors.push(`GUILD_ID: ${guildValidation.reason}`);
  }

  return { errors, warnings };
}

/**
 * Print validation results
 */
function printValidationResults(validation) {
  if (validation.errors.length > 0) {
    printHeader('❌ Configuration Errors');
    validation.errors.forEach(error => {
      print(`  • ${error}`, 'red');
    });
    console.log('');
    return false;
  }

  if (validation.warnings.length > 0) {
    printHeader('⚠️  Configuration Warnings');
    validation.warnings.forEach(warning => {
      print(`  • ${warning}`, 'yellow');
    });
    console.log('');
  }

  return true;
}

/**
 * Start the bot
 */
function startBot() {
  printHeader('🚀 Starting CGE Discord Bot');

  print('Bot is launching...', 'green');
  console.log('');
  print('Press Ctrl+C to stop the bot', 'yellow');
  console.log('');
  print('─'.repeat(60), 'cyan');
  console.log('');

  // Determine which command to run based on environment
  const isDevelopment = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';
  const command = isDevelopment ? 'ts-node' : 'ts-node';
  const args = ['src/index.ts'];

  // Spawn the bot process
  const botProcess = spawn(command, args, {
    stdio: 'inherit',
    cwd: __dirname
  });

  // Handle bot process exit
  botProcess.on('exit', (code) => {
    console.log('');
    if (code === 0) {
      print('✅ Bot stopped gracefully', 'green');
    } else {
      print(`❌ Bot exited with code ${code}`, 'red');
      process.exit(code);
    }
  });

  // Handle errors
  botProcess.on('error', (error) => {
    console.log('');
    print('❌ Error starting bot:', 'red');
    print(`   ${error.message}`, 'red');
    console.log('');

    if (error.code === 'ENOENT') {
      print('💡 Suggestion: Run "npm install" to install dependencies', 'yellow');
    }

    process.exit(1);
  });

  // Handle Ctrl+C
  process.on('SIGINT', () => {
    console.log('');
    print('⏹️  Shutting down...', 'yellow');
    botProcess.kill('SIGINT');
  });

  process.on('SIGTERM', () => {
    console.log('');
    print('⏹️  Shutting down...', 'yellow');
    botProcess.kill('SIGTERM');
  });
}

/**
 * Main setup function
 */
function main() {
  printHeader('🤖 CGE Discord Bot - Setup Helper');

  print('Checking configuration...', 'cyan');
  console.log('');

  // Step 1: Ensure .env file exists
  const envExisted = ensureEnvFile();

  // Step 2: Read .env file
  const env = readEnvFile();

  // Step 3: Validate credentials
  const validation = validateCredentials(env);

  // Step 4: Check if setup is needed
  if (validation.errors.length > 0) {
    printSetupInstructions();
    printValidationResults(validation);

    print('Please configure your credentials and run this script again.', 'yellow');
    console.log('');
    process.exit(1);
  }

  // Step 5: Print any warnings
  if (validation.warnings.length > 0) {
    printValidationResults(validation);
  }

  // Step 6: Configuration looks good!
  print('✅ Configuration looks good!', 'green');
  print(`   Token: ${env.DISCORD_TOKEN.substring(0, 20)}...`, 'green');
  print(`   Guild ID: ${env.GUILD_ID}`, 'green');
  console.log('');

  // Step 7: Start the bot
  startBot();
}

// Run the setup
main();
