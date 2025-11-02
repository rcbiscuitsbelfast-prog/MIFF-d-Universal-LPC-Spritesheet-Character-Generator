#!/bin/bash

# Render Deployment Script
# This script prepares the application for deployment on Render

set -e

echo "?????????????????????????????????????????????????????????????????????????????"
echo "?              LPC Avatar Builder - Render Deployment                      ?"
echo "?????????????????????????????????????????????????????????????????????????????"
echo ""

# Check environment
if [ -z "$RENDER" ]; then
    echo "??  Warning: Not running on Render. This script is optimized for Render deployment."
fi

echo "?? Step 1: Installing dependencies..."
npm ci --production

echo "?? Step 2: Initializing submodules..."
if [ -f ".gitmodules" ]; then
    git submodule init
    git submodule update --recursive
    echo "? Submodules initialized"
else
    echo "??  No .gitmodules found, skipping submodule initialization"
fi

echo "?? Step 3: Setting up asset paths..."
# Create symlink if spritesheets directory doesn't exist
if [ ! -d "spritesheets" ] && [ -d "assets/lpc/spritesheets" ]; then
    ln -s assets/lpc/spritesheets spritesheets
    echo "? Symlink created: spritesheets -> assets/lpc/spritesheets"
fi

echo "?? Step 4: Creating persistent directories..."
mkdir -p /opt/render/project/data/uploads 2>/dev/null || mkdir -p data/uploads
echo "? Upload directory created"

echo "?? Step 5: Verifying setup..."
if [ -d "spritesheets" ]; then
    SPRITE_COUNT=$(find spritesheets -name "*.png" 2>/dev/null | wc -l)
    echo "? Found $SPRITE_COUNT sprite files"
else
    echo "??  Warning: Spritesheets directory not found"
fi

if [ -d "modules/avatar-builder" ]; then
    echo "? Avatar builder module found"
else
    echo "? Error: Avatar builder module not found"
    exit 1
fi

echo ""
echo "? Deployment preparation complete!"
echo ""
echo "Server will start with:"
echo "  PORT: ${PORT:-3000}"
echo "  NODE_ENV: ${NODE_ENV:-production}"
echo "  PERSISTENT_DISK: ${PERSISTENT_DISK_PATH:-/opt/render/project/data}"
echo ""
