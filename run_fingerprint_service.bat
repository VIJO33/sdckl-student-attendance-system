@echo off
REM Batch script to start the fingerprint service server on port 8001

REM Assuming this script is run from the "sdckl-attendance-system-new" directory
REM Run the fingerprint service Python server with relative path
python middleware/fingerprint_service.py
