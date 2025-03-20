const express = require('express');
const router = express.Router();
const imageGenController = require('../controllers/imageGenController');

// Route for generating images from text prompts
router.post('/generate', imageGenController.generateImage);

// Route for getting all generated images
router.get('/images', imageGenController.getImages);

// Route for getting a specific image by id
router.get('/images/:id', imageGenController.getImageById);

module.exports = router;