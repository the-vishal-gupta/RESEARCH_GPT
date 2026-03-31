#!/bin/bash
# ResearchGPT Quick Setup Script
# This automates the installation and startup

echo "🚀 ResearchGPT Setup"
echo "===================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) found"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ npm install failed"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Create .env if doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "VITE_CORE_API_KEY=" > .env
    echo "✅ .env file created (optional: add CORE API key)"
fi

echo ""
echo "🎉 Setup Complete!"
echo ""
echo "To start development:"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:5173"
echo ""
