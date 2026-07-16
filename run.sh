#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Starting Sparkathon Studio Intent-Based Search        ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo "🚀 Starting backend API server on port 3000..."
cd backend
npm start &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 3

# Check if backend is running
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Backend API is ready"
else
    echo "❌ Backend failed to start"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Start frontend
echo ""
echo "🚀 Starting Angular frontend on port 4200..."
ng serve &
FRONTEND_PID=$!

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║   Application Started Successfully!                     ║"
echo "║                                                           ║"
echo "║   Frontend: http://localhost:4200                        ║"
echo "║   Backend:  http://localhost:3000                        ║"
echo "║                                                           ║"
echo "║   Press Ctrl+C to stop both servers                      ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Wait for processes
wait
