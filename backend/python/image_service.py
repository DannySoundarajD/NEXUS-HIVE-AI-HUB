
from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import torch
from PIL import Image
import numpy as np
from datetime import datetime
import uuid
import time

# Check if we can use CUDA
device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device}")

# Define FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the directory to save generated images
IMAGES_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "generated-images")
os.makedirs(IMAGES_DIR, exist_ok=True)

# Define request model
class PromptRequest(BaseModel):
    prompt: str

# Placeholder for real SD - this makes a simple colored gradient based on the hash of the prompt
def generate_placeholder_image(prompt, width=512, height=512):
    # Create a hash-based seed from the prompt to ensure consistent results for the same prompt
    prompt_hash = hash(prompt) % 1000000
    np.random.seed(prompt_hash)
    
    # Generate random colors for gradient corners
    colors = np.random.randint(0, 256, size=(4, 3))  # 4 corners, RGB
    
    # Create a gradient image by interpolating colors
    img = np.zeros((height, width, 3), dtype=np.uint8)
    
    for y in range(height):
        for x in range(width):
            # Normalized positions
            nx, ny = x / width, y / height
            
            # Bilinear interpolation of colors
            top = colors[0] * (1 - nx) + colors[1] * nx
            bottom = colors[2] * (1 - nx) + colors[3] * nx
            color = top * (1 - ny) + bottom * ny
            
            img[y, x] = color.astype(np.uint8)
    
    # Add text with the prompt
    pil_img = Image.fromarray(img)
    return pil_img

def try_load_sd_model():
    try:
        global pipe
        from diffusers import StableDiffusionPipeline
        print("Loading Stable Diffusion model...")
        # This is a placeholder. In a real app, you would load your model here
        # pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5").to(device)
        print("Stable Diffusion model loaded!")
        return True
    except Exception as e:
        print(f"Could not load Stable Diffusion: {e}")
        print("Will use placeholder image generation instead")
        return False

# Try to load SD in the background to avoid slowing down server startup
has_sd = False
background_loading = False

@app.on_event("startup")
async def startup_event():
    global background_loading
    background_loading = True

async def load_model_background():
    global has_sd, background_loading
    has_sd = try_load_sd_model()
    background_loading = False

@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "model_loading": background_loading,
        "stable_diffusion_available": has_sd
    }

@app.post("/generate")
async def generate_image(request: PromptRequest, background_tasks: BackgroundTasks):
    global has_sd, background_loading
    
    # Start model loading if not already started
    if not has_sd and not background_loading:
        background_loading = True
        background_tasks.add_task(load_model_background)
    
    prompt = request.prompt
    print(f"Generating image for prompt: {prompt}")
    
    # Generate unique filename with UUID and timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    image_id = str(uuid.uuid4())
    filename = f"{image_id}_{timestamp}.png"
    filepath = os.path.join(IMAGES_DIR, filename)
    
    # Generate and save the image
    if has_sd:
        # In a real app, you would use your Stable Diffusion model here
        # image = pipe(prompt).images[0]
        # For now, we'll use the placeholder
        image = generate_placeholder_image(prompt)
    else:
        # Use placeholder if SD isn't available
        image = generate_placeholder_image(prompt)
    
    # Save the image
    image.save(filepath)
    
    # Return the result
    return {
        "success": True,
        "message": "Image generated successfully",
        "model_used": "stable_diffusion" if has_sd else "placeholder",
        "imageId": image_id,
        "filename": filename,
        "url": f"/generated-images/{filename}",
        "prompt": prompt
    }

# Run FastAPI with Uvicorn when script is executed directly
if __name__ == "__main__":
    import uvicorn
    port = 5001  # Using 5001 to avoid conflict with the Node.js server on 5000
    print(f"Starting image generation service on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
