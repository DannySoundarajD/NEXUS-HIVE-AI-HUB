const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Constants
const IMAGES_DIR = path.join(__dirname, '..', 'generated-images');
const STABLE_DIFFUSION_API_URL = process.env.STABLE_DIFFUSION_API_URL || 'http://localhost:5001/generate';

// Helper function to ensure the images directory exists
const ensureImagesDirectoryExists = () => {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
};

/**
 * Generate an image from a text prompt
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.generateImage = async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field',
        message: 'Prompt is required'
      });
    }
    
    console.log(`🖼️ Generating image for prompt: "${prompt}"`);
    
    try {
      const response = await axios.post(STABLE_DIFFUSION_API_URL, { prompt });
      return res.json({
        success: true,
        message: 'Image generated successfully',
        data: response.data
      });
    } catch (error) {
      console.error("❌ Failed to connect to image generation API:", error.message);
      
      // Fallback: Generate a placeholder text file with the prompt
      ensureImagesDirectoryExists();
      
      const imageId = uuidv4();
      const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
      const filename = `${imageId}_${timestamp}.txt`;
      const filePath = path.join(IMAGES_DIR, filename);
      
      // Write prompt to a text file as a placeholder
      fs.writeFileSync(filePath, `Prompt: ${prompt}\nTimestamp: ${timestamp}\n\nNote: This is a placeholder for image generation. The Python service is not responding.`);
      
      return res.status(200).json({
        success: true,
        message: 'Image generation service is unavailable, placeholder created',
        warning: 'Python API is not connected. This is a simulated response.',
        imageId,
        filename,
        url: `/generated-images/${filename}`,
        prompt
      });
    }
  } catch (error) {
    console.error("❌ Image generation error:", error);
    return res.status(500).json({
      success: false,
      error: 'Image Generation Failed',
      message: error.message
    });
  }
};

/**
 * Get all generated images
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getImages = (req, res) => {
  try {
    ensureImagesDirectoryExists();
    
    const files = fs.readdirSync(IMAGES_DIR);
    const images = files.map(file => {
      const stats = fs.statSync(path.join(IMAGES_DIR, file));
      return {
        filename: file,
        id: file.split('_')[0],
        createdAt: stats.birthtime,
        size: stats.size,
        url: `/generated-images/${file}`
      };
    });
    
    return res.json({
      success: true,
      count: images.length,
      images
    });
  } catch (error) {
    console.error("❌ Error getting images:", error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve images',
      message: error.message
    });
  }
};

/**
 * Get image by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getImageById = (req, res) => {
  try {
    const { id } = req.params;
    ensureImagesDirectoryExists();
    
    const files = fs.readdirSync(IMAGES_DIR);
    const image = files.find(file => file.startsWith(id));
    
    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Not Found',
        message: `Image with ID ${id} not found`
      });
    }
    
    const stats = fs.statSync(path.join(IMAGES_DIR, image));
    return res.json({
      success: true,
      image: {
        filename: image,
        id: image.split('_')[0],
        createdAt: stats.birthtime,
        size: stats.size,
        url: `/generated-images/${image}`
      }
    });
  } catch (error) {
    console.error("❌ Error getting image:", error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve image',
      message: error.message
    });
  }
};