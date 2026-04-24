#!/bin/bash
# SUVIDHA Connect — Start both frontend and backend

echo "🚀 Starting SUVIDHA Connect..."
echo ""

# Install backend deps if needed
if [ ! -d "server/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd server && npm install && cd ..
fi

# Start backend on port 3002 (3001 may be used by other apps)
echo "🔧 Starting backend on http://localhost:3002..."
cd server && node src/index.js &
BACKEND_PID=$!
cd ..

sleep 3

# Start frontend
echo "🌐 Starting frontend on http://localhost:8080..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ SUVIDHA Connect is running!"
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://localhost:3002"
echo "   Health:   http://localhost:3002/health"
echo ""
echo "   Demo Login:"
echo "   Mobile: 9876543210  OTP: 123456"
echo "   Consumer ID: ELEC2024001  PIN: 1234"
echo ""
echo "Press Ctrl+C to stop both servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait
