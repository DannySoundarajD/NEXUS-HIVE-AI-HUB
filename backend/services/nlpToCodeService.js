const axios = require('axios');

// Configuration for Ollama API
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434';

/**
 * Generate code from natural language description using CodeGemma
 * @param {string} description - Natural language description of the desired code
 * @param {string} language - Target programming language (e.g., 'javascript', 'python')
 * @param {string} model - The model to use (default: 'codegemma:latest')
 * @param {object} options - Additional options for the API call
 * @returns {Promise<string>} - The generated code
 */
exports.generateCodeFromDescription = async (description, language, model = 'codegemma:latest', options = {}) => {
  try {
    const prompt = `Generate ${language} code based on the following description:
    
${description}

Requirements:
1. The code should be complete and functional
2. Include appropriate error handling
3. Follow best practices for ${language}
4. Add comments to explain complex parts
5. Only return the code without any additional explanations

Please provide only the ${language} code implementation.`;

    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model,
      prompt,
      stream: false,
      ...options
    });

    if (response.data && response.data.response) {
      // Clean up the response to extract just the code
      let code = response.data.response;
      
      // If the response has markdown code blocks, extract the code
      if (code.includes('```')) {
        const codeMatch = code.match(/```(?:\w+)?\s*([\s\S]+?)```/);
        if (codeMatch && codeMatch[1]) {
          code = codeMatch[1].trim();
        }
      }
      
      return code;
    } else {
      throw new Error('Invalid response from Ollama API');
    }
  } catch (error) {
    console.error('Code Generation Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw new Error(`Failed to generate code: ${error.message}`);
  }
};

/**
 * Generate test cases for the given code
 * @param {string} code - The code to test
 * @param {string} language - Programming language of the code
 * @param {string} model - The model to use (default: 'codegemma:latest')
 * @returns {Promise<string>} - Generated test cases
 */
exports.generateTests = async (code, language, model = 'codegemma:latest') => {
  try {
    const prompt = `Given the following ${language} code, generate comprehensive test cases:
    
${code}

Please provide test cases that:
1. Cover the main functionality
2. Test edge cases
3. Include necessary setup/teardown
4. Follow testing best practices for ${language}

Return only the test code.`;

    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model,
      prompt,
      stream: false
    });

    if (response.data && response.data.response) {
      // Clean up the response to extract just the code
      let testCode = response.data.response;
      
      // If the response has markdown code blocks, extract the code
      if (testCode.includes('```')) {
        const codeMatch = testCode.match(/```(?:\w+)?\s*([\s\S]+?)```/);
        if (codeMatch && codeMatch[1]) {
          testCode = codeMatch[1].trim();
        }
      }
      
      return testCode;
    } else {
      throw new Error('Invalid response from Ollama API');
    }
  } catch (error) {
    console.error('Test Generation Error:', error.message);
    throw new Error(`Failed to generate tests: ${error.message}`);
  }
};

/**
 * Improve or refactor existing code
 * @param {string} code - The code to improve
 * @param {string} language - Programming language of the code
 * @param {string} requirements - Specific improvements requested
 * @param {string} model - The model to use (default: 'codegemma:latest')
 * @returns {Promise<string>} - Improved code
 */
exports.improveCode = async (code, language, requirements, model = 'codegemma:latest') => {
  try {
    const prompt = `Improve the following ${language} code according to these requirements:
    
${code}

Improvement requirements:
${requirements}

Return only the improved code without explanations.`;

    const response = await axios.post(`${OLLAMA_API_URL}/api/generate`, {
      model,
      prompt,
      stream: false
    });

    if (response.data && response.data.response) {
      // Clean up the response
      let improvedCode = response.data.response;
      
      // Extract code from markdown if present
      if (improvedCode.includes('```')) {
        const codeMatch = improvedCode.match(/```(?:\w+)?\s*([\s\S]+?)```/);
        if (codeMatch && codeMatch[1]) {
          improvedCode = codeMatch[1].trim();
        }
      }
      
      return improvedCode;
    } else {
      throw new Error('Invalid response from Ollama API');
    }
  } catch (error) {
    console.error('Code Improvement Error:', error.message);
    throw new Error(`Failed to improve code: ${error.message}`);
  }
};