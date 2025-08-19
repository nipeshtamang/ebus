#!/bin/bash

# eBus Common Package Setup Script
# This script builds the common package and installs it in all apps

set -e

echo "🔧 Setting up eBus Common Package..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

print_status "Building common package..."
cd packages/common

# Clean previous builds
if [ -f "ebusewa-common-*.tgz" ]; then
    rm ebusewa-common-*.tgz
    print_status "Cleaned previous tarball"
fi

# Build the package
npm run build
print_success "Common package built successfully"

# Create tarball
npm pack
TARBALL=$(ls ebusewa-common-*.tgz)
print_success "Created tarball: $TARBALL"

# Go back to root
cd ../..

# Install in all apps
APPS=("apps/client" "apps/admin" "apps/superadmin")

for app in "${APPS[@]}"; do
    print_status "Installing common package in $app..."
    cd "$app"
    
    # Remove existing common package if it exists
    if [ -d "node_modules/@ebusewa/common" ]; then
        rm -rf node_modules/@ebusewa/common
        print_status "Removed existing common package"
    fi
    
    # Install the new tarball
    npm install "../../packages/common/$TARBALL"
    print_success "Installed in $app"
    
    cd ../..
done

print_success "✅ Common package setup completed successfully!"
echo ""
print_status "You can now run:"
echo "  npm run build    # Build all applications"
echo "  npm start        # Start all services"
echo "  npm run status   # Check service status" 