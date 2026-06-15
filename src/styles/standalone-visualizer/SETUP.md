# ⚡ Super Quick Setup

## 3 Steps to Run

### Step 1: Start Backend
```bash
cd backend
./start.sh
```
✅ Backend running on http://localhost:5000

### Step 2: Open HTML
```bash
cd standalone-visualizer
# Just double-click index.html
# OR use a local server:
python3 -m http.server 8000
```
✅ Open http://localhost:8000

### Step 3: Use It!
1. Choose "Text Mode" or "Custom Builder"
2. Fill in your design
3. Click "Generate"
4. Download result!

## That's It! 🎉

No npm, no build tools, no React. Just HTML/CSS/JS!

---

## File Overview

```
standalone-visualizer/
│
├── index.html          ← Open this in browser
│
├── css/
│   └── styles.css      ← All styling (dark theme)
│
├── js/
│   └── script.js       ← All logic (tabs, API calls)
│
└── README.md           ← Full documentation
```

## Example Usage

### Text Mode
```
1. Type: "Black dual tip exhaust, glossy finish"
2. Click Generate
3. Wait 15 seconds
4. Download!
```

### Custom Builder
```
1. Select: Dual Tip
2. Shape: Round
3. Color: #000000
4. Finish: Glossy
5. Motorcycle: Yamaha R15
6. Click Generate
7. Download!
```

## Quick Troubleshooting

**Backend not running?**
```bash
curl http://localhost:5000/health
```

**CORS error?**
- Check backend has flask-cors installed

**Slow generation?**
- First time takes 20-30 seconds (normal!)

---

Need help? See README.md for full details!
