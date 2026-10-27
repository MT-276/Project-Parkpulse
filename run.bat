@echo off
echo ==========================================
echo   ParkPulse - Smart Parking System
echo ==========================================
echo.
echo Starting backend (FastAPI)...
start "" "cmd" /k "cd /d backend && pip install -r requirements.txt && uvicorn app.main:app --reload --host 0.0.0.0 --port 1654"
echo Starting frontend (Vite + React)...
start "" "cmd" /k "cd /d frontend && npm run dev"
echo.
echo Backend: http://localhost:1654
echo Frontend: http://localhost:1147
echo API Docs: http://localhost:1654/docs
echo.