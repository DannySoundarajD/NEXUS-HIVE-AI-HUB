const express = require('express');
const router = express.Router();
const webpageController = require('../controllers/webpageController');

// Middleware to log requests
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check endpoint to verify route is working
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Webpage routes are working' });
});

// Summarize webpage endpoint with improved error handling
router.post('/summarize', async (req, res, next) => {
  try {
    console.log('Request body:', req.body);
    
    // Validate request has URL
    if (!req.body || !req.body.url) {
      return res.status(400).json({ error: 'URL is required in request body' });
    }
    
    // Call the controller with the increased timeout option
    await webpageController.summarizeWebpage(req, res, { timeout: 60000 });
  } catch (error) {
    console.error('Route error in /webpage/summarize:', error);
    
    // Avoid sending multiple responses if the controller already responded
    if (!res.headersSent) {
      // More specific error handling based on error type
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        res.status(504).json({ 
          error: 'Request timed out', 
          details: 'The webpage summarization took too long. Try a smaller webpage or check Ollama service.'
        });
      } else {
        res.status(500).json({ 
          error: 'Internal server error in webpage route', 
          details: error.message 
        });
      }
    }
    
    next(error);
  }
});

module.exports = router;