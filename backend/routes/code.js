// routes/code.js
const express = require('express');
const router = express.Router();
const codeController = require('../controllers/codeController');
// Analyze code endpoint
router.post('/analyze', codeController.analyzeCode);

// Optimize code endpoint
router.post('/optimize', codeController.optimizeCode);

// Debug code endpoint
router.post('/debug', codeController.debugCode);

module.exports = router;