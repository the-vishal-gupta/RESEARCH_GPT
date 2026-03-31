@echo off
REM ResearchGPT Quick Setup Script for Windows
REM This automates the installation and startup

echo.
echo =========================================
echo   ResearchGPT Setup
echo =========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo OK: Node.js %NODE_VERSION% found
echo.

REM Install dependencies
echo Installing dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo OK: Dependencies installed
echo.

REM Create .env if doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env >nul 2>&1 || (
        echo VITE_CORE_API_KEY= > .env
    )
    echo OK: .env file created (optional: add CORE API key)
)

echo.
echo =========================================
echo   Setup Complete!
echo =========================================
echo.
echo To start development:
echo   npm run dev
echo.
echo Then open: http://localhost:5173
echo.
pause
