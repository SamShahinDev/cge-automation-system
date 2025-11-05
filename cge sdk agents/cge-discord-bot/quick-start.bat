@echo off
REM CGE Discord Bot - Quick Start Script (Windows)
REM This script handles everything needed to get the bot running

setlocal enabledelayedexpansion

color 0B
echo.
echo ================================================================
echo   🚀 CGE Discord Bot - Quick Start
echo ================================================================
echo.

REM Step 1: Check if Node.js is installed
echo [1/6] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ❌ Node.js is not installed
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Required version: 16.9.0 or higher
    echo.
    pause
    exit /b 1
)

REM Step 2: Check Node.js version
for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
set NODE_VERSION=%NODE_VERSION:v=%

REM Extract major and minor version
for /f "tokens=1,2 delims=." %%a in ("%NODE_VERSION%") do (
    set NODE_MAJOR=%%a
    set NODE_MINOR=%%b
)

if %NODE_MAJOR% LSS 16 (
    color 0C
    echo ❌ Node.js version 16.9.0 or higher required
    echo    Current version: v%NODE_VERSION%
    echo.
    echo Please update Node.js from: https://nodejs.org
    echo.
    pause
    exit /b 1
)

if %NODE_MAJOR% EQU 16 (
    if %NODE_MINOR% LSS 9 (
        color 0C
        echo ❌ Node.js version 16.9.0 or higher required
        echo    Current version: v%NODE_VERSION%
        echo.
        echo Please update Node.js from: https://nodejs.org
        echo.
        pause
        exit /b 1
    )
)

echo ✅ Node.js v%NODE_VERSION% detected
echo.

REM Step 3: Check if npm is installed
echo [2/6] Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ❌ npm is not installed
    echo.
    echo npm should come with Node.js. Please reinstall Node.js.
    echo.
    pause
    exit /b 1
)

for /f "tokens=1" %%i in ('npm -v') do set NPM_VERSION=%%i
echo ✅ npm v%NPM_VERSION% detected
echo.

REM Step 4: Install dependencies
echo [3/6] Checking dependencies...
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        color 0C
        echo.
        echo ❌ Failed to install dependencies
        echo.
        pause
        exit /b 1
    )
    echo.
    echo ✅ Dependencies installed
) else (
    echo ✅ Dependencies already installed
)
echo.

REM Step 5: Check for .env file
echo [4/6] Checking configuration...
if not exist ".env" (
    echo 📝 Creating .env file from template...

    if not exist ".env.example" (
        color 0C
        echo ❌ .env.example file not found!
        echo.
        pause
        exit /b 1
    )

    copy .env.example .env >nul
    echo ✅ .env file created
    echo.
    color 0E
    echo ================================================================
    echo   ⚠️  CREDENTIALS REQUIRED
    echo ================================================================
    echo.
    echo A .env file has been created, but you need to add your credentials:
    echo.
    echo   1. Discord Bot Token
    echo      Get it from: https://discord.com/developers/applications
    echo.
    echo   2. Discord Server ID
    echo      Right-click your server → Copy Server ID
    echo      ^(Enable Developer Mode in Discord settings first^)
    echo.
    echo Quick Setup:
    echo   1. Open .env in a text editor
    echo   2. Replace YOUR_BOT_TOKEN_HERE with your bot token
    echo   3. Replace YOUR_SERVER_ID_HERE with your server ID
    echo   4. Save the file
    echo   5. Run this script again: quick-start.bat
    echo.
    echo 📖 For detailed help, see: CREDENTIALS.md
    echo.
    pause
    exit /b 0
)

REM Step 6: Validate credentials
echo [5/6] Validating credentials...

REM Check if credentials are still placeholders
findstr /C:"your_discord_token_here" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    color 0C
    echo ❌ Bot token not configured in .env
    echo.
    echo Please edit .env and replace:
    echo   DISCORD_TOKEN=YOUR_BOT_TOKEN_HERE
    echo.
    echo With your actual Discord bot token from:
    echo   https://discord.com/developers/applications
    echo.
    echo 📖 Need help? Check CREDENTIALS.md
    echo.
    pause
    exit /b 1
)

findstr /C:"YOUR_BOT_TOKEN_HERE" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    color 0C
    echo ❌ Bot token not configured in .env
    echo.
    echo Please edit .env and replace the placeholder with your actual bot token
    echo.
    pause
    exit /b 1
)

findstr /C:"your_guild_id_here" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    color 0C
    echo ❌ Server ID not configured in .env
    echo.
    echo Please edit .env and replace:
    echo   GUILD_ID=YOUR_SERVER_ID_HERE
    echo.
    echo With your Discord server ID:
    echo   1. Enable Developer Mode in Discord ^(Settings → Advanced^)
    echo   2. Right-click your server icon
    echo   3. Click 'Copy Server ID'
    echo.
    echo 📖 Need help? Check CREDENTIALS.md
    echo.
    pause
    exit /b 1
)

findstr /C:"YOUR_SERVER_ID_HERE" .env >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    color 0C
    echo ❌ Server ID not configured in .env
    echo.
    echo Please edit .env and replace the placeholder with your actual server ID
    echo.
    pause
    exit /b 1
)

REM Extract credentials for display
for /f "tokens=2 delims==" %%a in ('findstr /C:"DISCORD_TOKEN=" .env') do set DISCORD_TOKEN=%%a
for /f "tokens=2 delims==" %%a in ('findstr /C:"GUILD_ID=" .env') do set GUILD_ID=%%a

REM Check if credentials are empty
if "%DISCORD_TOKEN%"=="" (
    color 0C
    echo ❌ DISCORD_TOKEN is empty in .env
    echo.
    pause
    exit /b 1
)

if "%GUILD_ID%"=="" (
    color 0C
    echo ❌ GUILD_ID is empty in .env
    echo.
    pause
    exit /b 1
)

echo ✅ Credentials validated
echo.

REM Step 7: Ready to launch
echo [6/6] Preparing to start bot...
echo ✅ All checks passed!
echo.
color 0B
echo ================================================================
echo   🚀 Starting CGE Discord Bot
echo ================================================================
echo.
echo Bot Token: %DISCORD_TOKEN:~0,20%...
echo Server ID: %GUILD_ID%
echo.
echo Press Ctrl+C to stop the bot
echo.
echo ----------------------------------------------------------------
echo.

REM Launch the bot using the launcher
call npm run start

if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo.
    echo ❌ Bot exited with an error
    echo.
    pause
    exit /b 1
)
