#!/bin/bash

# Run the application
exec uvicorn "main:app" --host "0.0.0.0" --port "8080"
