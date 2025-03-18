// routes/docGen.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

// Set up Ollama API URL from environment variable
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';

// Get available models for documentation generation
router.get('/models', async (req, res) => {
  try {
    const response = await axios.get(`${OLLAMA_API_URL.replace('/api', '')}/api/tags`);
    
    // Filter for models that can handle code documentation
    const codeModels = response.data.models
      .filter(model => model.name.includes('code') || model.name.includes('gemma'))
      .map(model => ({
        name: model.name,
        size: model.size,
        modified: model.modified
      }));
    
    res.json({ models: codeModels });
  } catch (error) {
    console.error('Error fetching code models:', error);
    res.status(500).json({ error: 'Failed to fetch available models' });
  }
});

// Generate documentation for code
router.post('/generate', async (req, res) => {
  try {
    // Extract data from request
    const { code, language, model } = req.body;
    
    // Validate required fields
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }
    
    if (!language) {
      return res.status(400).json({ error: 'Language is required' });
    }
    
    // Construct prompt for code documentation
    const prompt = `Generate comprehensive documentation for the following ${language} code. 
Include:
- Overall purpose/description
- Function/class/module documentation
- Parameter descriptions
- Return value descriptions
- Usage examples where appropriate
- Any important notes about limitations or edge cases

Format the output as markdown.

CODE:
\`\`\`${language}
${code}
\`\`\``;

    // Make request to Ollama API
    const ollamaResponse = await axios.post(`${OLLAMA_API_URL}/generate`, {
      model: model || 'codegemma',
      prompt,
      stream: false
    });
    
    // Process and return the generated documentation
    if (ollamaResponse.data && ollamaResponse.data.response) {
      res.json({ documentation: ollamaResponse.data.response });
    } else {
      res.status(500).json({ error: 'Failed to generate documentation' });
    }
  } catch (error) {
    console.error('Error generating documentation:', error);
    res.status(500).json({ 
      error: 'Failed to generate documentation',
      details: error.response?.data || error.message 
    });
  }
});

module.exports = router;