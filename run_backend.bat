@echo off
cd /d "%~dp0"
set PYTHONPATH=.
echo Starting backend server...
python -m uvicorn src.app:app --reload --host 0.0.0.0 --port 8000
pause