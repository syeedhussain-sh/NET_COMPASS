@echo off
setlocal EnableDelayedExpansion
title Network Compass - Unified Full-Stack Launcher & Health Monitor
color 0B

echo ===============================================================================
echo                     NETWORK COMPASS - FULL STACK CONTROLLER
echo            Cellular RF Telemetry Monitoring & Link Benchmarking
echo ===============================================================================
echo.

:: -----------------------------------------------------------------------------
:: Step 1: Environment & Tooling Verification
:: -----------------------------------------------------------------------------
echo [Step 1/5] Checking environment prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] Node.js is not found in your system PATH.
    echo Please install Node.js v18 or newer from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo  - Node.js Runtime : %NODE_VERSION% [FOUND]

:: Check root node_modules
if not exist "node_modules\" (
    echo  - Installing frontend dependencies (first-time setup)...
    call npm install
) else (
    echo  - Frontend Packages: node_modules [OK]
)

:: Check backend node_modules
if not exist "backend\node_modules\" (
    echo  - Installing backend dependencies (first-time setup)...
    cd backend
    call npm install
    cd ..
) else (
    echo  - Backend Packages : backend\node_modules [OK]
)
echo.

:: -----------------------------------------------------------------------------
:: Step 2: Start Backend REST API Server (Port 5000)
:: -----------------------------------------------------------------------------
echo [Step 2/5] Starting Backend REST API Server (Port 5000)...

:: Check if port 5000 is already running
curl.exe -s -f http://localhost:5000/api/health >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  - Backend server is already running on port 5000.
) else (
    echo  - Launching backend process...
    start "Network Compass - Backend Server (Port 5000)" /min cmd /c "cd /d "%~dp0backend" && node src/server.js"
    timeout /t 2 /nobreak >nul
)
echo.

:: -----------------------------------------------------------------------------
:: Step 3: Backend API Health Check Verification
:: -----------------------------------------------------------------------------
echo [Step 3/5] Performing live Backend Health Check...

set HEALTH_OK=0
for /l %%i in (1, 1, 6) do (
    curl.exe -s -f http://localhost:5000/api/health >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        set HEALTH_OK=1
        goto :HealthSuccess
    )
    echo    Attempt %%i/6: Waiting for backend to respond...
    timeout /t 1 /nobreak >nul
)

:HealthSuccess
if %HEALTH_OK% EQU 1 (
    color 0A
    echo  -----------------------------------------------------------------------
    echo  [HEALTH CHECK STATUS: 200 OK - PASSED]
    for /f "delims=" %%r in ('curl.exe -s http://localhost:5000/api/health') do (
        echo  Response: %%r
    )
    echo  -----------------------------------------------------------------------
    color 0B
) else (
    color 0E
    echo  [HEALTH CHECK STATUS: WARNING]
    echo  Backend did not respond within 6 seconds.
    echo  The frontend will automatically operate in Resilient Offline Demo Mode.
    color 0B
)
echo.

:: -----------------------------------------------------------------------------
:: Step 4: Start Frontend Vite Dev Server (Port 5173)
:: -----------------------------------------------------------------------------
echo [Step 4/5] Starting Frontend Dashboard (Port 5173)...

curl.exe -s -f http://localhost:5173 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  - Frontend server is already running on port 5173.
) else (
    echo  - Launching Vite development server...
    start "Network Compass - Frontend Dashboard (Port 5173)" /min cmd /c "cd /d "%~dp0" && npm run dev"
    timeout /t 3 /nobreak >nul
)

:: Verify Frontend HTTP Status
curl.exe -s -f http://localhost:5173 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  - Frontend Dashboard HTTP Status: [200 OK - READY]
) else (
    echo  - Frontend Dashboard initializing on port 5173...
)
echo.

:: -----------------------------------------------------------------------------
:: Step 5: Launch Default Browser
:: -----------------------------------------------------------------------------
echo [Step 5/5] Launching Network Compass Dashboard in browser...
start http://localhost:5173

echo.
echo ===============================================================================
echo                    NETWORK COMPASS IS FULLY OPERATIONAL!
echo ===============================================================================
echo.
echo   * Frontend Dashboard : http://localhost:5173
echo   * Backend REST API   : http://localhost:5000/api
echo   * Backend Health     : http://localhost:5000/api/health
echo   * RF Coverage Map    : http://localhost:5000/api/coverage/points
echo   * Telemetry Stream   : http://localhost:5000/api/telemetry/current
echo.
echo ===============================================================================
echo  Interactive Controls:
echo    [H] Run Live Health Check Test
echo    [O] Re-open Dashboard in Web Browser
echo    [Q] Quit Launcher (Servers will continue in background)
echo ===============================================================================
echo.

:Loop
set /p USER_CHOICE="Select an option [H/O/Q]: "
if /i "%USER_CHOICE%"=="H" goto :DoHealthCheck
if /i "%USER_CHOICE%"=="O" goto :DoOpenBrowser
if /i "%USER_CHOICE%"=="Q" goto :DoQuit
goto :Loop

:DoHealthCheck
echo.
echo --- Querying http://localhost:5000/api/health ---
for /f "delims=" %%r in ('curl.exe -s http://localhost:5000/api/health') do (
    echo  Response: %%r
)
echo.
goto :Loop

:DoOpenBrowser
echo.
echo Opening http://localhost:5173 in browser...
start http://localhost:5173
echo.
goto :Loop

:DoQuit
echo.
echo Exiting launcher controller.
timeout /t 1 /nobreak >nul
exit /b 0
