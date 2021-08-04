#!/bin/bash
# Current status
echo "Starting run.sh"
date
echo "Current directory:"
pwd

echo "Installing yarn"
npm install -g yarn@^1.19.1

# Install npm packages
echo "Installing required npm packages"
yarn install
echo "npm packages installed"

# Build application
echo "Building api"
yarn build

# Run the application
echo "Starting api"
yarn server

# Keep container running
tail -f /dev/null
