@echo off
title InkFlow - ngrok + n8n Auto-Start

echo ========================================
echo InkFlow Auto-Start Script
echo ========================================
echo.

REM Check if Docker is running
echo [1/3] Checking Docker...
docker --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Docker is not running or not installed
    echo Please start Docker Desktop first
    pause
    exit /b 1
)
echo Docker is running ✓
echo.

REM Start n8n container
echo [2/3] Starting n8n container...
docker start n8n >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo n8n container not found, trying to run new container...
    docker run -d ^
      --name n8n ^
      -p 5678:5678 ^
      -v %USERPROFILE%\.n8n:/home/node/.n8n ^
      n8nio/n8n
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to start n8n
        pause
        exit /b 1
    )
)
echo n8n started ✓
echo.

REM Wait for n8n to be ready
echo Waiting for n8n to be ready (5 seconds)...
timeout /t 5 /nobreak >nul
echo.

REM Start ngrok tunnel
echo [3/3] Starting ngrok tunnel...
echo.
echo Starting ngrok at http://localhost:5678
echo Custom domain: inkflow.eu.ngrok.io
echo.
echo Press Ctrl+C to stop ngrok (this will break the demo)
echo.

ngrok http 5678 --domain=inkflow.eu.ngrok.io

REM If ngrok exits, pause to see error
echo.
echo ngrok stopped!
pause
