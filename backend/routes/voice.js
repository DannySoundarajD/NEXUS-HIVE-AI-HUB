const express = require('express');
const router = express.Router();
const multer = require('multer');
const voiceController = require('../controllers/voiceController');

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Process voice input (speech-to-text + AI response)
router.post('/process', upload.single('audio'), voiceController.processVoiceInput);

module.exports = router;
