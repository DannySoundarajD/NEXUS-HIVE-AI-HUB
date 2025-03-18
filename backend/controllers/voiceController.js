const ollamaService = require('../services/ollamaService');
const fs = require('fs');
const { spawn } = require('child_process');

// Process voice input
exports.processVoiceInput = async (req, res) => {
  try {
    const audioFile = req.file;

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    console.log("🔹 Processing voice input...");

    // Convert speech to text using Whisper model
    const transcription = await transcribeAudio(audioFile.path);

    if (!transcription) {
      return res.status(500).json({ error: 'Failed to transcribe audio' });
    }

    console.log("✅ Transcription:", transcription);

    // Send transcribed text to AI model
    const response = await ollamaService.generateText(transcription);

    console.log("✅ AI Response:", response);

    // Clean up the uploaded audio file
    fs.unlinkSync(audioFile.path);

    return res.status(200).json({
      transcription,
      response
    });
  } catch (error) {
    console.error("❌ Error processing voice input:", error);
    return res.status(500).json({ error: 'Failed to process voice input' });
  }
};

// Function to transcribe audio using Whisper ASR
async function transcribeAudio(filePath) {
  return new Promise((resolve, reject) => {
    const process = spawn('whisper', [filePath, '--model', 'base']);

    let transcription = '';
    process.stdout.on('data', (data) => transcription += data.toString());
    process.stderr.on('data', (data) => console.error("❌ Whisper Error:", data.toString()));

    process.on('close', (code) => {
      if (code === 0) {
        resolve(transcription.trim());
      } else {
        reject("Whisper transcription failed.");
      }
    });
  });
}
