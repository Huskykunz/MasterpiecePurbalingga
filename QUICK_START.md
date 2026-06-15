# 🚀 Quick Start - Design Visualizer

## Prerequisites
- Python 3.8 or higher
- Node.js and pnpm (already set up)
- Hugging Face account (free)

## Step-by-Step Setup (5 minutes)

### 1️⃣ Get Your Free API Token

1. Visit: https://huggingface.co/join
2. Sign up (it's free!)
3. Go to: https://huggingface.co/settings/tokens
4. Click "New token"
5. Name it: "masterpiece-visualizer"
6. Select "Read" access
7. Copy the token (starts with `hf_...`)

### 2️⃣ Setup Backend

Open a new terminal and run:

```bash
cd backend
./start.sh
```

When prompted, paste your Hugging Face token in the `.env` file.

**Alternative (manual setup):**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add: HUGGINGFACE_API_TOKEN=hf_xxxxx
python app.py
```

You should see:
```
🚀 Masterpiece Purbalingga Design Visualizer Backend
Server running on http://localhost:5000
```

### 3️⃣ Test the Backend

Open a new terminal:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "Masterpiece Purbalingga Design Visualizer",
  "api_configured": true
}
```

### 4️⃣ Use the Visualizer

1. Your frontend should already be running (from pnpm)
2. Open your browser to the frontend URL
3. Click **"Design Visualizer"** in the navigation (has a NEW badge)
4. Try one of the example descriptions
5. Click **"Generate Visualization"**
6. Wait 10-30 seconds ⏱️
7. Download your result! 🎉

## 💡 Example Prompts to Try

**Racing Style:**
```
Carbon fiber dual tip exhaust with blue titanium burnt finish,
racing style, glossy black coating, aggressive design
```

**Cruiser Classic:**
```
Chrome single tip cruiser exhaust, classic style,
mirror polished finish, vintage look with modern performance
```

**Sport Matte:**
```
Matte black stainless steel exhaust, sport bike style,
quad tip design, red accent line, lightweight construction
```

**Custom Gold:**
```
Gold titanium wrapped exhaust, custom design, brushed finish,
racing performance, dual outlet with mesh cover
```

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Health check returns success
- [ ] Frontend shows "Design Visualizer" in navigation
- [ ] Can access http://localhost:[frontend-port]/ai-visualizer
- [ ] Dark theme loads correctly
- [ ] Can submit a prompt
- [ ] Image generates successfully

## 🐛 Common Issues

### Port 5000 already in use
```bash
# Find and kill the process
lsof -i :5000
kill -9 [PID]
```

### Module not found errors
```bash
cd backend
pip install -r requirements.txt
```

### Token not working
- Make sure there are no spaces around the token in `.env`
- Token should start with `hf_`
- Try regenerating the token on Hugging Face

### "Model is loading" for a long time
- First request takes 20-30 seconds (normal)
- Subsequent requests are faster
- Check your internet connection

## 📚 Full Documentation

For detailed documentation, see:
- `AI_VISUALIZER_SETUP.md` - Complete setup guide
- `backend/README.md` - Backend API documentation

## 🎯 What's Next?

Now that you have the Design Visualizer running:
1. Try different prompts to see what works best
2. Share generated images with customers
3. Use them in your product catalog
4. Customize the UI to match your brand

## 🆘 Need Help?

Check the logs:
```bash
# Backend logs
cd backend
tail -f app.py  # or check console output

# Frontend logs
# Check browser console (F12)
```

---

**Ready to visualize? Let's go! 🚀**
