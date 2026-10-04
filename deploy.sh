#!/bin/bash
# Deployment script for PANI-PATH

echo "Building frontend..."
npm install
npm run build

echo "Frontend built to dist/"
echo "Backend will serve static files from dist/"
echo "Deploy backend to Render with render.yaml"
