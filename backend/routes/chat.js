const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
    try {
        const { message, model = 'codegemma:7b' } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        console.log("Received message:", message);
        console.log("Using model:", model);

        // Send request to Ollama API with the selected model
        const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
            model: model,  // Use the model from the request
            prompt: message,
            stream: false
        }, {
            // Add timeout to prevent hanging requests
            timeout: 60000
        });

        console.log("Ollama Response status:", ollamaResponse.status);

        // Extract the correct response field
        return res.json({ 
            response: ollamaResponse.data.response || "No response received",
            model: model
        });
    } catch (error) {
        console.error("Error processing message:", error.message);
        
        // Check if it's a timeout error
        if (error.code === 'ECONNABORTED') {
            return res.status(504).json({ 
                error: "Request timed out", 
                details: "The AI model took too long to respond"
            });
        }
        
        // Check if it's a connection error
        if (error.code === 'ECONNREFUSED') {
            return res.status(503).json({ 
                error: "Cannot connect to AI service", 
                details: "Make sure Ollama is running on port 11434"
            });
        }
        
        return res.status(500).json({ 
            error: "Failed to process message", 
            details: error.message 
        });
    }
});

module.exports = router;