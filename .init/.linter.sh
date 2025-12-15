#!/bin/bash
cd /home/kavia/workspace/code-generation/freelancer-time-tracker-and-analytics-186558-186567/time_tracking_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

