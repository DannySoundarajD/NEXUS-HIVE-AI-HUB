const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Import API routes
const chatRoutes = require('./routes/chat');
const documentRoutes = require('./routes/document');
const codeRoutes = require('./routes/code');
const docGenRoutes = require('./routes/docGen');
const nlpToCodeRoutes = require('./routes/nlpToCode');
const codeChallengeroutes = require('./routes/codeChallenge'); // Added new route for code challenges

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// ✅ Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(uploadDir));

// ✅ Health check for Ollama API
app.get('/api/health', async (req, res) => {
  try {
    const ollamaApiUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434/api';
    const response = await axios.get(`${ollamaApiUrl.replace('/api', '')}/api/tags`);
    
    // Check if required models are available
    const hasGemma = response.data.models && 
                     response.data.models.some(model => model.name.includes('gemma'));
    const hasCodeGemma = response.data.models && 
                         response.data.models.some(model => model.name.includes('codegemma'));
    
    res.status(200).json({ 
      status: 'ok', 
      ollama: response.data,
      gemmaAvailable: hasGemma,
      codeGemmaAvailable: hasCodeGemma
    });
  } catch (error) {
    console.error("❌ Ollama health check failed:", error.message);
    res.status(500).json({ 
      status: 'error', 
      message: 'Ollama is not responding',
      error: error.message
    });
  }
});

// ✅ API Routes
app.use('/api/chat', chatRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/code/', codeRoutes);
app.use('/api/docgen', docGenRoutes);
app.use('/api/nlptocode', nlpToCodeRoutes);
app.use('/api/codechallenge', codeChallengeroutes);  // Added route for code challenges

// ✅ Serve static files from the frontend build directory for production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendPath));
  
  // For any routes not matching the API routes, serve the frontend
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
}

// ✅ WebSocket setup
require('./websocket/socket')(io);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// ✅ 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 NexusHive AI server running on port ${PORT}`);
  console.log(`📝 Document processing powered by Gemma model`);
  console.log(`📚 Code documentation powered by CodeGemma model`);
  console.log(`💬 NLP to Code conversion powered by CodeGemma model`);
  console.log(`🧩 Code Challenges powered by CodeGemma model`);
  console.log(`🔗 Ollama API: ${process.env.OLLAMA_API_URL || 'http://localhost:11434/api'}`);
});

// ✅ Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = { app, server };