const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        console.log("Received message:", message);

        // Send request to Ollama API with the correct format
        const ollamaResponse = await axios.post("http://localhost:11434/api/generate", {
            model: "codegemma:7b",  // Ensure you use the correct model name
            prompt: message,
            stream: false
        });

        console.log("Ollama Response:", ollamaResponse.data);

        // Extract the correct response field
        return res.json({ response: ollamaResponse.data.response });
    } catch (error) {
        console.error("Error processing message:", error.message);
        return res.status(500).json({ error: "Failed to process message", details: error.message });
    }
});

module.exports = router;
