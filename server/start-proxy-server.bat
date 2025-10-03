@echo off
title InkFlow Proxy Server v2.0

echo ========================================
echo InkFlow Proxy Server v2.0
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7+ from https://python.org
    pause
    exit /b 1
)

echo Python version:
python --version
echo.

REM Check for optional dependency
python -c "import psutil" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: psutil not installed - advanced monitoring unavailable
    echo To install: pip install psutil
    echo.
) else (
    echo psutil available - enhanced monitoring enabled
    echo.
)

echo Starting InkFlow Proxy Server with:
echo - Enhanced stability and error handling
echo - Memory leak protection
echo - Connection limits and monitoring  
echo - File upload handling with size limits
echo - Automatic retry logic for n8n connections
echo.

echo Server will be available at:
echo - Landing page: http://localhost:8000
echo - Chat API: http://localhost:8000/api/chat  
echo - Health check: http://localhost:8000/api/health
echo.

echo To stop the server: Press Ctrl+C
echo.

REM Start the proxy server
python proxy_server.py

echo.
echo Server stopped.
pause