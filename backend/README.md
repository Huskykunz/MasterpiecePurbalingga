# Masterpiece Purbalingga Design Visualizer Backend

## Overview
This Flask backend provides AI-powered exhaust visualization using Hugging Face's Stable Diffusion XL model.

## Features
- **Prompt Engineering**: Automatically enhances user input with professional keywords
- **High-Quality Output**: Generates 8K resolution product photography style images
- **CORS Enabled**: Works seamlessly with the React frontend
- **Error Handling**: Robust error handling and validation

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure API Token

#### Option A: Hugging Face (Recommended - Free)
1. Go to https://huggingface.co/settings/tokens
2. Create a new token with "Read" access
3. Copy the token

#### Option B: OpenAI DALL-E (Paid)
1. Get API key from https://platform.openai.com/api-keys
2. Note: This requires credits/payment

### 3. Set Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your API token:
```
HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx
```

### 4. Run the Server
```bash
python app.py
```

The server will start on `http://localhost:5000`

## API Endpoints

### POST /generate
Generate an exhaust visualization from a text description.

**Request:**
```json
{
  "prompt": "Carbon fiber dual tip exhaust with blue titanium finish"
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "original_prompt": "Carbon fiber dual tip exhaust...",
  "enhanced_prompt": "High-end custom motorcycle exhaust..."
}
```

### GET /health
Check if the API is running and configured correctly.

**Response:**
```json
{
  "status": "healthy",
  "service": "Masterpiece Purbalingga Design Visualizer",
  "api_configured": true
}
```

## Prompt Engineering

The backend automatically wraps user input with professional keywords:
- High-end custom motorcycle exhaust system
- Professional product photography
- Automotive studio lighting
- 8k resolution
- Photorealistic render
- Premium quality

This ensures consistent, high-quality visualizations.

## Troubleshooting

### Error: "API Token not set"
- Make sure you created the `.env` file
- Verify your token is correctly copied

### Error: "Model is loading"
- Hugging Face models may take 20-30 seconds to load on first request
- Try again after a few moments

### CORS Errors
- Ensure the Flask server is running on port 5000
- Check that flask-cors is installed

## Production Deployment

For production, consider:
1. Use a production WSGI server (gunicorn, uwsgi)
2. Add rate limiting
3. Implement caching for repeated prompts
4. Add authentication/API keys
5. Use a CDN for image delivery

## License
Masterpiece Purbalingga © 2025
