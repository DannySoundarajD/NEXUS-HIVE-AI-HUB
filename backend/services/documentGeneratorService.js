import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * DocumentGenerator service for handling code documentation generation
 */
export const DocumentGeneratorService = {
  /**
   * Generate documentation for code
   * @param {string} code - The code to document
   * @param {string} language - The programming language
   * @param {string} filename - Optional filename to save documentation
   * @param {string} model - The model to use (default: 'codegemma')
   * @returns {Promise<object>} - The generated documentation and metadata
   */
  generateDocumentation: async (code, language, filename = '', model = 'codegemma') => {
    try {
      const response = await axios.post(`${API_URL}/docgen/generate`, {
        code,
        language,
        filename,
        model
      });
      
      return response.data;
    } catch (error) {
      console.error('Error generating documentation:', error);
      throw error.response?.data || error;
    }
  },
  
  /**
   * Get available code models
   * @returns {Promise<Array>} - List of available code models
   */
  getCodeModels: async () => {
    try {
      const response = await axios.get(`${API_URL}/docgen/models`);
      return response.data.models;
    } catch (error) {
      console.error('Error fetching code models:', error);
      throw error.response?.data || error;
    }
  }
};

export default DocumentGeneratorService;