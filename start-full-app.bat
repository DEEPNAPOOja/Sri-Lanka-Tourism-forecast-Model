@echo off
echo 🌴 Sri Lanka Tourism Arrival Forecasting Model 🌴
echo ================================================
echo 🚀 Starting Full Stack Application...
echo.

echo 📡 Starting Backend API Server...
start "Backend API" cmd /k "cd /d "C:\Users\dell\OneDrive\Desktop\L4S1\ML & Pattern Recognition\tourism-forecast-ml" && python -m uvicorn src.app:app --reload --port 8000"

echo ⏳ Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak >nul

echo 🎨 Starting Frontend Development Server...
start "Frontend UI" cmd /k "cd /d "C:\Users\dell\OneDrive\Desktop\L4S1\ML & Pattern Recognition\tourism-forecast-ml\frontend" && node ".\node_modules\vite\bin\vite.js""

echo.
echo ✅ Application Starting Complete!
echo 📍 Frontend: http://localhost:5173/
echo 📍 Backend:  http://localhost:8000/
echo.
echo Press any key to exit this launcher...
pause >nul