@echo off
setlocal EnableDelayedExpansion

:: Ensure we are always executing from the project root directory
cd /d "%~dp0"

title Network Compass - Unified Full-Stack Launcher ^& Health Monitor
color 0B

echo ===============================================================================
echo                     NETWORK COMPASS - FULL STACK CONTROLLER
echo            Cellular RF Telemetry Monitoring ^& Link Benchmarking
echo ===============================================================================
echo.
echo Project Directory: %~dp0
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

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo [ERROR] npm is not found in your system PATH.
    echo Please ensure npm is installed and added to your PATH.
    echo.
    pause
    exit /b 1
)

:: Check root node_modules
if not exist "node_modules\" (
    echo  - Installing frontend dependencies [first-time setup]...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        color 0C
        echo [ERROR] Frontend npm install failed. Please check your network and npm configuration.
        pause
        exit /b 1
    )
) else (
    echo  - Frontend Packages: node_modules [OK]
)

:: Check backend node_modules
if not exist "backend\node_modules\" (
    echo  - Installing backend dependencies [first-time setup]...
    cd backend
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        color 0C
        echo [ERROR] Backend npm install failed.
        pause
        exit /b 1
    )
    cd ..
) else (
    echo  - Backend Packages : backend\node_modules [OK]
)
echo.

:: -----------------------------------------------------------------------------
:: Step 2: Start Backend REST API Server (Port 5000)
:: -----------------------------------------------------------------------------
echo [Step 2/5] Starting Backend REST API Server (Port 5000)...

curl.exe -s -f http://localhost:5000/api/health >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  - Backend server is already running and healthy on port 5000.
) else (
    echo  - Launching backend server process in dedicated window...
    start "Network Compass - Backend Server (Port 5000)" /D "%~dp0backend" cmd /k "node src/server.js"
    ping 127.0.0.1 -n 3 >nul
)
echo.

:: -----------------------------------------------------------------------------
:: Step 3: Backend API Health Check Verification
:: -----------------------------------------------------------------------------
echo [Step 3/5] Verifying Backend Health Check at http://localhost:5000/api/health...

set HEALTH_OK=0
for /l %%i in (1, 1, 10) do (
    curl.exe -s -f http://localhost:5000/api/health >nul 2>nul
    if !ERRORLEVEL! EQU 0 (
        set HEALTH_OK=1
        goto :HealthSuccess
    )
    echo    Attempt %%i/10: Waiting for backend to respond...
    ping 127.0.0.1 -n 2 >nul
)

:HealthSuccess
if %HEALTH_OK% EQU 1 (
    echo  -----------------------------------------------------------------------
    echo  [HEALTH CHECK STATUS: 200 OK - PASSED]
    for /f "delims=" %%r in ('curl.exe -s http://localhost:5000/api/health') do (
        echo  Response: %%r
    )
    echo  -----------------------------------------------------------------------
) else (
    echo  -----------------------------------------------------------------------
    echo  [WARNING] Backend did not respond on port 5000 within 10 seconds.
    echo  The frontend will automatically operate with resilient offline fallback.
    echo  -----------------------------------------------------------------------
)
echo.

:: -----------------------------------------------------------------------------
:: Step 4: Start Frontend Vite Dev Server (Port 5173)
:: -----------------------------------------------------------------------------
echo [Step 4/5] Starting Frontend Dashboard (Port 5173)...

curl.exe -s -f http://localhost:5173 >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo  - Frontend Vite server is already running on port 5173.
    set FRONTEND_READY=1
) else (
    echo  - Launching Vite dev server in dedicated window...
    start "Network Compass - Frontend Dashboard (Port 5173)" /D "%~dp0" cmd /k "npm run dev"
    
    echo  - Waiting for Frontend Vite server to become ready...
    set FRONTEND_READY=0
    for /l %%i in (1, 1, 15) do (
        curl.exe -s -f http://localhost:5173 >nul 2>nul
        if !ERRORLEVEL! EQU 0 (
            set FRONTEND_READY=1
            goto :FrontendSuccess
        )
        echo    Attempt %%i/15: Waiting for http://localhost:5173...
        ping 127.0.0.1 -n 2 >nul
    )
)

:FrontendSuccess
if %FRONTEND_READY% EQU 1 (
    echo  - Frontend Dashboard HTTP Status: [200 OK - READY]
) else (
    echo  - [WARNING] Frontend took longer than 15 seconds to respond.
    echo  Opening browser now; please refresh if the page is still loading.
)
echo.

:: -----------------------------------------------------------------------------
:: Step 5: Launch Default Browser
:: -----------------------------------------------------------------------------
echo [Step 5/5] Launching Network Compass Dashboard in your default browser...
start "" "http://localhost:5173"

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
echo    [S] Open Backend API in Web Browser
echo    [Q] Quit Launcher Console (Servers continue in separate windows)
echo ===============================================================================
echo.

:Loop
set "USER_CHOICE="
set /p "USER_CHOICE=Select an option [H/O/S/Q] (or close window): "
if not defined USER_CHOICE (
    goto :LoopWait
)
if /i "%USER_CHOICE%"=="H" goto :DoHealthCheck
if /i "%USER_CHOICE%"=="O" goto :DoOpenBrowser
if /i "%USER_CHOICE%"=="S" goto :DoOpenBackend
if /i "%USER_CHOICE%"=="Q" goto :DoQuit
echo Invalid option selected: "%USER_CHOICE%". Please choose H, O, S, or Q.
echo.
goto :Loop

:LoopWait
ping 127.0.0.1 -n 3 >nul
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
echo Opening http://localhost:5173 in default browser...
start "" "http://localhost:5173"
echo.
goto :Loop

:DoOpenBackend
echo.
echo Opening http://localhost:5000/api/health in default browser...
start "" "http://localhost:5000/api/health"
echo.
goto :Loop

:DoQuit
echo.
echo Exiting launcher controller. The server windows will continue running.
ping 127.0.0.1 -n 2 >nul
exit /b 0
