// Design Visualizer - Standalone JavaScript

// Configuration
const API_URL = 'http://localhost:5000';

// DOM Elements
const tabs = document.querySelectorAll('.tab-btn');
const textPrompt = document.getElementById('text-prompt');
const generateTextBtn = document.getElementById('generate-text-btn');
const generateCustomBtn = document.getElementById('generate-custom-btn');
const downloadBtn = document.getElementById('download-btn');
const errorMessage = document.getElementById('error-message');
const customError = document.getElementById('custom-error');
const emptyState = document.getElementById('empty-state');
const loadingState = document.getElementById('loading-state');
const imageState = document.getElementById('image-state');
const generatedImage = document.getElementById('generated-image');

// Custom Builder Elements
const exhaustType = document.getElementById('exhaust-type');
const shapeDesign = document.getElementById('shape-design');
const colorPicker = document.getElementById('color-picker');
const colorHex = document.getElementById('color-hex');
const finish = document.getElementById('finish');
const additionalDesign = document.getElementById('additional-design');
const motorcycleBrand = document.getElementById('motorcycle-brand');

// Tab Switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Update active tab button
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
});

// Color Picker Sync
colorPicker.addEventListener('input', (e) => {
    colorHex.value = e.target.value;
});

colorHex.addEventListener('input', (e) => {
    if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        colorPicker.value = e.target.value;
    }
});

// Text Mode Generation
generateTextBtn.addEventListener('click', async () => {
    const prompt = textPrompt.value.trim();
    
    if (!prompt) {
        showError('Please enter a description for your exhaust design');
        return;
    }
    
    await generateVisualization('text', { prompt });
});

// Custom Builder Generation
generateCustomBtn.addEventListener('click', async () => {
    const brand = motorcycleBrand.value.trim();
    
    if (!brand) {
        showCustomError('Please enter your motorcycle brand');
        return;
    }
    
    const customDesign = {
        exhaustType: exhaustType.value,
        shapeDesign: shapeDesign.value,
        color: colorHex.value,
        finish: finish.value,
        additionalDesign: additionalDesign.value,
        motorcycleBrand: brand
    };
    
    await generateVisualization('custom', customDesign);
});

// Main Generation Function
async function generateVisualization(mode, data) {
    hideError();
    showLoading();
    
    const endpoint = mode === 'text' ? '/generate' : '/generate-custom';
    
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error('Failed to generate image');
        }
        
        const result = await response.json();
        
        if (result.success && result.image) {
            showGeneratedImage(result.image);
        } else {
            throw new Error('No image in response');
        }
    } catch (error) {
        console.error('Error:', error);
        const errorMsg = mode === 'text' 
            ? 'Failed to generate visualization. Please ensure the backend server is running on http://localhost:5000'
            : 'Failed to generate design. Please check your inputs and backend server.';
        
        mode === 'text' ? showError(errorMsg) : showCustomError(errorMsg);
        showEmpty();
    }
}

// Download Handler
downloadBtn.addEventListener('click', () => {
    const imageUrl = generatedImage.src;
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `masterpiece-exhaust-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// UI State Functions
function showLoading() {
    emptyState.classList.add('hidden');
    imageState.classList.add('hidden');
    loadingState.classList.remove('hidden');
    generateTextBtn.disabled = true;
    generateCustomBtn.disabled = true;
}

function showGeneratedImage(imageData) {
    generatedImage.src = imageData;
    emptyState.classList.add('hidden');
    loadingState.classList.add('hidden');
    imageState.classList.remove('hidden');
    generateTextBtn.disabled = false;
    generateCustomBtn.disabled = false;
}

function showEmpty() {
    loadingState.classList.add('hidden');
    imageState.classList.add('hidden');
    emptyState.classList.remove('hidden');
    generateTextBtn.disabled = false;
    generateCustomBtn.disabled = false;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function showCustomError(message) {
    customError.textContent = message;
    customError.classList.remove('hidden');
}

function hideError() {
    errorMessage.classList.add('hidden');
    customError.classList.add('hidden');
}

// Initialize
console.log('Design Visualizer loaded');
console.log('Backend URL:', API_URL);
