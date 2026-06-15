from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import base64
import io
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
HUGGINGFACE_API_TOKEN = os.getenv('HUGGINGFACE_API_TOKEN', '')
API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0"

def enhance_prompt(user_prompt):
    """
    Enhance user prompt with professional keywords for high-quality exhaust visualization
    """
    enhanced = f"""High-end custom motorcycle exhaust system, professional product photography,
automotive studio lighting, 8k resolution, photorealistic render, detailed metalwork,
premium quality, cinematic composition, {user_prompt},
sleek design, professional grade, masterpiece craftsmanship"""
    return enhanced

def build_custom_prompt(design_data):
    """
    Build a detailed prompt from custom design specifications
    """
    exhaust_type = design_data.get('exhaustType', 'dual-tip').replace('-', ' ')
    shape = design_data.get('shapeDesign', 'round')
    color = design_data.get('color', '#1a1a1a')
    finish = design_data.get('finish', 'glossy')
    additional = design_data.get('additionalDesign', 'none')
    motorcycle = design_data.get('motorcycleBrand', 'sport motorcycle')

    # Convert hex color to descriptive color
    color_map = {
        '#000000': 'jet black',
        '#1a1a1a': 'dark black',
        '#808080': 'gunmetal gray',
        '#c0c0c0': 'silver',
        '#ffd700': 'gold',
        '#0000ff': 'blue',
        '#ff0000': 'red',
    }
    color_desc = color_map.get(color.lower(), 'custom colored')

    # Build additional design description
    additional_desc = ""
    if additional != 'none':
        additional_map = {
            'carbon-fiber': 'with carbon fiber weave pattern',
            'titanium-burn': 'with blue titanium burnt effect',
            'chrome-accent': 'with chrome accent lines',
            'racing-stripes': 'with racing stripes',
            'mesh-cover': 'with protective mesh cover',
            'heat-shield': 'wrapped in heat shield material'
        }
        additional_desc = additional_map.get(additional, '')

    # Construct the prompt
    prompt = f"""{exhaust_type} motorcycle exhaust system with {shape} tip design,
{color_desc} {finish} finish {additional_desc}, installed on a {motorcycle},
professional automotive photography, studio lighting, 8k resolution,
photorealistic render, detailed metalwork, premium quality product shot,
side angle view showing the exhaust mounted on the motorcycle,
cinematic composition, masterpiece craftsmanship, sleek modern design"""

    return prompt

def generate_image_huggingface(prompt):
    """
    Generate image using Hugging Face Inference API
    """
    if not HUGGINGFACE_API_TOKEN:
        raise ValueError("HUGGINGFACE_API_TOKEN not set")

    headers = {"Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}"}

    response = requests.post(
        API_URL,
        headers=headers,
        json={"inputs": prompt},
        timeout=60
    )

    if response.status_code != 200:
        raise Exception(f"API Error: {response.status_code} - {response.text}")

    # Convert image bytes to base64
    image_bytes = response.content
    base64_image = base64.b64encode(image_bytes).decode('utf-8')
    return f"data:image/png;base64,{base64_image}"

@app.route('/generate', methods=['POST'])
def generate():
    """
    Main endpoint for generating exhaust visualizations from text prompt
    """
    try:
        data = request.get_json()
        user_prompt = data.get('prompt', '')

        if not user_prompt:
            return jsonify({'error': 'Prompt is required'}), 400

        # Enhance the prompt
        enhanced_prompt = enhance_prompt(user_prompt)

        # Generate image
        image_base64 = generate_image_huggingface(enhanced_prompt)

        return jsonify({
            'success': True,
            'image': image_base64,
            'original_prompt': user_prompt,
            'enhanced_prompt': enhanced_prompt
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': f'Failed to generate image: {str(e)}'}), 500

@app.route('/generate-custom', methods=['POST'])
def generate_custom():
    """
    Endpoint for generating exhaust visualizations from custom design builder
    """
    try:
        design_data = request.get_json()

        # Validate motorcycle brand is provided
        if not design_data.get('motorcycleBrand'):
            return jsonify({'error': 'Motorcycle brand is required'}), 400

        # Build prompt from custom design
        custom_prompt = build_custom_prompt(design_data)

        # Generate image
        image_base64 = generate_image_huggingface(custom_prompt)

        return jsonify({
            'success': True,
            'image': image_base64,
            'design_data': design_data,
            'generated_prompt': custom_prompt
        })

    except ValueError as e:
        return jsonify({'error': str(e)}), 500
    except Exception as e:
        return jsonify({'error': f'Failed to generate image: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'service': 'Masterpiece Purbalingga Design Visualizer',
        'api_configured': bool(HUGGINGFACE_API_TOKEN)
    })

if __name__ == '__main__':
    print("=" * 60)
    print("🎨 Masterpiece Purbalingga Design Visualizer Backend")
    print("=" * 60)
    print(f"API Token Configured: {bool(HUGGINGFACE_API_TOKEN)}")
    print("Server running on http://localhost:5000")
    print("=" * 60)
    app.run(debug=True, host='0.0.0.0', port=5000)
