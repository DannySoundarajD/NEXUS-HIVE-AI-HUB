const express = require('express');
const router = express.Router();
const axios = require('axios');

// Helper function to handle errors
const handleError = (error, operation, res) => {
  console.error(`Error ${operation}:`, error);
  
  // Extract the most useful error message
  let errorMessage = "Unknown error occurred";
  if (error.response?.data?.error) {
    errorMessage = error.response.data.error;
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  return res.status(500).json({ 
    error: `Failed to ${operation}`,
    details: errorMessage 
  });
};

// Code-specific operations
router.post('/analyze', async (req, res) => {
  const { code, language, model = 'codegemma:7b' } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  
  try {
    console.log(`[${new Date().toISOString()}] analyze request for ${language} code using model ${model}`);
    
    let systemPrompt = "You are an expert code assistant. Respond in markdown format with code blocks.";
    let prompt = `${systemPrompt}\n\nAnalyze this ${language} code thoroughly:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide a detailed analysis including:
        1. Code structure and organization
        2. Potential issues or bugs
        3. Best practices and adherence to standards
        4. Performance considerations
        5. Security implications (if any)`;
    
    const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
        model: model,
        prompt: prompt,
        stream: false
    });
    
    console.log(`[${new Date().toISOString()}] analysis response received from Ollama`);
    
    return res.json({ 
        analysis: ollamaResponse.data.response,
        model: model,
        processingTime: ollamaResponse.data.total_duration
    });
  } catch (error) {
    return handleError(error, "analyze", res);
  }
});

router.post('/optimize', async (req, res) => {
  const { code, language, model = 'codegemma:7b', optimizationGoal } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  
  try {
    console.log(`[${new Date().toISOString()}] optimize request for ${language} code using model ${model}`);
    
    let systemPrompt = "You are an expert code assistant. Respond in markdown format with code blocks.";
    let prompt = `${systemPrompt}\n\nOptimize this ${language} code${optimizationGoal ? ` for ${optimizationGoal}` : ''}:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide:
        1. The optimized code in a code block
        2. A clear explanation of your changes and why they improve the code
        3. Any trade-offs in your optimization approach`;
    
    const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
        model: model,
        prompt: prompt,
        stream: false
    });
    
    console.log(`[${new Date().toISOString()}] optimization response received from Ollama`);
    
    return res.json({ 
        optimization: ollamaResponse.data.response,
        model: model,
        processingTime: ollamaResponse.data.total_duration
    });
  } catch (error) {
    return handleError(error, "optimize", res);
  }
});

router.post('/debug', async (req, res) => {
  const { code, language, model = 'codegemma:7b', error } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  
  try {
    console.log(`[${new Date().toISOString()}] debug request for ${language} code using model ${model}`);
    
    let systemPrompt = "You are an expert code assistant. Respond in markdown format with code blocks.";
    let prompt = `${systemPrompt}\n\nDebug this ${language} code${error ? ` which produces this error: "${error}"` : ''}:\n\`\`\`${language}\n${code}\n\`\`\`\n\nProvide:
        1. Identification of the bug(s) or issues
        2. Fixed code in a code block
        3. Explanation of what caused the issues and how your changes fix them
        4. Suggestions to prevent similar issues in the future`;
    
    const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
        model: model,
        prompt: prompt,
        stream: false
    });
    
    console.log(`[${new Date().toISOString()}] debugging response received from Ollama`);
    
    return res.json({ 
        debugging: ollamaResponse.data.response,
        model: model,
        processingTime: ollamaResponse.data.total_duration
    });
  } catch (error) {
    return handleError(error, "debug", res);
  }
});

module.exports = router;