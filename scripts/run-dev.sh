#!/bin/bash
# Farm to FeNO — Development Server Launcher
# Run this from the project root directory

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "Starting Farm to FeNO development server..."
echo "Project: $PROJECT_DIR"
echo ""

cd "$PROJECT_DIR"
node node_modules/next/dist/bin/next dev
