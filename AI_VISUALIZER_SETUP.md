# 🎨 Design Visualizer - Setup Guide

## Overview
The Design Visualizer allows customers to generate custom exhaust design visualizations using AI before placing an order. This premium feature combines local craftsmanship with cutting-edge technology.

## Architecture
- **Frontend**: React + TypeScript with dark automotive theme
- **Backend**: Flask (Python) with Hugging Face Stable Diffusion XL
- **API**: Hugging Face Inference API (free tier available)

## Quick Start

### Step 1: Get Your Hugging Face API Token (Free)

1. Go to [Hugging Face](https://huggingface.co)
2. Create a free account (if you don't have one)
3. Go to [Settings > Access Tokens](https://huggingface.co/settings/tokens)
4. Click "New token"
5. Give it a name (e.g., "masterpiece-visualizer")
6. Select "Read" access
7. Click "Generate"
8. Copy the token (starts with `hf_...`)

### Step 2: Setup the Backend

```bash
cd backend

# Quick start (automated setup)
./start.sh

# Or manual setup:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env and add your token:
# HUGGINGFACE_API_TOKEN=hf_xxxxxxxxxxxxxxxxxxxxx

# Run the server
python app.py
```

The backend will start on `http://localhost:5000`

### Step 3: Start the Frontend

In a new terminal:

```bash
# Frontend should already be running from the main project
# If not, run:
pnpm run dev
```

### Step 4: Test the Visualizer

1. Open your browser to the frontend URL
2. Click "Design Visualizer" in the navigation (with the NEW badge)
3. Enter a description like:
   ```
   Carbon fiber dual tip exhaust with blue titanium burnt finish,
   racing style, glossy black coating, aggressive design
   ```
4. Click "Generate Visualization"
5. Wait 10-30 seconds for the AI to generate your design
6. Download the result!

## Features

### 🎨 Dark Automotive UI
- Carbon fiber inspired design
- Blue and gold accents
- Premium, modern aesthetic

### 🤖 Smart Prompt Engineering
The backend automatically enhances your prompts with:
- Professional product photography keywords
- 8K resolution specifications
- Automotive lighting terms
- Premium quality descriptors

### 💡 Example Prompts
Click on any example in the UI to try:
- Racing exhausts with titanium finishes
- Chrome cruiser styles
- Matte black sport designs
- Custom gold-wrapped systems

### 📥 Download & Share
- Download generated images
- Share with customers
- Use in marketing materials

## API Endpoints

### Health Check
```bash
curl http://localhost:5000/health
```

Response:
```json
{
  "status": "healthy",
  "service": "Masterpiece Purbalingga Design Visualizer",
  "api_configured": true
}
```

### Generate Image
```bash
curl -X POST http://localhost:5000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "carbon fiber exhaust with blue finish"}'
```

## Troubleshooting

### Backend won't start
- Check if port 5000 is available: `lsof -i :5000`
- Verify Python version: `python --version` (needs 3.8+)
- Check if dependencies installed: `pip list | grep Flask`

### "API Token not set" error
- Make sure `.env` file exists in `backend/` directory
- Verify token starts with `hf_`
- Check there are no extra spaces in `.env`

### "Model is loading" message
- First request may take 20-30 seconds
- Hugging Face loads the model on-demand
- Subsequent requests will be faster

### CORS errors
- Ensure backend is running on port 5000
- Check browser console for specific errors
- Verify flask-cors is installed

### Image generation fails
- Check your Hugging Face token is valid
- Verify you have internet connection
- Try the /health endpoint first
- Check backend logs for errors

## Production Considerations

For deploying to production:

1. **Security**
   - Use environment variables (never commit `.env`)
   - Add rate limiting
   - Implement API authentication
   - Use HTTPS

2. **Performance**
   - Cache frequently generated images
   - Use a CDN for image delivery
   - Consider Redis for caching
   - Deploy backend separately (Heroku, Railway, etc.)

3. **Scalability**
   - Use gunicorn instead of Flask dev server
   - Add load balancing
   - Consider queue system for high traffic
   - Monitor API usage limits

4. **Alternative APIs**
   - Replicate.com (easy deployment)
   - RunPod (GPU instances)
   - Together.ai (fast inference)
   - OpenAI DALL-E (paid, higher quality)

## Cost Analysis

### Hugging Face (Current Setup)
- Free tier: 1000 API calls/month
- Pro tier: $9/month for more calls
- Best for: Testing and low-traffic sites

### OpenAI DALL-E
- $0.020 per image (1024x1024)
- Higher quality, faster
- Best for: Production with budget

### Self-Hosted
- Run on your own GPU
- One-time hardware cost
- Best for: High volume, full control

## Support

For issues or questions:
- Check the backend logs: `backend/app.log`
- Test health endpoint first
- Verify all dependencies installed
- Check Hugging Face API status

## Next Steps

Consider adding:
- [ ] Save favorite designs to database
- [ ] Email generated images to customers
- [ ] Gallery of past generations
- [ ] Style presets (racing, cruiser, sport)
- [ ] Multiple angle generation
- [ ] Real-time preview updates
- [ ] Integration with product catalog

---

**Masterpiece Purbalingga** - Local Craftsmanship meets Innovation 🏍️✨
