const express = require('express');
const router = express.Router();
const nlpToCodeService = require('../services/nlpToCodeService');

/**
 * Generate code from natural language description
 * POST /api/nlptocode/generate
 */
router.post('/generate', async (req, res) => {
  try {
    const { description, language, model } = req.body;
    
    if (!description || !language) {
      return res.status(400).json({ 
        success: false, 
        error: 'Description and language are required'
      });
    }
    
    const code = await nlpToCodeService.generateCodeFromDescription(
      description,
      language,
      model || 'codegemma:latest'
    );
    
    res.json({ success: true, code });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to generate code: ${error.message}`
    });
  }
});

/**
 * Generate test cases for code
 * POST /api/nlptocode/tests
 */
router.post('/tests', async (req, res) => {
  try {
    const { code, language, model } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code and language are required'
      });
    }
    
    const testCode = await nlpToCodeService.generateTests(
      code,
      language,
      model || 'codegemma:latest'
    );
    
    res.json({ success: true, testCode });
  } catch (error) {
    console.error('Error generating tests:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to generate tests: ${error.message}`
    });
  }
});

/**
 * Improve or refactor code
 * POST /api/nlptocode/improve
 */
router.post('/improve', async (req, res) => {
  try {
    const { code, language, requirements, model } = req.body;
    
    if (!code || !language || !requirements) {
      return res.status(400).json({ 
        success: false, 
        error: 'Code, language, and improvement requirements are required'
      });
    }
    
    const improvedCode = await nlpToCodeService.improveCode(
      code,
      language,
      requirements,
      model || 'codegemma:latest'
    );
    
    res.json({ success: true, improvedCode });
  } catch (error) {
    console.error('Error improving code:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to improve code: ${error.message}`
    });
  }
});

/**
 * Get models available for code generation
 * GET /api/nlptocode/models
 */
router.get('/models', async (req, res) => {
  try {
    const ollamaService = require('../services/ollamaService');
    const models = await ollamaService.listModels();
    
    // Filter for code-specific models or return all
    const codeModels = models.filter(model => 
      model.name.toLowerCase().includes('code') || 
      model.name.toLowerCase().includes('gemma')
    );
    
    res.json({ 
      success: true, 
      models: codeModels.length > 0 ? codeModels : models 
    });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({ 
      success: false, 
      error: `Failed to fetch models: ${error.message}`
    });
  }
});

module.exports = router;