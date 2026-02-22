@echo off
echo Building and starting Tourism Forecast Application...
echo.

echo Building Docker containers...
docker-compose build

echo.
echo Starting services...
docker-compose up -d

echo.
echo Application is starting...
echo Backend API: http://localhost:8000
echo Frontend App: http://localhost
echo.

echo Waiting for services to be ready...
timeout /t 10 /nobreak

echo.
echo Checking service status...
docker-compose ps

echo.
echo Application is ready!
echo Visit http://localhost to access the Tourism Forecast Dashboard
echo.
pause