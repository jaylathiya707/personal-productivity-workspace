@echo off
title Personal Productivity Workspace
echo ========================================================
echo   Starting Personal Productivity Workspace
echo   Opening http://localhost:3000 in your browser...
echo ========================================================
echo.
timeout /t 2 /nobreak >nul
start http://localhost:3000
node node_modules\next\dist\bin\next dev -p 3000
