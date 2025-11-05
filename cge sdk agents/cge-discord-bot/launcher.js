#!/usr/bin/env node

/**
 * Robust Bot Launcher with Health Checks and Auto-Restart
 *
 * Features:
 * - Pre-flight validation checks
 * - Process management and monitoring
 * - Health checks every 30 seconds
 * - Auto-restart on crashes
 * - Graceful shutdown handling
 * - Timestamped, color-coded logs
 */

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const readline = require('readline');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// State management
let botProcess = null;
let isShuttingDown = false;
let crashCount = 0;
let restartTimeout = null;
let healthCheckInterval = null;
let lastHealthCheck = Date.now();

/**
 * Get timestamp string
 */
function timestamp() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

/**
 * Print colored message with timestamp
 */
function log(message, color = 'reset', skipTimestamp = false) {
  const ts = skipTimestamp ? '' : `${colors.gray}[${timestamp()}]${colors.reset} `;
  console.log(`${ts}${colors[color]}${message}${colors.reset}`);
}

/**
 * Print section header
 */
function printHeader(title) {
  console.log('');
  log('═'.repeat(60), 'cyan', true);
  log(`  ${title}`, 'bright', true);
  log('═'.repeat(60), 'cyan', true);
  console.log('');
}

/**
 * Check Node.js version
 */
function checkNodeVersion() {
  const version = process.version;
  const major = parseInt(version.split('.')[0].substring(1));
  const minor = parseInt(version.split('.')[1]);

  log(`Checking Node.js version: ${version}`, 'blue');

  if (major < 16 || (major === 16 && minor < 9)) {
    log(`❌ Node.js version ${version} is too old!`, 'red');
    log(`   Required: Node.js 16.9.0 or higher`, 'red');
    log(`   Download from: https://nodejs.org/`, 'yellow');
    return false;
  }

  log(`✅ Node.js version ${version} is compatible`, 'green');
  return true;
}

/**
 * Check if .env file exists and has credentials
 */
function checkEnvFile() {
  const envPath = path.join(__dirname, '.env');

  log('Checking .env file...', 'blue');

  if (!fs.existsSync(envPath)) {
    log('❌ .env file not found!', 'red');
    log('   Run "npm run setup" to configure credentials', 'yellow');
    return false;
  }

  // Read and validate .env
  try {
    const content = fs.readFileSync(envPath, 'utf8');
    const hasToken = content.includes('DISCORD_TOKEN=') &&
                     !content.includes('DISCORD_TOKEN=your_discord_token_here');
    const hasGuildId = content.includes('GUILD_ID=') &&
                       !content.includes('GUILD_ID=your_guild_id_here');

    if (!hasToken || !hasGuildId) {
      log('❌ .env file is missing credentials!', 'red');
      log('   Run "npm run setup" to configure credentials', 'yellow');
      return false;
    }

    log('✅ .env file exists and has credentials', 'green');
    return true;
  } catch (error) {
    log(`❌ Error reading .env file: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Check if node_modules exists
 */
function checkNodeModules() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');

  log('Checking dependencies...', 'blue');

  if (!fs.existsSync(nodeModulesPath)) {
    log('❌ node_modules not found!', 'yellow');
    log('📦 Installing dependencies...', 'cyan');

    try {
      execSync('npm install', {
        stdio: 'inherit',
        cwd: __dirname
      });
      log('✅ Dependencies installed successfully', 'green');
      return true;
    } catch (error) {
      log('❌ Failed to install dependencies!', 'red');
      log(`   Error: ${error.message}`, 'red');
      return false;
    }
  }

  log('✅ Dependencies are installed', 'green');
  return true;
}

/**
 * Check if Discord.js is installed
 */
function checkDiscordJs() {
  log('Checking Discord.js installation...', 'blue');

  try {
    const packageJsonPath = path.join(__dirname, 'node_modules', 'discord.js', 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      log('❌ Discord.js not found!', 'red');
      log('   Run "npm install" to install dependencies', 'yellow');
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    log(`✅ Discord.js v${packageJson.version} is installed`, 'green');
    return true;
  } catch (error) {
    log(`❌ Error checking Discord.js: ${error.message}`, 'red');
    return false;
  }
}

/**
 * Run all pre-flight checks
 */
function runPreflightChecks() {
  printHeader('🔍 Pre-flight Checks');

  const checks = [
    { name: 'Node.js version', fn: checkNodeVersion },
    { name: '.env file', fn: checkEnvFile },
    { name: 'Dependencies', fn: checkNodeModules },
    { name: 'Discord.js', fn: checkDiscordJs }
  ];

  for (const check of checks) {
    if (!check.fn()) {
      console.log('');
      log('❌ Pre-flight checks failed!', 'red');
      log('   Please fix the issues above and try again.', 'yellow');
      console.log('');
      return false;
    }
  }

  console.log('');
  log('✅ All pre-flight checks passed!', 'green');
  console.log('');

  return true;
}

/**
 * Start health check monitoring
 */
function startHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  healthCheckInterval = setInterval(() => {
    if (!botProcess || isShuttingDown) {
      return;
    }

    // Check if process is still running
    try {
      process.kill(botProcess.pid, 0); // Signal 0 checks if process exists
      lastHealthCheck = Date.now();
    } catch (error) {
      // Process doesn't exist anymore
      log('⚠️  Health check failed: Bot process not found', 'yellow');
      handleBotCrash(1);
    }
  }, 30000); // Check every 30 seconds

  log('💊 Health monitoring started (30s interval)', 'blue');
}

/**
 * Stop health check monitoring
 */
function stopHealthCheck() {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
  }
}

/**
 * Start the bot process
 */
function startBot() {
  if (isShuttingDown) {
    return;
  }

  printHeader('🔄 Starting Bot');

  log('Spawning bot process...', 'blue');

  // Spawn the bot using ts-node
  botProcess = spawn('npx', ['ts-node', 'src/index.ts'], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe'],
    env: { ...process.env }
  });

  // Handle stdout (info logs)
  botProcess.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      // Detect "Bot is online!" message
      if (line.includes('Bot is online') || line.includes('ready')) {
        log(`✅ ${line}`, 'green');
      } else {
        log(line, 'blue');
      }
    });
  });

  // Handle stderr (error logs)
  botProcess.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(line => line.trim());
    lines.forEach(line => {
      log(`⚠️  ${line}`, 'red');
    });
  });

  // Handle process exit
  botProcess.on('exit', (code, signal) => {
    botProcess = null;

    if (isShuttingDown) {
      return;
    }

    if (code === 0) {
      log('✅ Bot stopped gracefully', 'green');
    } else {
      log(`❌ Bot crashed with code ${code}`, 'red');
      if (signal) {
        log(`   Killed by signal: ${signal}`, 'red');
      }
      handleBotCrash(code);
    }
  });

  // Handle process errors
  botProcess.on('error', (error) => {
    log(`❌ Error spawning bot process: ${error.message}`, 'red');

    if (error.code === 'ENOENT') {
      log('💡 Suggestion: Make sure ts-node is installed', 'yellow');
      log('   Run: npm install', 'yellow');
    }

    handleBotCrash(1);
  });

  // Start health monitoring
  startHealthCheck();

  log('🎮 Bot process started', 'green');
  log('📊 Logs are being monitored...', 'blue');
  log('⏹️  Press Ctrl+C to stop the bot', 'gray');
  console.log('');
}

/**
 * Handle bot crash
 */
function handleBotCrash(exitCode) {
  stopHealthCheck();

  if (isShuttingDown) {
    return;
  }

  crashCount++;
  console.log('');
  log('━'.repeat(60), 'red', true);
  log(`❌ Bot crashed! (Exit code: ${exitCode})`, 'red');
  log(`   Crash count: ${crashCount}`, 'yellow');
  log(`   Check error-log in Discord for details`, 'yellow');
  log('━'.repeat(60), 'red', true);
  console.log('');

  // Auto-restart after 5 seconds
  log('🔄 Restarting in 5 seconds... (Ctrl+C to cancel)', 'yellow');

  let countdown = 5;
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      process.stdout.write(`\r${colors.yellow}   Restarting in ${countdown}...${colors.reset}`);
    } else {
      process.stdout.write('\r' + ' '.repeat(30) + '\r');
      clearInterval(countdownInterval);
    }
  }, 1000);

  restartTimeout = setTimeout(() => {
    clearInterval(countdownInterval);
    console.log('');
    log('🔄 Attempting restart...', 'cyan');
    console.log('');
    startBot();
  }, 5000);
}

/**
 * Graceful shutdown
 */
function gracefulShutdown(signal) {
  if (isShuttingDown) {
    log('⚠️  Force shutdown requested', 'yellow');
    process.exit(1);
  }

  isShuttingDown = true;

  // Clear any restart timeout
  if (restartTimeout) {
    clearTimeout(restartTimeout);
    restartTimeout = null;
  }

  // Stop health checks
  stopHealthCheck();

  console.log('');
  log('━'.repeat(60), 'yellow', true);
  log('⏹️  Shutting down bot gracefully...', 'yellow');
  log('━'.repeat(60), 'yellow', true);

  if (!botProcess) {
    log('✓ Bot stopped', 'green');
    process.exit(0);
  }

  // Send SIGTERM to bot process
  log('   Sending shutdown signal to bot...', 'blue');
  botProcess.kill('SIGTERM');

  // Wait up to 3 seconds for graceful shutdown
  const shutdownTimeout = setTimeout(() => {
    if (botProcess) {
      log('   ⚠️  Bot did not stop gracefully, forcing shutdown...', 'yellow');
      botProcess.kill('SIGKILL');
    }
  }, 3000);

  // Wait for process to exit
  botProcess.on('exit', () => {
    clearTimeout(shutdownTimeout);
    console.log('');
    log('✓ Bot stopped', 'green');
    console.log('');
    process.exit(0);
  });
}

/**
 * Main entry point
 */
function main() {
  printHeader('🤖 CGE Discord Bot Launcher');

  // Run pre-flight checks
  if (!runPreflightChecks()) {
    process.exit(1);
  }

  // Start the bot
  startBot();

  // Handle shutdown signals
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  // Handle uncaught errors in launcher
  process.on('uncaughtException', (error) => {
    log('❌ Uncaught exception in launcher:', 'red');
    log(`   ${error.message}`, 'red');
    log(`   ${error.stack}`, 'gray');
    gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason, promise) => {
    log('❌ Unhandled promise rejection in launcher:', 'red');
    log(`   ${reason}`, 'red');
  });
}

// Start the launcher
main();
