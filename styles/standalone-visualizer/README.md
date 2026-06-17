# 🎨 Design Visualizer - Standalone Version

A simple, standalone HTML/CSS/JavaScript implementation of the Design Visualizer.

## 📁 File Structure

```
standalone-visualizer/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   └── script.js       # All JavaScript logic
└── README.md           # This file
```

## 🚀 Quick Start

### 1. Start the Backend

First, make sure the Flask backend is running:

```bash
cd ../backend
./start.sh
# OR
python app.py
```

The backend should be running on `http://localhost:5000`

### 2. Open the Visualizer

Simply open `index.html` in your browser:

**Option A: Double-click**
- Just double-click `index.html`
- It will open in your default browser

**Option B: Local server (recommended)**
```bash
# If you have Python
python3 -m http.server 8000

# Or use Node's http-server
npx http-server

# Then visit: http://localhost:8000
```

**Option C: Live Server (VS Code)**
- Install "Live Server" extension
- Right-click `index.html`
- Select "Open with Live Server"

## 💡 Features

### Text Mode
- Enter description in plain text
- AI generates visualization
- Click examples to auto-fill

### Custom Builder
- **Exhaust Type**: Single, Dual, Quad Tip
- **Shape**: Round, Oval, Hexagonal, etc.
- **Color**: Visual picker + hex input
- **Finish**: Glossy, Matte, Brushed, etc.
- **Additional**: Carbon Fiber, Titanium Burn, etc.
- **Motorcycle**: Enter your bike model

## 🎯 How to Use

### Text Mode:
1. Click "Text Mode" tab
2. Enter description like: "Carbon fiber dual tip exhaust with blue titanium finish"
3. Click "Generate Visualization"
4. Wait 10-30 seconds
5. Download your image!

### Custom Builder:
1. Click "Custom Builder" tab
2. Select exhaust type
3. Choose shape design
4. Pick color (use color picker or hex)
5. Select finish
6. Add additional design elements
7. Enter motorcycle brand (e.g., "Yamaha R15")
8. Click "Generate Design"
9. Wait 10-30 seconds
10. Download your result!

## ⚙️ Configuration

Edit `js/script.js` if your backend runs on a different port:

```javascript
const API_URL = 'http://localhost:5000'; // Change if needed
```

## 🐛 Troubleshooting

### "Failed to generate"
- Check backend is running: `curl http://localhost:5000/health`
- Open browser console (F12) for errors
- Verify Hugging Face token is set in backend

### CORS Errors
- Make sure flask-cors is installed in backend
- Check backend console for errors

### Images Not Loading
- Wait full 30 seconds (first generation is slow)
- Check internet connection
- Verify Hugging Face API token is valid

## 📱 Browser Compatibility

Works on:
- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## 🎨 Customization

### Change Colors
Edit `css/styles.css`:
```css
/* Main gradient background */
background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);

/* Primary button */
.btn-primary {
    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}
```

### Add More Options
Edit dropdown options in `index.html`:
```html
<select id="exhaust-type">
    <option value="your-new-type">Your New Type</option>
</select>
```

## 📦 Deployment

### GitHub Pages
1. Create repository
2. Upload standalone-visualizer folder
3. Enable GitHub Pages
4. Set source to main branch
5. Note: Backend needs separate hosting!

### Netlify/Vercel
1. Drag & drop folder
2. Deploy!
3. Note: Backend needs separate hosting!

### With Backend
- Deploy backend to Heroku/Railway/etc
- Update API_URL in script.js
- Deploy frontend anywhere

## 🔒 Security Notes

For production:
- Use HTTPS for API calls
- Add rate limiting
- Validate all inputs
- Add authentication if needed

## 📝 License

Masterpiece Purbalingga © 2025

## 🆘 Support

Questions? 
- Check backend/README.md
- See QUICK_START.md in parent folder
- Test /health endpoint first

---

**Simple. Fast. No build tools required!** 🚀
