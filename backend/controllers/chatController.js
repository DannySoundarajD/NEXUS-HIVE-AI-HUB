// controllers/chatController.js
const ollamaService = require('../services/ollamaService');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Process text message
exports.sendTextMessage = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Format conversation history for context if provided
    let prompt = message;
    if (conversationHistory && conversationHistory.length > 0) {
      prompt = conversationHistory.map(msg => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n') + `\nUser: ${message}\nAssistant:`;
    }

    const response = await ollamaService.generateText(prompt);
    
    return res.status(200).json({ response });
  } catch (error) {
    console.error('Error processing chat message:', error);
    return res.status(500).json({ error: 'Failed to process message' });
  }
};

// Process voice input
exports.processVoiceInput = async (req, res) => {
  try {
    const audioFile = req.file;
    
    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' });
    }
    
    // Path to the uploaded audio file
    const audioPath = audioFile.path;
    
    // Use Whisper model to transcribe audio
    const transcription = await ollamaService.transcribeAudio(audioPath);
    
    if (!transcription) {
      return res.status(500).json({ error: 'Failed to transcribe audio' });
    }
    
    // Generate response using the transcribed text
    const response = await ollamaService.generateText(transcription);
    
    // Clean up the audio file
    fs.unlinkSync(audioPath);
    
    return res.status(200).json({ 
      transcription, 
      response 
    });
  } catch (error) {
    console.error('Error processing voice input:', error);
    return res.status(500).json({ error: 'Failed to process voice input' });
  }
};