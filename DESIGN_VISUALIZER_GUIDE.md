# 🎨 Design Visualizer - Complete Guide

## Overview
The **Design Visualizer** is your comprehensive tool for creating custom exhaust designs. It offers two powerful modes:

1. **Text Mode** - Describe your vision in words, AI brings it to life
2. **Custom Builder** - Visual builder with full control over every design element

## Features

### 🎨 Custom Builder Mode (New!)

Build your dream exhaust with intuitive controls:

#### Exhaust Type
Choose from professional configurations:
- **Single Tip** - Classic, minimalist design
- **Dual Tip** - Symmetric, balanced look
- **Quad Tip** - Aggressive, high-performance style
- **Side Exit** - Racing-inspired positioning
- **Under Tail** - Sleek, hidden design

#### Shape Design
Select your tip profile:
- **Round** - Traditional circular opening
- **Oval** - Elongated, modern shape
- **Hexagonal** - Geometric, unique style
- **Square** - Bold, angular design
- **Slash Cut** - Angled racing cut
- **Rolled Edge** - Smooth, finished rim

#### Color Customization
- **Visual Color Picker** - Choose any color
- **Hex Input** - Enter precise color codes
- Popular choices: Black, Chrome Silver, Gold, Blue Titanium

#### Surface Finish
Professional finishes:
- **Glossy** - High-shine, reflective
- **Matte** - Smooth, non-reflective
- **Brushed Metal** - Linear grain texture
- **Mirror Polished** - Ultra-reflective chrome
- **Satin** - Semi-gloss elegance

#### Additional Design Elements
Enhance your exhaust:
- **Carbon Fiber Pattern** - Woven carbon texture
- **Titanium Burnt Effect** - Blue/purple heat coloring
- **Chrome Accent Lines** - Metallic highlights
- **Racing Stripes** - Sport styling
- **Mesh Cover** - Protective grille
- **Heat Shield Wrap** - Thermal protection

#### Motorcycle Visualization
Enter your bike model to see the exhaust mounted:
- Works with any brand (Yamaha, Honda, Kawasaki, etc.)
- Shows realistic placement on your motorcycle
- Side angle view for best perspective

### 📝 Text Mode

For creative freedom, describe your vision:
```
Carbon fiber dual tip exhaust with blue titanium burnt finish,
racing style, glossy black coating, aggressive design
```

AI automatically enhances with professional keywords for stunning results.

## How to Use

### Quick Start - Custom Builder

1. **Navigate** to Design Visualizer from the menu
2. **Click** "Custom Builder" tab
3. **Select** your preferences:
   - Exhaust Type: Dual Tip
   - Shape: Round
   - Color: Choose from picker
   - Finish: Glossy
   - Additional: Carbon Fiber Pattern
4. **Enter** your motorcycle: "Yamaha R15"
5. **Click** "Generate Design"
6. **Wait** 10-30 seconds
7. **Download** your visualization!

### Quick Start - Text Mode

1. **Navigate** to Design Visualizer
2. **Stay** on "Text Mode" tab (default)
3. **Enter** your description or click an example
4. **Click** "Generate Visualization"
5. **Wait** 10-30 seconds
6. **Download** your result!

## Custom Builder Examples

### Racing Setup
```
Type: Dual Tip
Shape: Slash Cut
Color: #000000 (Black)
Finish: Matte
Additional: Racing Stripes
Motorcycle: Kawasaki Ninja 250
```

### Cruiser Classic
```
Type: Single Tip
Shape: Rolled Edge
Color: #C0C0C0 (Chrome)
Finish: Mirror Polished
Additional: None
Motorcycle: Harley Davidson Street 750
```

### Sport Premium
```
Type: Quad Tip
Shape: Hexagonal
Color: #0000FF (Blue)
Finish: Glossy
Additional: Carbon Fiber Pattern
Motorcycle: Honda CBR600RR
```

### Custom Gold
```
Type: Dual Tip
Shape: Oval
Color: #FFD700 (Gold)
Finish: Brushed Metal
Additional: Titanium Burnt Effect
Motorcycle: Ducati Monster
```

## Technical Details

### Backend API

**Endpoint:** `POST /generate-custom`

**Request Body:**
```json
{
  "exhaustType": "dual-tip",
  "shapeDesign": "round",
  "color": "#1a1a1a",
  "finish": "glossy",
  "additionalDesign": "carbon-fiber",
  "motorcycleBrand": "Yamaha R15"
}
```

**Response:**
```json
{
  "success": true,
  "image": "data:image/png;base64,...",
  "design_data": {...},
  "generated_prompt": "Detailed prompt..."
}
```

### How It Works

1. **Frontend** - User selects options in Custom Builder
2. **Data Collection** - All choices compiled into structured JSON
3. **Backend Processing** - Flask server receives design data
4. **Prompt Engineering** - Converts design choices into detailed AI prompt
5. **AI Generation** - Hugging Face Stable Diffusion creates visualization
6. **Delivery** - Base64 image returned to frontend
7. **Display** - User sees exhaust on their motorcycle!

### Prompt Engineering

The backend intelligently constructs prompts:

```python
# User selections
exhaust_type: "dual-tip"
color: "#000000"
motorcycle: "Yamaha R15"

# Generated prompt
"Dual tip motorcycle exhaust system with round tip design,
jet black glossy finish with carbon fiber weave pattern,
installed on a Yamaha R15, professional automotive photography,
studio lighting, 8k resolution, photorealistic render..."
```

## Tips for Best Results

### Color Selection
- **Black (#000000)** - Classic, versatile
- **Chrome (#C0C0C0)** - Traditional cruiser style
- **Gold (#FFD700)** - Premium, luxury look
- **Blue (#0000FF)** - Sport bike aesthetic

### Finish Recommendations
- **Sport Bikes** → Glossy or Matte Black
- **Cruisers** → Mirror Polished Chrome
- **Racing** → Matte with Carbon Fiber
- **Custom** → Brushed Metal with Titanium Burn

### Motorcycle Input
Be specific for best results:
- ✅ "Yamaha R15 V3"
- ✅ "Honda CBR150R"
- ✅ "Kawasaki Ninja 250 SL"
- ❌ "Sport bike"
- ❌ "My bike"

## Troubleshooting

### Custom Builder Not Working
- Check backend is running on port 5000
- Verify motorcycle brand is entered
- Ensure all dropdowns have selections

### Generated Image Doesn't Match
- Try different color combinations
- Adjust finish type
- Be more specific with motorcycle model

### Generation Takes Too Long
- First request: 20-30 seconds (normal)
- Model loading on Hugging Face servers
- Check internet connection
- Try Text Mode as alternative

## Advanced Usage

### Batch Generation
Generate multiple designs:
1. Create design in Custom Builder
2. Generate and download
3. Change one element (color, type, etc.)
4. Generate again
5. Compare results

### Design Iteration
Perfect your design:
1. Start with Text Mode for inspiration
2. Switch to Custom Builder
3. Fine-tune exact specifications
4. Generate final version
5. Present to customer

### Client Presentations
Professional workflow:
1. Discuss preferences with customer
2. Build design together in Custom Builder
3. Show live color/finish options
4. Generate visualization on their bike
5. Instant approval or adjustments

## Comparison: Text vs Custom Builder

| Feature | Text Mode | Custom Builder |
|---------|-----------|----------------|
| Speed | Fast entry | Slower (more options) |
| Control | Low | High |
| Creativity | High | Structured |
| Motorcycle View | Optional | Required |
| Best For | Quick ideas | Final designs |
| Precision | AI interpreted | Exact specifications |

## Next Steps

Ready to create amazing exhaust designs:
1. ✅ Backend running with Hugging Face token
2. ✅ Frontend accessible at your URL
3. ✅ Navigate to Design Visualizer
4. ✅ Choose Text or Custom Builder
5. ✅ Start creating!

## Support

Issues or questions:
- Check backend logs
- Verify health endpoint: `curl http://localhost:5000/health`
- Review browser console (F12)
- See QUICK_START.md for setup help

---

**Masterpiece Purbalingga** - Where Craftsmanship Meets Innovation 🏍️✨
