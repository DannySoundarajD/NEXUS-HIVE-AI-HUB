const axios = require('axios');

// Configuration for Ollama API
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

/**
 * Generate text using Ollama API
 * @param {string} prompt - The prompt to send to the model
 * @param {string} model - The model to use (e.g., 'gemma', 'llama')
 * @param {object} options - Additional options for the API call
 * @returns {Promise<string>} - The generated text
 */
exports.generateText = async (prompt, model = 'gemma', options = {}) => {
  try {
    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model,
      prompt,
      stream: false,
      ...options
    });

    if (response.data && response.data.response) {
      return response.data.response;
    } else {
      throw new Error('Invalid response from Ollama API');
    }
  } catch (error) {
    console.error('Ollama API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw new Error(`Failed to generate text: ${error.message}`);
  }
};

/**
 * Generate documentation for code using CodeGemma model
 * @param {string} code - The code to document
 * @param {string} language - The programming language (e.g., 'javascript', 'python')
 * @param {string} model - The model to use (default: 'codegemma')
 * @param {object} options - Additional options for the API call
 * @returns {Promise<string>} - The generated documentation
 */
exports.generateDocumentation = async (code, language, model = 'codegemma', options = {}) => {
  try {
    const prompt = `Generate comprehensive documentation for the following ${language} code:
    
${code}

The documentation should include:
1. Overall purpose of the code
2. Explanation of key functions and their parameters
3. Description of important variables and data structures
4. Usage examples where appropriate
5. Any dependencies or requirements

Please format the documentation in markdown.`;

    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model,
      prompt,
      stream: false,
      ...options
    });

    if (response.data && response.data.response) {
      return response.data.response;
    } else {
      throw new Error('Invalid response from Ollama API');
    }
  } catch (error) {
    console.error('Documentation Generation Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw new Error(`Failed to generate documentation: ${error.message}`);
  }
};

/**
 * Get information about a specific model
 * @param {string} model - The model name
 * @returns {Promise<object>} - Model information
 */
exports.getModelInfo = async (model) => {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/show`, {
      params: { model }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching model info:', error);
    throw new Error(`Failed to get model info: ${error.message}`);
  }
};

/**
 * List all available models
 * @returns {Promise<Array>} - List of available models
 */
exports.listModels = async () => {
  try {
    const response = await axios.get(`${OLLAMA_API_URL}/api/tags`);
    return response.data.models || [];
  } catch (error) {
    console.error('Error listing models:', error);
    throw new Error(`Failed to list models: ${error.message}`);
  }
};