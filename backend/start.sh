#!/bin/bash

echo "=========================================="
echo "🎨 Masterpiece Purbalingga Design Visualizer"
echo "=========================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from example..."
    cp .env.example .env
    echo ""
    echo "✅ .env created!"
    echo "⚠️  Please edit backend/.env and add your HUGGINGFACE_API_TOKEN"
    echo ""
    echo "Get your token from: https://huggingface.co/settings/tokens"
    echo ""
    read -p "Press Enter after you've added your token..."
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -q -r requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎨 Starting Design Visualizer Backend..."
echo "   Server: http://localhost:5000"
echo "   Health: http://localhost:5000/health"
echo ""

# Run the Flask app
python app.py
