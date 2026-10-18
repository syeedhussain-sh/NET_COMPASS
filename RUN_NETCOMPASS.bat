@echo off
title Network Compass - ECE Hackathon Launcher
color 0B

echo ===================================================================
echo               NETWORK COMPASS - LAUNCH CONTROLLER
echo      Cellular RF Telemetry Monitoring & Link Benchmarking
echo ===================================================================
echo.

:: 1. Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not found in your PATH.
    echo Please install Node.js v18 or later from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Verifying dependencies...

:: 2. Check root node_modules
if not exist "node_modules\" (
    echo Installing frontend dependencies...
    call npm install
)

:: 3. Check backend node_modules
if not exist "backend\node_modules\" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    cd ..
)

echo [2/4] Starting Network Compass Backend API on port 5000...
start "Network Compass Backend API (Port 5000)" cmd /c "cd /d "%~dp0backend" && node src/server.js"

:: Give the backend 2 seconds to bind port 5000
timeout /t 2 /nobreak >nul

echo [3/4] Starting Network Compass Frontend (Vite) on port 5173...
start "Network Compass Frontend (Port 5173)" cmd /c "cd /d "%~dp0" && npm run dev"

:: Give Vite 2 seconds to initialize
timeout /t 2 /nobreak >nul

echo [4/4] Opening Network Compass in default browser...
start http://localhost:5173

echo.
echo ===================================================================
echo  Network Compass is now running!
echo  - Frontend Dashboard : http://localhost:5173
echo  - Backend REST API   : http://localhost:5000/api
echo  - Health Check       : http://localhost:5000/api/health
echo.
echo  Keep the opened command windows running to maintain the servers.
echo ===================================================================
echo.
pause
