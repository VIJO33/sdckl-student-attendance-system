#!/bin/bash
# Script to run biometric device Python service and Node.js HTTP server

# Run biometric device Python script in background
echo "Starting biometric device Python service..."
python3 connect_biometric.py &

# Start Node.js HTTP server on port 8000
echo "Starting Node.js HTTP server on port 8000..."
npx http-server -p 8000

# Note: To stop the biometric Python script, you may need to kill the process manually.
