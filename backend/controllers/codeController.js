const axios = require('axios');

// Helper function to generate AI prompts based on analysis type
const generatePrompt = (code, language, analysisType, options = {}) => {
  let prompt = '';
  
  switch(analysisType) {
    case 'analyze':
      prompt = `Analyze the following ${language} code:
\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive analysis including:
1. Code structure and organization
2. Best practices followed and violated
3. Potential issues or vulnerabilities
4. Comments on code readability and maintainability

Format your response in Markdown.`;
      break;
      
    case 'optimize':
      prompt = `Optimize the following ${language} code${options.optimizationGoal ? ' for ' + options.optimizationGoal : ''}:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. An optimized version of the code
2. Explanation of the optimizations made
3. Performance or other improvements achieved

Format your response in Markdown.`;
      break;
      
    case 'debug':
      prompt = `Debug the following ${language} code${options.error ? ' with error: ' + options.error : ''}:
\`\`\`${language}
${code}
\`\`\`

Provide:
1. Identification of potential bugs or issues
2. Fixed version of the code
3. Explanation of what was causing the problems
4. Tips to avoid similar issues in the future

Format your response in Markdown.`;
      break;
  }
  
  return prompt;
};

// Controller methods
const analyzeCode = async (req, res) => {
  try {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const prompt = generatePrompt(code, language, 'analyze');
    
    // Connect to Mistral model
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b',
      prompt: prompt,
      stream: false
    });
    
    return res.json({ analysis: response.data.response });
  } catch (error) {
    console.error('Error analyzing code:', error);
    return res.status(500).json({ 
      error: 'Failed to analyze code',
      details: error.message,
      connectionError: error.code === 'ECONNREFUSED' ? 
        'Could not connect to Mistral model at http://localhost:11434. Make sure the model is running.' : null
    });
  }
};

const optimizeCode = async (req, res) => {
  try {
    const { code, language, optimizationGoal } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const prompt = generatePrompt(code, language, 'optimize', { optimizationGoal });
    
    // Connect to Mistral model
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b',
      prompt: prompt,
      stream: false
    });
    
    return res.json({ optimization: response.data.response });
  } catch (error) {
    console.error('Error optimizing code:', error);
    return res.status(500).json({ 
      error: 'Failed to optimize code',
      details: error.message,
      connectionError: error.code === 'ECONNREFUSED' ? 
        'Could not connect to Mistral model at http://localhost:11434. Make sure the model is running.' : null
    });
  }
};

const debugCode = async (req, res) => {
  try {
    const { code, language, error } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const prompt = generatePrompt(code, language, 'debug', { error });
    
    // Connect to Mistral model
    const response = await axios.post('http://localhost:11434/api/generate', {
      model: 'mistral:7b',
      prompt: prompt,
      stream: false
    });
    
    return res.json({ debugging: response.data.response });
  } catch (error) {
    console.error('Error debugging code:', error);
    return res.status(500).json({ 
      error: 'Failed to debug code',
      details: error.message,
      connectionError: error.code === 'ECONNREFUSED' ? 
        'Could not connect to Mistral model at http://localhost:11434. Make sure the model is running.' : null
    });
  }
};

module.exports = {
  analyzeCode,
  optimizeCode,
  debugCode
};