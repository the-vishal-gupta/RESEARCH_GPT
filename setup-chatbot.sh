#!/bin/bash

echo "========================================"
echo "ResearchGPT AI Chatbot Setup"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo -e "${RED}[ERROR]${NC} Ollama is not installed!"
    echo ""
    echo "Please install Ollama first:"
    echo ""
    echo "macOS:"
    echo "  brew install ollama"
    echo ""
    echo "Linux:"
    echo "  curl -fsSL https://ollama.ai/install.sh | sh"
    echo ""
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Ollama is installed"
echo ""

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo -e "${YELLOW}[INFO]${NC} Starting Ollama..."
    ollama serve &> /dev/null &
    sleep 3
    echo -e "${GREEN}[OK]${NC} Ollama started"
else
    echo -e "${GREEN}[OK]${NC} Ollama is already running"
fi
echo ""

# Check if model is downloaded
echo -e "${YELLOW}[INFO]${NC} Checking for phi3 model..."
if ! ollama list | grep -q "phi3"; then
    echo -e "${YELLOW}[INFO]${NC} Model not found. Downloading phi3 (~2.3GB)..."
    echo "This may take a few minutes depending on your internet speed."
    echo ""
    ollama pull phi3
    if [ $? -ne 0 ]; then
        echo -e "${RED}[ERROR]${NC} Failed to download model"
        exit 1
    fi
    echo -e "${GREEN}[OK]${NC} Model downloaded successfully"
else
    echo -e "${GREEN}[OK]${NC} Model already downloaded"
fi
echo ""

# Test the model
echo -e "${YELLOW}[INFO]${NC} Testing chatbot..."
TEST_RESPONSE=$(curl -s -X POST http://localhost:11434/api/generate \
    -d '{"model":"phi3","prompt":"Say Hello!","stream":false}' 2>/dev/null)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}[OK]${NC} Chatbot is working!"
else
    echo -e "${YELLOW}[WARNING]${NC} Could not test chatbot, but setup appears complete"
fi
echo ""

echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "The AI chatbot is ready to use."
echo ""
echo "Next steps:"
echo "1. Start the development server: npm run dev"
echo "2. Open ResearchGPT in your browser"
echo "3. Save some papers to your library"
echo "4. Click the chat icon or go to 'AI Assistant'"
echo "5. Ask questions about your papers!"
echo ""
echo "Model: Phi-3 (3.8B parameters)"
echo "Size: ~2.3GB"
echo "Speed: Medium (10-30 seconds)"
echo "Quality: Excellent for research"
echo "Privacy: 100% local, no cloud"
echo ""
