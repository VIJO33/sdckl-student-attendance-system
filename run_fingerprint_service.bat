@echo off
REM Batch script to start the fingerprint service server on port 8001

REM Change directory to the project folder
cd /d "C:\xampp\htdocs\sdckl-student-attendance-system-main (2)\sdkl-attendance-system-new"

REM Run the fingerprint service Python server
python middleware/fingerprint_service.py
