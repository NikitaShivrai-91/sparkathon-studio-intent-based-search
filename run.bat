@echo off
echo ╔══════════════════════════════════════════════════════════╗
echo ║   Starting Sparkathon Studio Intent-Based Search        ║
echo ╚══════════════════════════════════════════════════════════╝
echo.

echo 🚀 Starting backend API server on port 3000...
start "Backend API" cmd /k "cd backend && npm start"

timeout /t 5 /nobreak >nul

echo.
echo 🚀 Starting Angular frontend on port 4200...
start "Angular Frontend" cmd /k "ng serve"

echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║   Application Starting...                                ║
echo ║                                                           ║
echo ║   Frontend: http://localhost:4200                        ║
echo ║   Backend:  http://localhost:3000                        ║
echo ║                                                           ║
echo ║   Two command windows will open.                         ║
echo ║   Close them to stop the servers.                        ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
pause
