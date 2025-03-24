const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Helper function to handle errors
const handleError = (error, operation, res) => {
  console.error(`Error ${operation}:`, error);
  
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

// Get all challenges
router.get('/', (req, res) => {
  try {
    // Path to the challenges file - update this path as needed
    const challengesPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'app', 'data', 'codeController.json');
    
    // Check if file exists
    if (!fs.existsSync(challengesPath)) {
      return res.status(404).json({ error: "Challenges file not found" });
    }
    
    // Read and parse the file
    const challengesData = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));
    
    res.json(challengesData);
  } catch (error) {
    handleError(error, "get challenges", res);
  }
});

// Get a specific challenge by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    // Path to the challenges file
    const challengesPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'app', 'data', 'codeController.json');
    
    // Check if file exists
    if (!fs.existsSync(challengesPath)) {
      return res.status(404).json({ error: "Challenges file not found" });
    }
    
    // Read and parse the file
    const challengesData = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));
    
    // Find the challenge with the matching ID
    const challenge = challengesData.find(c => c.id === id);
    
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    
    res.json(challenge);
  } catch (error) {
    handleError(error, "get challenge", res);
  }
});

// Evaluate a solution for a challenge
router.post('/evaluate', async (req, res) => {
  const { code, challengeId, language, model = 'codegemma:7b' } = req.body;
  
  if (!code || !challengeId) {
    return res.status(400).json({ error: "Code and challengeId are required" });
  }
  
  try {
    // Get the challenge details first
    const challengesPath = path.join(__dirname, '..', '..', 'frontend', 'src', 'app', 'data', 'codeController.json');
    
    if (!fs.existsSync(challengesPath)) {
      return res.status(404).json({ error: "Challenges file not found" });
    }
    
    const challengesData = JSON.parse(fs.readFileSync(challengesPath, 'utf8'));
    const challenge = challengesData.find(c => c.id === challengeId);
    
    if (!challenge) {
      return res.status(404).json({ error: "Challenge not found" });
    }
    
    console.log(`[${new Date().toISOString()}] evaluate request for challenge ${challengeId} using model ${model}`);
    
    const systemPrompt = "You are an expert code evaluator. Respond in markdown format with code blocks.";
    const prompt = `${systemPrompt}\n\nEvaluate this ${language || challenge.language} solution for the following coding challenge:
      
Challenge: ${challenge.title}
Description: ${challenge.description}
${challenge.testCases ? `Test Cases: ${challenge.testCases}` : ''}

User's Solution:
\`\`\`${language || challenge.language}
${code}
\`\`\`

Provide a detailed evaluation including:
1. Correctness: Does the solution solve the problem correctly? Check against the test cases.
2. Efficiency: Analyze the time and space complexity
3. Code quality: Is the code well-structured, readable, and maintainable?
4. Suggested improvements (if any)
5. Alternative approaches (if applicable)

If there are bugs or issues, explain them clearly and provide corrected code.`;
    
    const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
        model: model,
        prompt: prompt,
        stream: false
    });
    
    console.log(`[${new Date().toISOString()}] evaluation response received from Ollama`);
    
    return res.json({ 
        evaluation: ollamaResponse.data.response,
        model: model,
        processingTime: ollamaResponse.data.total_duration,
        challenge: {
          id: challenge.id,
          title: challenge.title
        }
    });
  } catch (error) {
    return handleError(error, "evaluate solution", res);
  }
});

// Analyze code solution (matches what frontend expects)
router.post('/analyze', async (req, res) => {
  const { code, language, model = 'codegemma:7b', challenge } = req.body;
  
  if (!code || !challenge || !challenge.id) {
    return res.status(400).json({ error: "Code and challenge information are required" });
  }
  
  try {
    console.log(`[${new Date().toISOString()}] analyze request for challenge ${challenge.id} using model ${model}`);
    
    const systemPrompt = "You are an expert code analyzer. Provide a simple yes/no answer on code execution success.";
    const prompt = `${systemPrompt}\n\nAnalyze this ${language} solution for the following coding challenge:
      
Challenge: ${challenge.title}
Description: ${challenge.description}
${challenge.testCases ? `Test Cases: ${challenge.testCases}` : ''}

User's Solution:
\`\`\`${language}
${code}
\`\`\`

Reply with ONLY the following JSON format:
{
  "success": true/false,
  "message": "A one-sentence explanation of why the code succeeded or failed"
}
`;
    
    const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
        model: model,
        prompt: prompt,
        stream: false
    });
    
    console.log(`[${new Date().toISOString()}] analysis response received from Ollama`);
    
    // Parse JSON from Ollama response
    let parsedResult;
    try {
      // Extract JSON from the response (handling potential markdown formatting)
      const responseText = ollamaResponse.data.response;
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/{[\s\S]*}/);
                       
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : responseText;
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Error parsing Ollama response:', parseError);
      // Fallback if parsing fails
      parsedResult = {
        success: false,
        message: "Unable to determine code execution status"
      };
    }
    
    return res.json({ 
        success: parsedResult.success,
        message: parsedResult.message,
        model: model,
        processingTime: ollamaResponse.data.total_duration
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze solution"
    });
  }
});
module.exports = router;



